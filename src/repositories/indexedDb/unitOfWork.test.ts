import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createIndexedDbChapterRepository } from '@/repositories/indexedDb/chapterRepository'
import { createIndexedDbStoryRepository } from '@/repositories/indexedDb/storyRepository'
import { createIndexedDbRepositoryUnitOfWork } from '@/repositories/indexedDb/unitOfWork'
import type { ChapterRepository, StoryRepository } from '@/repositories/types'
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

describe('indexedDbRepositoryUnitOfWork', () => {
  it('commits multi-repository writes together', async () => {
    const unitOfWork = createIndexedDbRepositoryUnitOfWork()
    const story = createStory({ id: 'story-1' })
    const chapter = createChapter({ id: 'chapter-1', storyId: story.id })

    await stories.insertStory(story)
    await chapters.insertChapter(chapter)

    await expect(
      unitOfWork.run(async (repositories) => {
        await repositories.chapters.deleteChapter(chapter.id, {
          unlinkedChildrenUpdatedAt: 250,
        })

        return repositories.stories.deleteStory(story.id)
      }),
    ).resolves.toBe(true)

    await expect(stories.findStoryById(story.id)).resolves.toBeUndefined()
    await expect(chapters.findChapterById(chapter.id)).resolves.toBeUndefined()
  })

  it('rolls back multi-repository writes when the operation fails', async () => {
    const unitOfWork = createIndexedDbRepositoryUnitOfWork()
    const story = createStory({ id: 'story-1' })
    const chapter = createChapter({ id: 'chapter-1', storyId: story.id })

    await stories.insertStory(story)
    await chapters.insertChapter(chapter)

    await expect(
      unitOfWork.run(async (repositories) => {
        await repositories.chapters.deleteChapter(chapter.id, {
          unlinkedChildrenUpdatedAt: 250,
        })

        throw new Error('stop before deleting the story')
      }),
    ).rejects.toThrow('stop before deleting the story')

    await expect(stories.findStoryById(story.id)).resolves.toEqual(story)
    await expect(chapters.findChapterById(chapter.id)).resolves.toEqual(chapter)
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
