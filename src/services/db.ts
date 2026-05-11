import type { Chapter, Story } from '@/services/types'

export const DB_NAME = 'TreeTales'
export const DB_VERSION = 1
export const STORIES_STORE = 'stories'
export const CHAPTERS_STORE = 'chapters'
export const CHAPTER_STORY_ID_INDEX = 'storyId'
export const CHAPTER_PARENT_IDS_INDEX = 'parentChapterIds'

export interface TreeTalesSchema {
  stories: Story
  chapters: Chapter
}

export type StoreName = keyof TreeTalesSchema

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORIES_STORE)) {
        db.createObjectStore(STORIES_STORE, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(CHAPTERS_STORE)) {
        const chaptersStore = db.createObjectStore(CHAPTERS_STORE, {
          keyPath: 'id',
        })

        chaptersStore.createIndex(CHAPTER_STORY_ID_INDEX, 'storyId')
        chaptersStore.createIndex(CHAPTER_PARENT_IDS_INDEX, 'parentChapterIds', {
          multiEntry: true,
        })
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB database.'))
    }
  })
}

export function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB request failed.'))
    }
  })
}

export function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve()
    }

    transaction.onerror = () => {
      reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
    }

    transaction.onabort = () => {
      reject(transaction.error ?? new Error('IndexedDB transaction aborted.'))
    }
  })
}

export function getStore<TStoreName extends StoreName>(
  db: IDBDatabase,
  storeName: TStoreName,
  mode: IDBTransactionMode,
): {
  store: IDBObjectStore
  transaction: IDBTransaction
} {
  const transaction = db.transaction(storeName, mode)

  return {
    store: transaction.objectStore(storeName),
    transaction,
  }
}

export function abortTransaction(
  transaction: IDBTransaction,
  error: Error,
): never {
  try {
    transaction.abort()
  } catch {
    // The transaction may already be inactive after a failed request.
  }

  throw error
}
