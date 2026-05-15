import { sortByCreatedAt } from '@/lib/sorting'
import type {
  StoryRepository,
  UpdateStoryRepositoryInput,
} from '@/repositories/types'
import {
  STORIES_STORE,
  openDb,
  requestToPromise,
  typedRequest,
  transactionDone,
} from '@/repositories/indexedDb/db'
import type { Story } from '@/services/types'

export function createIndexedDbStoryRepository(): StoryRepository {
  return {
    insertStory,
    findStories,
    findStoryById,
    updateStory,
    deleteStory,
  }
}

async function insertStory(story: Story): Promise<void> {
  const db = await openDb()

  try {
    const transaction = db.transaction(STORIES_STORE, 'readwrite')
    const store = transaction.objectStore(STORIES_STORE)

    store.add(story)
    await transactionDone(transaction)
  } finally {
    db.close()
  }
}

async function findStories(): Promise<Story[]> {
  const db = await openDb()

  try {
    const transaction = db.transaction(STORIES_STORE, 'readonly')
    const store = transaction.objectStore(STORIES_STORE)
    const stories = await requestToPromise(
      typedRequest<Story[]>(store.getAll()),
    )

    await transactionDone(transaction)

    return sortByCreatedAt(stories)
  } finally {
    db.close()
  }
}

async function findStoryById(id: string): Promise<Story | undefined> {
  const db = await openDb()

  try {
    const transaction = db.transaction(STORIES_STORE, 'readonly')
    const store = transaction.objectStore(STORIES_STORE)
    const story = await requestToPromise(
      typedRequest<Story | undefined>(store.get(id)),
    )

    await transactionDone(transaction)

    return story
  } finally {
    db.close()
  }
}

async function updateStory(
  id: string,
  input: UpdateStoryRepositoryInput,
): Promise<Story | undefined> {
  const db = await openDb()

  try {
    const transaction = db.transaction(STORIES_STORE, 'readwrite')
    const store = transaction.objectStore(STORIES_STORE)
    const story = await requestToPromise(
      typedRequest<Story | undefined>(store.get(id)),
    )

    if (!story) {
      await transactionDone(transaction)
      return undefined
    }

    const updatedStory: Story = {
      ...story,
      ...input,
      updatedAt: input.updatedAt,
    }

    store.put(updatedStory)
    await transactionDone(transaction)

    return updatedStory
  } finally {
    db.close()
  }
}

async function deleteStory(id: string): Promise<boolean> {
  const db = await openDb()

  try {
    const transaction = db.transaction(STORIES_STORE, 'readwrite')
    const store = transaction.objectStore(STORIES_STORE)
    const story = await requestToPromise(
      typedRequest<Story | undefined>(store.get(id)),
    )

    if (!story) {
      await transactionDone(transaction)
      return false
    }

    store.delete(id)
    await transactionDone(transaction)

    return true
  } finally {
    db.close()
  }
}
