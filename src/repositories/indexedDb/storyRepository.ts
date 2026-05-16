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

interface StoryRepositoryOptions {
  readonly transaction?: IDBTransaction
}

export function createIndexedDbStoryRepository(
  options: StoryRepositoryOptions = {},
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
  options: StoryRepositoryOptions,
  story: Story,
): Promise<void> {
  await withStoryStore(options, 'readwrite', async (store) => {
    await requestToPromise(typedRequest<IDBValidKey>(store.add(story)))
  })
}

async function findStories(
  options: StoryRepositoryOptions,
): Promise<Story[]> {
  return withStoryStore(options, 'readonly', async (store) => {
    const stories = await requestToPromise(
      typedRequest<Story[]>(store.getAll()),
    )

    return sortByCreatedAt(stories)
  })
}

async function findStoryById(
  options: StoryRepositoryOptions,
  id: string,
): Promise<Story | undefined> {
  return withStoryStore(options, 'readonly', (store) =>
    requestToPromise(typedRequest<Story | undefined>(store.get(id))),
  )
}

async function updateStory(
  options: StoryRepositoryOptions,
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
  options: StoryRepositoryOptions,
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
  options: StoryRepositoryOptions,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  if (options.transaction) {
    return operation(options.transaction.objectStore(STORIES_STORE))
  }

  const db = await openDb()

  try {
    const transaction = db.transaction(STORIES_STORE, mode)
    const store = transaction.objectStore(STORIES_STORE)
    const result = await operation(store)
    await transactionDone(transaction)

    return result
  } finally {
    db.close()
  }
}
