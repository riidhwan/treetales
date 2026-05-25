import type { AppSetting, Character, Chapter, Story } from '@/services/types'

export const DB_NAME = 'TreeTales'
export const DB_VERSION = 4
export const STORIES_STORE = 'stories'
export const CHAPTERS_STORE = 'chapters'
export const CHARACTERS_STORE = 'characters'
export const APP_SETTINGS_STORE = 'appSettings'
export const CHAPTER_STORY_ID_INDEX = 'storyId'
export const CHAPTER_PARENT_ID_INDEX = 'parentChapterId'
export const CHARACTER_STORY_ID_INDEX = 'storyId'

interface LegacyChapter extends Omit<Chapter, 'parentChapterId'> {
  parentChapterId?: string | null
  parentChapterIds?: string[]
}

export interface TreeTalesSchema {
  stories: Story
  chapters: Chapter
  characters: Character
  appSettings: AppSetting
}

export type StoreName = keyof TreeTalesSchema

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      const upgradeTransaction = request.transaction

      if (!upgradeTransaction) {
        throw new Error('IndexedDB upgrade transaction is unavailable.')
      }

      if (!db.objectStoreNames.contains(STORIES_STORE)) {
        db.createObjectStore(STORIES_STORE, { keyPath: 'id' })
      }

      const chaptersStore = db.objectStoreNames.contains(CHAPTERS_STORE)
        ? upgradeTransaction.objectStore(CHAPTERS_STORE)
        : db.createObjectStore(CHAPTERS_STORE, {
            keyPath: 'id',
          })

      if (!chaptersStore.indexNames.contains(CHAPTER_STORY_ID_INDEX)) {
        chaptersStore.createIndex(CHAPTER_STORY_ID_INDEX, 'storyId')
      }

      if (chaptersStore.indexNames.contains('parentChapterIds')) {
        chaptersStore.deleteIndex('parentChapterIds')
      }

      if (!chaptersStore.indexNames.contains(CHAPTER_PARENT_ID_INDEX)) {
        chaptersStore.createIndex(CHAPTER_PARENT_ID_INDEX, 'parentChapterId')
      }

      migrateChapterParents(chaptersStore)

      const charactersStore = db.objectStoreNames.contains(CHARACTERS_STORE)
        ? upgradeTransaction.objectStore(CHARACTERS_STORE)
        : db.createObjectStore(CHARACTERS_STORE, {
            keyPath: 'id',
          })

      if (!charactersStore.indexNames.contains(CHARACTER_STORY_ID_INDEX)) {
        charactersStore.createIndex(CHARACTER_STORY_ID_INDEX, 'storyId')
      }

      if (!db.objectStoreNames.contains(APP_SETTINGS_STORE)) {
        db.createObjectStore(APP_SETTINGS_STORE, { keyPath: 'id' })
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

function migrateChapterParents(chaptersStore: IDBObjectStore): void {
  const request = chaptersStore.openCursor()

  request.onsuccess = () => {
    const cursor = request.result

    if (!cursor) {
      return
    }

    const chapter = cursor.value as LegacyChapter

    if ('parentChapterIds' in chapter) {
      const [parentChapterId = null] = chapter.parentChapterIds ?? []
      const migratedChapter: Chapter = {
        ...chapter,
        parentChapterId,
      }

      delete (migratedChapter as LegacyChapter).parentChapterIds
      cursor.update(migratedChapter)
    }

    cursor.continue()
  }
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

export function typedRequest<T>(request: IDBRequest): IDBRequest<T> {
  return request as IDBRequest<T>
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

export function assertTransactionSupportsMode(
  transaction: IDBTransaction,
  requestedMode: IDBTransactionMode,
): void {
  if (requestedMode === 'readwrite' && transaction.mode === 'readonly') {
    throw new Error(
      'A readonly IndexedDB transaction cannot run a readwrite repository operation.',
    )
  }
}
