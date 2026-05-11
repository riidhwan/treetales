import {
  CHAPTERS_STORE,
  CHAPTER_STORY_ID_INDEX,
  STORIES_STORE,
  openDb,
  requestToPromise,
  transactionDone,
} from '@/services/db'
import type {
  Chapter,
  CreateStoryInput,
  Story,
  UpdateStoryInput,
} from '@/services/types'

export async function createStory(input: CreateStoryInput): Promise<Story> {
  const db = await openDb()

  try {
    const now = Date.now()
    const story: Story = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      createdAt: now,
      updatedAt: now,
    }
    const transaction = db.transaction(STORIES_STORE, 'readwrite')
    const store = transaction.objectStore(STORIES_STORE)

    store.add(story)
    await transactionDone(transaction)

    return story
  } finally {
    db.close()
  }
}

export async function getStories(): Promise<Story[]> {
  const db = await openDb()

  try {
    const transaction = db.transaction(STORIES_STORE, 'readonly')
    const store = transaction.objectStore(STORIES_STORE)
    const stories = await requestToPromise<Story[]>(store.getAll())

    await transactionDone(transaction)

    return sortByCreatedAt(stories)
  } finally {
    db.close()
  }
}

function sortByCreatedAt<TItem extends { id: string; createdAt: number }>(
  items: TItem[],
): TItem[] {
  return [...items].sort((firstItem, secondItem) => {
    if (firstItem.createdAt !== secondItem.createdAt) {
      return firstItem.createdAt - secondItem.createdAt
    }

    return firstItem.id.localeCompare(secondItem.id)
  })
}

export async function getStoryById(id: string): Promise<Story | undefined> {
  const db = await openDb()

  try {
    const transaction = db.transaction(STORIES_STORE, 'readonly')
    const store = transaction.objectStore(STORIES_STORE)
    const story = await requestToPromise<Story | undefined>(store.get(id))

    await transactionDone(transaction)

    return story
  } finally {
    db.close()
  }
}

export async function updateStory(
  id: string,
  input: UpdateStoryInput,
): Promise<Story | undefined> {
  const db = await openDb()

  try {
    const transaction = db.transaction(STORIES_STORE, 'readwrite')
    const store = transaction.objectStore(STORIES_STORE)
    const story = await requestToPromise<Story | undefined>(store.get(id))

    if (!story) {
      await transactionDone(transaction)
      return undefined
    }

    const updatedStory: Story = {
      ...story,
      ...input,
      updatedAt: Date.now(),
    }

    store.put(updatedStory)
    await transactionDone(transaction)

    return updatedStory
  } finally {
    db.close()
  }
}

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
    const story = await requestToPromise<Story | undefined>(storiesStore.get(id))

    if (!story) {
      await transactionDone(transaction)
      return false
    }

    const chapters = await requestToPromise<Chapter[]>(
      chapterStoryIndex.getAll(id),
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

    throw new Error('Failed to delete story.')
  } finally {
    db.close()
  }
}
