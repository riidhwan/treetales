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

import { createPgliteChapterRepository } from '@/repositories/pglite/chapterRepository'
import { createPgliteStoryRepository } from '@/repositories/pglite/storyRepository'
import type { ChapterRepository, StoryRepository } from '@/repositories/types'
import type { Chapter, Story } from '@/services/types'
import { createTestPgliteDb } from '@/test/pglite'

let db: PGliteInterface
let chapters: ChapterRepository
let stories: StoryRepository

beforeAll(async () => {
  db = await createTestPgliteDb()
  chapters = createPgliteChapterRepository(db)
  stories = createPgliteStoryRepository(db)
})

beforeEach(async () => {
  await db.query('DELETE FROM stories')
})

afterEach(async () => {
  vi.restoreAllMocks()
  await db.query('DELETE FROM stories')
})

afterAll(async () => {
  await db.close()
})

describe('pglite chapterRepository', () => {
  it('inserts, reads, updates, and deletes chapters', async () => {
    const story = createStory({ id: 'story-1' })
    const intro = createChapter({
      id: 'chapter-1',
      storyId: story.id,
      parentChapterId: null,
    })

    await stories.insertStory(story)
    await chapters.insertChapter(intro)

    await expect(chapters.findChapterById(intro.id)).resolves.toEqual(intro)
    await expect(chapters.findIntroChapterByStoryId(story.id)).resolves.toEqual(
      intro,
    )

    const updatedChapter = await chapters.updateChapter(intro.id, {
      title: 'Awakening',
      updatedAt: 250,
    })

    expect(updatedChapter).toEqual({
      ...intro,
      title: 'Awakening',
      updatedAt: 250,
    })
    await expect(
      chapters.deleteChapter(intro.id, { unlinkedChildrenUpdatedAt: 300 }),
    ).resolves.toBe(true)
    await expect(chapters.findChapterById(intro.id)).resolves.toBeUndefined()
    await expect(
      chapters.deleteChapter(intro.id, { unlinkedChildrenUpdatedAt: 400 }),
    ).resolves.toBe(false)
  })

  it('sorts story chapters and child chapters by creation time then id', async () => {
    const story = createStory({ id: 'story-1' })
    const root = createChapter({
      id: 'chapter-root',
      storyId: story.id,
      createdAt: 100,
    })
    const secondById = createChapter({
      id: 'chapter-b',
      storyId: story.id,
      parentChapterId: root.id,
      createdAt: 200,
    })
    const firstById = createChapter({
      id: 'chapter-a',
      storyId: story.id,
      parentChapterId: root.id,
      createdAt: 200,
    })
    const firstByDate = createChapter({
      id: 'chapter-c',
      storyId: story.id,
      parentChapterId: root.id,
      createdAt: 50,
    })

    await stories.insertStory(story)
    await chapters.insertChapter(root)
    await chapters.insertChapter(secondById)
    await chapters.insertChapter(firstById)
    await chapters.insertChapter(firstByDate)

    await expect(chapters.findChaptersByStoryId(story.id)).resolves.toEqual([
      firstByDate,
      root,
      firstById,
      secondById,
    ])
    await expect(chapters.findChildChapters(root.id)).resolves.toEqual([
      firstByDate,
      firstById,
      secondById,
    ])
  })

  it('validates story, parent, and cycle integrity inside write transactions', async () => {
    const story = createStory({ id: 'story-1' })
    const otherStory = createStory({ id: 'story-2' })
    const root = createChapter({ id: 'chapter-root', storyId: story.id })
    const middle = createChapter({
      id: 'chapter-middle',
      storyId: story.id,
      parentChapterId: root.id,
    })
    const ending = createChapter({
      id: 'chapter-ending',
      storyId: story.id,
      parentChapterId: middle.id,
    })
    const otherRoot = createChapter({
      id: 'chapter-other',
      storyId: otherStory.id,
    })

    await stories.insertStory(story)
    await stories.insertStory(otherStory)
    await chapters.insertChapter(root)
    await chapters.insertChapter(middle)
    await chapters.insertChapter(ending)
    await chapters.insertChapter(otherRoot)

    await expect(
      chapters.insertChapter(
        createChapter({ id: 'chapter-missing-story', storyId: 'missing' }),
      ),
    ).rejects.toThrow('does not exist')
    await expect(
      chapters.insertChapter(
        createChapter({
          id: 'chapter-missing-parent',
          storyId: story.id,
          parentChapterId: 'missing-parent',
        }),
      ),
    ).rejects.toThrow('does not exist in story')
    await expect(
      chapters.updateChapter(root.id, {
        parentChapterId: otherRoot.id,
        updatedAt: 300,
      }),
    ).rejects.toThrow('does not exist in story')
    await expect(
      chapters.updateChapter(root.id, {
        parentChapterId: root.id,
        updatedAt: 300,
      }),
    ).rejects.toThrow('parent itself')
    await expect(
      chapters.updateChapter(root.id, {
        parentChapterId: ending.id,
        updatedAt: 300,
      }),
    ).rejects.toThrow('cycles')
  })

  it('clears direct child parents when deleting a chapter', async () => {
    const story = createStory({ id: 'story-1' })
    const root = createChapter({ id: 'chapter-root', storyId: story.id })
    const child = createChapter({
      id: 'chapter-child',
      storyId: story.id,
      parentChapterId: root.id,
    })
    const grandchild = createChapter({
      id: 'chapter-grandchild',
      storyId: story.id,
      parentChapterId: child.id,
    })

    await stories.insertStory(story)
    await chapters.insertChapter(root)
    await chapters.insertChapter(child)
    await chapters.insertChapter(grandchild)

    await expect(
      chapters.deleteChapter(root.id, { unlinkedChildrenUpdatedAt: 500 }),
    ).resolves.toBe(true)

    await expect(chapters.findChapterById(child.id)).resolves.toMatchObject({
      parentChapterId: null,
      updatedAt: 500,
    })
    await expect(
      chapters.findChapterById(grandchild.id),
    ).resolves.toMatchObject({
      parentChapterId: child.id,
    })
  })

  it('uses the partial unique intro chapter index from the schema', async () => {
    const story = createStory({ id: 'story-1' })

    await stories.insertStory(story)
    await chapters.insertChapter(
      createChapter({ id: 'chapter-intro', storyId: story.id }),
    )

    await expect(
      chapters.insertChapter(
        createChapter({ id: 'chapter-second-intro', storyId: story.id }),
      ),
    ).rejects.toThrow()
  })
})

function createStory({
  id,
  title = 'Story',
  description = 'Description',
  createdAt = 100,
  updatedAt = createdAt,
}: Partial<Story> & Pick<Story, 'id'>): Story {
  return {
    id,
    title,
    description,
    createdAt,
    updatedAt,
  }
}

function createChapter({
  id,
  storyId,
  title = 'Chapter',
  content = 'Once',
  parentChapterId = null,
  createdAt = 100,
  updatedAt = createdAt,
}: Partial<Chapter> & Pick<Chapter, 'id' | 'storyId'>): Chapter {
  return {
    id,
    storyId,
    title,
    content,
    parentChapterId,
    createdAt,
    updatedAt,
  }
}
