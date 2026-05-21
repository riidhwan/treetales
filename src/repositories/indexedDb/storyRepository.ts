import { sortByCreatedAt } from '@/lib/sorting'
import type {
  StoryRepository,
  UpdateStoryRepositoryInput,
} from '@/repositories/types'
import {
  STORIES_STORE,
  requestToPromise,
  typedRequest,
} from '@/repositories/indexedDb/db'
import {
  type IndexedDbRepositoryOptions,
  withIndexedDbTransaction,
} from '@/repositories/indexedDb/transaction'
import type { Story } from '@/services/types'

export function createIndexedDbStoryRepository(
  options: IndexedDbRepositoryOptions = {},
): StoryRepository {
  return {
    insertStory: (story) => insertStory(options, story),
    findStories: () => findStories(options),
    findStoryById: (id) => findStoryById(options, id),
    updateStory: (id, input) => updateStory(options, id, input),
    deleteStory: (id) => deleteStory(options, id),
  }
}

async function insertStory(
  options: IndexedDbRepositoryOptions,
  story: Story,
): Promise<void> {
  await withStoryStore(options, 'readwrite', async (store) => {
    await requestToPromise(typedRequest<IDBValidKey>(store.add(story)))
  })
}

async function findStories(
  options: IndexedDbRepositoryOptions,
): Promise<Story[]> {
  return withStoryStore(options, 'readonly', async (store) => {
    const stories = await requestToPromise(
      typedRequest<Story[]>(store.getAll()),
    )

    return sortByCreatedAt(stories)
  })
}

async function findStoryById(
  options: IndexedDbRepositoryOptions,
  id: string,
): Promise<Story | undefined> {
  return withStoryStore(options, 'readonly', (store) =>
    requestToPromise(typedRequest<Story | undefined>(store.get(id))),
  )
}

async function updateStory(
  options: IndexedDbRepositoryOptions,
  id: string,
  input: UpdateStoryRepositoryInput,
): Promise<Story | undefined> {
  return withStoryStore(options, 'readwrite', async (store) => {
    const story = await requestToPromise(
      typedRequest<Story | undefined>(store.get(id)),
    )

    if (!story) {
      return undefined
    }

    const updatedStory: Story = {
      ...story,
      ...input,
      updatedAt: input.updatedAt,
    }

    await requestToPromise(typedRequest<IDBValidKey>(store.put(updatedStory)))

    return updatedStory
  })
}

async function deleteStory(
  options: IndexedDbRepositoryOptions,
  id: string,
): Promise<boolean> {
  return withStoryStore(options, 'readwrite', async (store) => {
    const story = await requestToPromise(
      typedRequest<Story | undefined>(store.get(id)),
    )

    if (!story) {
      return false
    }

    await requestToPromise(typedRequest<undefined>(store.delete(id)))

    return true
  })
}

async function withStoryStore<T>(
  options: IndexedDbRepositoryOptions,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  return withIndexedDbTransaction(options, [STORIES_STORE], mode, (transaction) =>
    operation(transaction.objectStore(STORIES_STORE)),
  )
}
