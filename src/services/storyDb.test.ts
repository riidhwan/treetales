import { IDBFactory } from 'fake-indexeddb'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createChapter,
  getChapterById,
  getChaptersByStoryId,
} from '@/services/chapterDb'
import { DB_NAME } from '@/services/db'
import {
  createStory,
  deleteStory,
  getStories,
  getStoryById,
  updateStory,
} from '@/services/storyDb'

describe('storyDb', () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await deleteDatabase()
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
      parentChapterIds: [],
    })
    const otherChapter = await createChapter({
      storyId: otherStory.id,
      title: 'Keep',
      content: 'Remain',
      parentChapterIds: [],
    })

    await expect(deleteStory(story.id)).resolves.toBe(true)

    await expect(getChapterById(chapter.id)).resolves.toBeUndefined()
    await expect(getChapterById(otherChapter.id)).resolves.toEqual(otherChapter)
    await expect(getChaptersByStoryId(story.id)).resolves.toEqual([])
  })
})

function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to delete test database.'))
    }

    request.onblocked = () => {
      reject(new Error('Test database deletion was blocked.'))
    }
  })
}
