import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createIndexedDbChapterRepository } from '@/repositories/indexedDb/chapterRepository'
import {
  CHAPTERS_STORE,
  getStore,
  openDb,
  requestToPromise,
  transactionDone,
} from '@/repositories/indexedDb/db'
import { createIndexedDbStoryRepository } from '@/repositories/indexedDb/storyRepository'
import type {
  ChapterRepository,
  StoryRepository,
  UpdateChapterRepositoryInput,
} from '@/repositories/types'
import type { Chapter, Story } from '@/services/types'
import {
  deleteTestDatabase,
  installFakeIndexedDb,
} from '@/test/indexedDb'

let chapters: ChapterRepository
let stories: StoryRepository

beforeEach(() => {
  installFakeIndexedDb()
  chapters = createIndexedDbChapterRepository()
  stories = createIndexedDbStoryRepository()
})

afterEach(async () => {
  vi.restoreAllMocks()
  await deleteTestDatabase()
})

describe('indexedDbChapterRepository', () => {
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

  it('validates story, parent, and cycle integrity inside writes', async () => {
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

  it('rejects a second intro chapter for the same story', async () => {
    const story = createStory({ id: 'story-1' })
    const intro = createChapter({ id: 'chapter-intro', storyId: story.id })

    await stories.insertStory(story)
    await chapters.insertChapter(intro)

    await expect(
      chapters.insertChapter(
        createChapter({ id: 'chapter-second-intro', storyId: story.id }),
      ),
    ).rejects.toThrow('already has an intro chapter')
  })

  it('chooses the earliest intro chapter when legacy data contains duplicates', async () => {
    const story = createStory({ id: 'story-1' })
    const laterIntro = createChapter({
      id: 'chapter-later',
      storyId: story.id,
      createdAt: 100,
    })
    const earliestIntro = createChapter({
      id: 'chapter-earliest',
      storyId: story.id,
      createdAt: 50,
    })
    const sameTimeLaterById = createChapter({
      id: 'chapter-z',
      storyId: story.id,
      createdAt: 50,
    })
    const child = createChapter({
      id: 'chapter-child',
      parentChapterId: laterIntro.id,
      storyId: story.id,
    })

    await stories.insertStory(story)

    const db = await openDb()
    const { store, transaction } = getStore(db, CHAPTERS_STORE, 'readwrite')
    await requestToPromise(store.add(laterIntro))
    await requestToPromise(store.add(earliestIntro))
    await requestToPromise(store.add(sameTimeLaterById))
    await requestToPromise(store.add(child))
    await transactionDone(transaction)
    db.close()

    await expect(chapters.findIntroChapterByStoryId(story.id)).resolves.toEqual(
      earliestIntro,
    )
  })

  it('rejects explicit undefined parent patches when they would create a second intro', async () => {
    const story = createStory({ id: 'story-1' })
    const parent = createChapter({ id: 'chapter-parent', storyId: story.id })
    const child = createChapter({
      id: 'chapter-child',
      parentChapterId: parent.id,
      storyId: story.id,
    })

    await stories.insertStory(story)
    await chapters.insertChapter(parent)
    await chapters.insertChapter(child)

    const patch = {
      parentChapterId: undefined,
      updatedAt: 300,
    } as unknown as UpdateChapterRepositoryInput

    await expect(chapters.updateChapter(child.id, patch)).rejects.toThrow(
      'already has an intro chapter',
    )
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
