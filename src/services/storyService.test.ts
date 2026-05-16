import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  createChapter,
  getChapterById,
  getChaptersByStoryId,
} from '@/services/chapterService'
import {
  createStory,
  deleteStory,
  getStories,
  getStoryById,
  updateStory,
} from '@/services/storyService'
import { deleteTestDatabase, installFakeIndexedDb } from '@/test/indexedDb'

describe('storyService', () => {
  beforeAll(() => {
    installFakeIndexedDb()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await deleteTestDatabase()
  })

  it('creates, reads, updates, and deletes stories', async () => {
    let now = 100
    vi.spyOn(Date, 'now').mockImplementation(() => now)

    const story = await createStory({
      title: 'The Root',
      description: 'A branching tale',
    })

    expect(story).toMatchObject({
      title: 'The Root',
      description: 'A branching tale',
      createdAt: 100,
      updatedAt: 100,
    })
    expect(story.id).toEqual(expect.any(String))
    await expect(getStoryById(story.id)).resolves.toEqual(story)
    await expect(getStories()).resolves.toEqual([story])

    now = 250
    const updatedStory = await updateStory(story.id, {
      title: 'The Canopy',
    })

    expect(updatedStory).toEqual({
      ...story,
      title: 'The Canopy',
      updatedAt: 250,
    })
    await expect(getStoryById(story.id)).resolves.toEqual(updatedStory)
    await expect(deleteStory(story.id)).resolves.toBe(true)
    await expect(getStoryById(story.id)).resolves.toBeUndefined()
    await expect(deleteStory(story.id)).resolves.toBe(false)
  })

  it('deletes chapters that belong to a deleted story', async () => {
    const story = await createStory({
      title: 'Branching',
      description: 'One story',
    })
    const otherStory = await createStory({
      title: 'Separate',
      description: 'Another story',
    })
    const chapter = await createChapter({
      storyId: story.id,
      title: 'Start',
      content: 'Go',
      parentChapterId: null,
    })
    const otherChapter = await createChapter({
      storyId: otherStory.id,
      title: 'Keep',
      content: 'Remain',
      parentChapterId: null,
    })

    await expect(deleteStory(story.id)).resolves.toBe(true)

    await expect(getChapterById(chapter.id)).resolves.toBeUndefined()
    await expect(getChapterById(otherChapter.id)).resolves.toEqual(otherChapter)
    await expect(getChaptersByStoryId(story.id)).resolves.toEqual([])
  })

  it('returns undefined when updating a missing story', async () => {
    await expect(
      updateStory('missing-story', { title: 'No story' }),
    ).resolves.toBeUndefined()
  })

  it('sorts stories by creation time and then id', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100)
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-4000-8000-00000000000b')
      .mockReturnValueOnce('00000000-0000-4000-8000-00000000000a')
      .mockReturnValueOnce('00000000-0000-4000-8000-00000000000c')

    const secondById = await createStory({
      title: 'Second',
      description: 'Same time',
    })
    const firstById = await createStory({
      title: 'First',
      description: 'Same time',
    })

    vi.spyOn(Date, 'now').mockReturnValue(50)
    const firstByDate = await createStory({
      title: 'Earlier',
      description: 'Earlier time',
    })

    await expect(getStories()).resolves.toEqual([
      firstByDate,
      firstById,
      secondById,
    ])
  })
})
