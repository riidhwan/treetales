import { createIndexedDbStoryRepository } from '@/repositories/indexedDb/storyRepository'
import {
  CHAPTERS_STORE,
  CHAPTER_STORY_ID_INDEX,
  STORIES_STORE,
  openDb,
  requestToPromise,
  typedRequest,
  transactionDone,
} from '@/repositories/indexedDb/db'
import type {
  Chapter,
  CreateStoryInput,
  Story,
  UpdateStoryInput,
} from '@/services/types'

const storyRepository = createIndexedDbStoryRepository()

export async function createStory(input: CreateStoryInput): Promise<Story> {
  const now = Date.now()
  const story: Story = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  }

  await storyRepository.insertStory(story)

  return story
}

export function getStories(): Promise<Story[]> {
  return storyRepository.findStories()
}

export function getStoryById(id: string): Promise<Story | undefined> {
  return storyRepository.findStoryById(id)
}

export function updateStory(
  id: string,
  input: UpdateStoryInput,
): Promise<Story | undefined> {
  return storyRepository.updateStory(id, {
    ...input,
    updatedAt: Date.now(),
  })
}

// Temporary legacy path until repository unit-of-work support lands in #71.
export async function deleteStory(id: string): Promise<boolean> {
  const db = await openDb()

  try {
    const transaction = db.transaction(
      [STORIES_STORE, CHAPTERS_STORE],
      'readwrite',
    )
    const storiesStore = transaction.objectStore(STORIES_STORE)
    const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
    const chapterStoryIndex = chaptersStore.index(CHAPTER_STORY_ID_INDEX)
    const story = await requestToPromise(
      typedRequest<Story | undefined>(storiesStore.get(id)),
    )

    if (!story) {
      await transactionDone(transaction)
      return false
    }

    const chapters = await requestToPromise(
      typedRequest<Chapter[]>(chapterStoryIndex.getAll(id)),
    )

    for (const chapter of chapters) {
      chaptersStore.delete(chapter.id)
    }

    storiesStore.delete(id)
    await transactionDone(transaction)

    return true
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error('Failed to delete story.', { cause: error })
  } finally {
    db.close()
  }
}
