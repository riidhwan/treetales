import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  createOrReuseExampleStoryCopy,
  listBuiltInExampleStories,
} from '@/services/builtInExampleStories'
import { deleteStory, getStories, getStoryById } from '@/services/storyService'
import { deleteTestDatabase, installFakeIndexedDb } from '@/test/indexedDb'

describe('builtInExampleStories', () => {
  beforeAll(() => {
    installFakeIndexedDb()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await deleteTestDatabase()
  })

  it('lists starter summaries in authored catalog order without chapter fixtures', () => {
    const starters = listBuiltInExampleStories()

    expect(starters.map((starter) => starter.id)).toEqual([
      'bee-man-of-orn',
      'magicians-gifts',
      'wonderful-toymaker',
    ])
    expect(starters[0]).toEqual({
      id: 'bee-man-of-orn',
      title: 'The Bee-Man of Orn',
      description:
        'A wandering bee-keeper follows an old prophecy toward an unexpected identity.',
      storyProvenance: {
        sourceWorks: [
          {
            title: 'The Bee-Man of Orn',
            author: 'Frank R. Stockton',
            publication:
              'The Bee-Man of Orn and Other Fanciful Tales, first published 1887',
            publicDomainBasis:
              'Project Gutenberg eBook #12067, public domain in the USA.',
          },
        ],
        adaptationNote:
          'Adapted into a branching TreeTales starter from the source premise.',
        displayText:
          'Adapted from "The Bee-Man of Orn" by Frank R. Stockton, first published 1887.',
      },
    })
    expect('chapters' in starters[0]).toBe(false)
  })

  it('returns not-found for an unknown starter id', async () => {
    await expect(
      createOrReuseExampleStoryCopy('missing-starter'),
    ).resolves.toEqual({
      status: 'not-found',
    })
  })

  it('creates an editable example story copy with generated local ids and provenance', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100)
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000001')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000002')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000003')

    const result = await createOrReuseExampleStoryCopy('bee-man-of-orn')

    expect(result.status).toBe('created')

    if (result.status !== 'created') {
      throw new Error('Expected created result.')
    }

    expect(result.story).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      title: 'The Bee-Man of Orn',
      description:
        'A wandering bee-keeper follows an old prophecy toward an unexpected identity.',
      builtInExampleStoryId: 'bee-man-of-orn',
      storyProvenance: {
        sourceWorks: [
          {
            title: 'The Bee-Man of Orn',
            author: 'Frank R. Stockton',
            publication:
              'The Bee-Man of Orn and Other Fanciful Tales, first published 1887',
            publicDomainBasis:
              'Project Gutenberg eBook #12067, public domain in the USA.',
          },
        ],
        adaptationNote:
          'Adapted into a branching TreeTales starter from the source premise.',
        displayText:
          'Adapted from "The Bee-Man of Orn" by Frank R. Stockton, first published 1887.',
      },
      createdAt: 100,
      updatedAt: 100,
    })
    expect(result.chapters).toEqual([
      {
        id: '00000000-0000-4000-8000-000000000002',
        storyId: result.story.id,
        title: 'The Bee-Man and the Junior Sorcerer',
        content:
          'The Bee-Man keeps his hives outside Orn until a junior sorcerer arrives with news that his shape may not be his own.',
        parentChapterId: null,
        createdAt: 100,
        updatedAt: 100,
      },
      {
        id: '00000000-0000-4000-8000-000000000003',
        storyId: result.story.id,
        title: 'Toward the Great Wizard',
        content:
          'The road away from Orn promises answers, but every traveler seems to carry a different warning about what a true shape costs.',
        parentChapterId: '00000000-0000-4000-8000-000000000002',
        createdAt: 101,
        updatedAt: 101,
      },
    ])
    await expect(getStories()).resolves.toEqual([result.story])
  })

  it('reuses an existing example story copy without changing timestamps or duplicate chapters', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100)
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000001')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000002')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000003')

    const created = await createOrReuseExampleStoryCopy('bee-man-of-orn')
    const reused = await createOrReuseExampleStoryCopy('bee-man-of-orn')

    expect(created.status).toBe('created')
    expect(reused.status).toBe('reused')

    if (created.status !== 'created' || reused.status !== 'reused') {
      throw new Error('Expected created then reused results.')
    }

    expect(reused.story).toEqual(created.story)
    expect(reused.chapters).toEqual(created.chapters)
    expect(reused.story.updatedAt).toBe(100)
    await expect(getStories()).resolves.toEqual([created.story])
  })

  it('creates a fresh copy from the catalog after deleting the previous copy', async () => {
    let now = 100
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000001')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000002')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000003')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000004')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000005')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000006')
    const created = await createOrReuseExampleStoryCopy('bee-man-of-orn')

    if (created.status !== 'created') {
      throw new Error('Expected created result.')
    }

    await deleteStory(created.story.id)
    now = 500

    const recreated = await createOrReuseExampleStoryCopy('bee-man-of-orn')

    expect(recreated.status).toBe('created')

    if (recreated.status !== 'created') {
      throw new Error('Expected recreated result.')
    }

    expect(recreated.story.id).toBe('00000000-0000-4000-8000-000000000004')
    expect(recreated.story.createdAt).toBe(500)
    expect(recreated.story.builtInExampleStoryId).toBe('bee-man-of-orn')
    await expect(getStoryById(created.story.id)).resolves.toBeUndefined()
  })
})
