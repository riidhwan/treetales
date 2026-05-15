import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import type { PGliteInterface } from '@electric-sql/pglite'

import { createPgliteStoryRepository } from '@/repositories/pglite/storyRepository'
import type { StoryRepository } from '@/repositories/types'
import type { Story } from '@/services/types'
import { createTestPgliteDb } from '@/test/pglite'

let db: PGliteInterface
let stories: StoryRepository

beforeAll(async () => {
  db = await createTestPgliteDb()
  stories = createPgliteStoryRepository(db)
})

afterEach(async () => {
  vi.restoreAllMocks()
  await db.query('DELETE FROM stories')
})

afterAll(async () => {
  await db.close()
})

beforeEach(async () => {
  await db.query('DELETE FROM stories')
})

describe('pglite storyRepository', () => {
  it('inserts, reads, updates, and deletes stories', async () => {
    const story = createStory({
      id: '00000000-0000-4000-8000-000000000001',
      title: 'The Root',
      description: 'A branching tale',
    })

    await stories.insertStory(story)

    await expect(stories.findStoryById(story.id)).resolves.toEqual(story)
    await expect(stories.findStories()).resolves.toEqual([story])
    const updatedStory = await stories.updateStory(story.id, {
      title: 'The Canopy',
      updatedAt: 250,
    })

    expect(updatedStory).toEqual({
      ...story,
      title: 'The Canopy',
      updatedAt: 250,
    })
    await expect(stories.findStoryById(story.id)).resolves.toEqual(updatedStory)
    await expect(stories.deleteStory(story.id)).resolves.toBe(true)
    await expect(stories.findStoryById(story.id)).resolves.toBeUndefined()
    await expect(stories.deleteStory(story.id)).resolves.toBe(false)
  })

  it('returns undefined when updating a missing story', async () => {
    await expect(
      stories.updateStory('missing-story', {
        title: 'No story',
        updatedAt: 100,
      }),
    ).resolves.toBeUndefined()
  })

  it('sorts stories by creation time and then id', async () => {
    const secondById = createStory({
      id: '00000000-0000-4000-8000-00000000000b',
      title: 'Second',
      description: 'Same time',
    })
    const firstById = createStory({
      id: '00000000-0000-4000-8000-00000000000a',
      title: 'First',
      description: 'Same time',
    })
    const firstByDate = createStory({
      id: '00000000-0000-4000-8000-00000000000c',
      title: 'Earlier',
      description: 'Earlier time',
      createdAt: 50,
      updatedAt: 50,
    })

    await stories.insertStory(secondById)
    await stories.insertStory(firstById)
    await stories.insertStory(firstByDate)

    await expect(stories.findStories()).resolves.toEqual([
      firstByDate,
      firstById,
      secondById,
    ])
  })

  it('deletes chapters through the story cascade', async () => {
    const story = createStory({
      id: 'story-1',
      title: 'Branching',
      description: 'One story',
    })
    const otherStory = createStory({
      id: 'story-2',
      title: 'Separate',
      description: 'Another story',
    })

    await stories.insertStory(story)
    await stories.insertStory(otherStory)

    await db.query(
      `
        INSERT INTO chapters (
          id,
          story_id,
          title,
          content,
          parent_chapter_id,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      ['chapter-1', story.id, 'Start', 'Go', null, 100, 100],
    )
    await db.query(
      `
        INSERT INTO chapters (
          id,
          story_id,
          title,
          content,
          parent_chapter_id,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      ['chapter-2', otherStory.id, 'Keep', 'Remain', null, 100, 100],
    )

    await expect(stories.deleteStory(story.id)).resolves.toBe(true)

    const chapterResult = await db.query<{ readonly id: string }>(
      'SELECT id FROM chapters ORDER BY id',
    )

    expect(chapterResult.rows).toEqual([{ id: 'chapter-2' }])
  })
})

function createStory({
  id,
  title,
  description,
  createdAt = 100,
  updatedAt = createdAt,
}: Partial<Story> & Pick<Story, 'id' | 'title' | 'description'>): Story {
  return {
    id,
    title,
    description,
    createdAt,
    updatedAt,
  }
}
