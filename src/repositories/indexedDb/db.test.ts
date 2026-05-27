import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CHAPTERS_STORE,
  CHAPTER_PARENT_ID_INDEX,
  CHAPTER_STORY_ID_INDEX,
  CHARACTER_ILLUSTRATIONS_STORE,
  CHARACTER_ILLUSTRATION_CHARACTER_ID_INDEX,
  CHARACTER_ILLUSTRATION_STORY_ID_INDEX,
  CHARACTERS_STORE,
  CHARACTER_STORY_ID_INDEX,
  APP_SETTINGS_STORE,
  DB_NAME,
  DB_VERSION,
  STORIES_STORE,
  getStore,
  openDb,
  requestToPromise,
  typedRequest,
  transactionDone,
} from '@/repositories/indexedDb/db'
import type { Chapter, Story } from '@/services/types'
import {
  deleteTestDatabase,
  installFakeIndexedDb,
} from '@/test/indexedDb'

describe('openDb', () => {
  beforeEach(() => {
    installFakeIndexedDb()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await deleteTestDatabase()
  })

  it('initializes expected stores and indexes', async () => {
    const db = await openDb()

    expect(db.name).toBe(DB_NAME)
    expect(db.version).toBe(DB_VERSION)
    expect(db.objectStoreNames.contains(STORIES_STORE)).toBe(true)
    expect(db.objectStoreNames.contains(CHAPTERS_STORE)).toBe(true)
    expect(db.objectStoreNames.contains(CHARACTERS_STORE)).toBe(true)
    expect(db.objectStoreNames.contains(CHARACTER_ILLUSTRATIONS_STORE)).toBe(
      true,
    )
    expect(db.objectStoreNames.contains(APP_SETTINGS_STORE)).toBe(true)

    const transaction = db.transaction(CHAPTERS_STORE, 'readonly')
    const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
    const storyIdIndex = chaptersStore.index(CHAPTER_STORY_ID_INDEX)
    const parentChapterIdIndex = chaptersStore.index(CHAPTER_PARENT_ID_INDEX)

    expect(storyIdIndex.keyPath).toBe('storyId')
    expect(storyIdIndex.multiEntry).toBe(false)
    expect(parentChapterIdIndex.keyPath).toBe('parentChapterId')
    expect(parentChapterIdIndex.multiEntry).toBe(false)
    transaction.commit()

    const characterTransaction = db.transaction(CHARACTERS_STORE, 'readonly')
    const charactersStore = characterTransaction.objectStore(CHARACTERS_STORE)
    const characterStoryIdIndex = charactersStore.index(CHARACTER_STORY_ID_INDEX)

    expect(characterStoryIdIndex.keyPath).toBe('storyId')
    expect(characterStoryIdIndex.multiEntry).toBe(false)

    const illustrationTransaction = db.transaction(
      CHARACTER_ILLUSTRATIONS_STORE,
      'readonly',
    )
    const illustrationsStore = illustrationTransaction.objectStore(
      CHARACTER_ILLUSTRATIONS_STORE,
    )
    const illustrationStoryIdIndex = illustrationsStore.index(
      CHARACTER_ILLUSTRATION_STORY_ID_INDEX,
    )
    const illustrationCharacterIdIndex = illustrationsStore.index(
      CHARACTER_ILLUSTRATION_CHARACTER_ID_INDEX,
    )

    expect(illustrationStoryIdIndex.keyPath).toBe('storyId')
    expect(illustrationStoryIdIndex.multiEntry).toBe(false)
    expect(illustrationCharacterIdIndex.keyPath).toBe('characterId')
    expect(illustrationCharacterIdIndex.multiEntry).toBe(false)

    db.close()
  })

  it('migrates legacy chapter parent arrays to a singular parent id', async () => {
    const legacyDb = await openLegacyDb()
    legacyDb.close()

    const db = await openDb()
    const transaction = db.transaction(CHAPTERS_STORE, 'readonly')
    const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
    const child = await requestToPromise(
      typedRequest<Chapter | undefined>(chaptersStore.get('chapter-child')),
    )
    const root = await requestToPromise(
      typedRequest<Chapter | undefined>(chaptersStore.get('chapter-root')),
    )
    const emptyParent = await requestToPromise(
      typedRequest<Chapter | undefined>(chaptersStore.get('chapter-empty-parent')),
    )
    const modern = await requestToPromise(
      typedRequest<Chapter | undefined>(chaptersStore.get('chapter-modern')),
    )

    expect(root?.parentChapterId).toBeNull()
    expect(emptyParent?.parentChapterId).toBeNull()
    expect(child?.parentChapterId).toBe('chapter-root')
    expect(modern?.parentChapterId).toBe('chapter-root')
    expect('parentChapterIds' in (child ?? {})).toBe(false)
    expect('parentChapterIds' in (modern ?? {})).toBe(false)
    await expect(transactionDone(transaction)).resolves.toBeUndefined()

    db.close()
  })

  it('keeps existing character store and indexes during upgrades', async () => {
    const versionTwoDb = await openVersionTwoDbWithCharacters()
    versionTwoDb.close()

    const db = await openDb()
    const characterTransaction = db.transaction(CHARACTERS_STORE, 'readonly')
    const charactersStore = characterTransaction.objectStore(CHARACTERS_STORE)
    const characterStoryIdIndex = charactersStore.index(CHARACTER_STORY_ID_INDEX)

    expect(characterStoryIdIndex.keyPath).toBe('storyId')
    await expect(transactionDone(characterTransaction)).resolves.toBeUndefined()

    db.close()
  })

  it('adds the App Settings store during upgrades', async () => {
    const versionThreeDb = await openVersionThreeDbWithoutAppSettings()
    versionThreeDb.close()

    const db = await openDb()

    expect(db.objectStoreNames.contains(APP_SETTINGS_STORE)).toBe(true)

    db.close()
  })

  it('keeps existing Character Illustration store and indexes during upgrades', async () => {
    const versionFourDb = await openVersionFourDbWithCharacterIllustrations()
    versionFourDb.close()

    const db = await openDb()
    const transaction = db.transaction(
      CHARACTER_ILLUSTRATIONS_STORE,
      'readonly',
    )
    const store = transaction.objectStore(CHARACTER_ILLUSTRATIONS_STORE)

    expect(store.index(CHARACTER_ILLUSTRATION_STORY_ID_INDEX).keyPath).toBe(
      'storyId',
    )
    expect(store.index(CHARACTER_ILLUSTRATION_CHARACTER_ID_INDEX).keyPath).toBe(
      'characterId',
    )
    await expect(transactionDone(transaction)).resolves.toBeUndefined()

    db.close()
  })

  it('opens stores with their transactions', async () => {
    const db = await openDb()
    const { store, transaction } = getStore(db, STORIES_STORE, 'readonly')

    expect(store.name).toBe(STORIES_STORE)
    expect(transaction.mode).toBe('readonly')

    db.close()
  })

  it('resolves requests and completed transactions', async () => {
    const db = await openDb()
    const { store, transaction } = getStore(db, STORIES_STORE, 'readwrite')
    const story = createStory('story-1')

    await expect(requestToPromise(store.add(story))).resolves.toBe('story-1')
    await expect(transactionDone(transaction)).resolves.toBeUndefined()

    const readTransaction = db.transaction(STORIES_STORE, 'readonly')
    const readStore = readTransaction.objectStore(STORIES_STORE)

    await expect(
      requestToPromise(typedRequest<Story | undefined>(readStore.get(story.id))),
    ).resolves.toEqual(story)
    await expect(transactionDone(readTransaction)).resolves.toBeUndefined()

    db.close()
  })

  it('rejects failed requests and aborted transactions', async () => {
    const db = await openDb()
    const { store, transaction } = getStore(db, STORIES_STORE, 'readwrite')
    const story = createStory('story-1')

    await requestToPromise(store.add(story))
    const donePromise = transactionDone(transaction)

    await expect(requestToPromise(store.add(story))).rejects.toBeTruthy()
    await expect(donePromise).rejects.toBeTruthy()

    db.close()
  })

  it('uses fallback errors when IndexedDB requests and transactions fail without error details', async () => {
    const request = {} as IDBRequest<string>
    const requestPromise = requestToPromise(request)

    request.onerror?.(new Event('error'))

    await expect(requestPromise).rejects.toThrow('IndexedDB request failed.')

    const failedTransaction = {} as IDBTransaction
    const failedTransactionPromise = transactionDone(failedTransaction)

    failedTransaction.onerror?.(new Event('error'))

    await expect(failedTransactionPromise).rejects.toThrow(
      'IndexedDB transaction failed.',
    )

    const abortedTransaction = {} as IDBTransaction
    const abortedTransactionPromise = transactionDone(abortedTransaction)

    abortedTransaction.onabort?.(new Event('abort'))

    await expect(abortedTransactionPromise).rejects.toThrow(
      'IndexedDB transaction aborted.',
    )
  })

  it('uses a fallback error when opening the database fails without error details', async () => {
    const request = {} as IDBOpenDBRequest

    vi.spyOn(indexedDB, 'open').mockReturnValue(request)

    const openPromise = openDb()

    request.onerror?.(new Event('error'))

    await expect(openPromise).rejects.toThrow(
      'Failed to open IndexedDB database.',
    )
  })
})

function createStory(id: string): Story {
  return {
    id,
    title: 'Story',
    description: 'Description',
    createdAt: 10,
    updatedAt: 10,
  }
}

function openLegacyDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore(STORIES_STORE, { keyPath: 'id' })
      const chaptersStore = db.createObjectStore(CHAPTERS_STORE, {
        keyPath: 'id',
      })

      chaptersStore.createIndex(CHAPTER_STORY_ID_INDEX, 'storyId')
      chaptersStore.createIndex('parentChapterIds', 'parentChapterIds', {
        multiEntry: true,
      })
      chaptersStore.add({
        id: 'chapter-root',
        storyId: 'story-1',
        title: 'Root',
        content: 'Start',
        parentChapterIds: [],
        createdAt: 10,
        updatedAt: 10,
      })
      chaptersStore.add({
        id: 'chapter-child',
        storyId: 'story-1',
        title: 'Child',
        content: 'Continue',
        parentChapterIds: ['chapter-root'],
        createdAt: 20,
        updatedAt: 20,
      })
      chaptersStore.add({
        id: 'chapter-empty-parent',
        storyId: 'story-1',
        title: 'Empty Parent',
        content: 'Continue',
        parentChapterIds: undefined,
        createdAt: 30,
        updatedAt: 30,
      })
      chaptersStore.add({
        id: 'chapter-modern',
        storyId: 'story-1',
        title: 'Modern',
        content: 'Continue',
        parentChapterId: 'chapter-root',
        createdAt: 40,
        updatedAt: 40,
      })
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open legacy test database.'))
    }
  })
}

function openVersionTwoDbWithCharacters(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2)

    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore(STORIES_STORE, { keyPath: 'id' })
      const chaptersStore = db.createObjectStore(CHAPTERS_STORE, {
        keyPath: 'id',
      })
      const charactersStore = db.createObjectStore(CHARACTERS_STORE, {
        keyPath: 'id',
      })

      chaptersStore.createIndex(CHAPTER_STORY_ID_INDEX, 'storyId')
      chaptersStore.createIndex(CHAPTER_PARENT_ID_INDEX, 'parentChapterId')
      charactersStore.createIndex(CHARACTER_STORY_ID_INDEX, 'storyId')
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(
        request.error ??
          new Error('Failed to open version two test database.'),
      )
    }
  })
}

function openVersionThreeDbWithoutAppSettings(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 3)

    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore(STORIES_STORE, { keyPath: 'id' })
      const chaptersStore = db.createObjectStore(CHAPTERS_STORE, {
        keyPath: 'id',
      })
      const charactersStore = db.createObjectStore(CHARACTERS_STORE, {
        keyPath: 'id',
      })

      chaptersStore.createIndex(CHAPTER_STORY_ID_INDEX, 'storyId')
      chaptersStore.createIndex(CHAPTER_PARENT_ID_INDEX, 'parentChapterId')
      charactersStore.createIndex(CHARACTER_STORY_ID_INDEX, 'storyId')
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(
        request.error ??
          new Error('Failed to open version three test database.'),
      )
    }
  })
}

function openVersionFourDbWithCharacterIllustrations(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 4)

    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore(STORIES_STORE, { keyPath: 'id' })
      const chaptersStore = db.createObjectStore(CHAPTERS_STORE, {
        keyPath: 'id',
      })
      const charactersStore = db.createObjectStore(CHARACTERS_STORE, {
        keyPath: 'id',
      })
      const illustrationsStore = db.createObjectStore(
        CHARACTER_ILLUSTRATIONS_STORE,
        {
          keyPath: 'id',
        },
      )
      db.createObjectStore(APP_SETTINGS_STORE, { keyPath: 'id' })

      chaptersStore.createIndex(CHAPTER_STORY_ID_INDEX, 'storyId')
      chaptersStore.createIndex(CHAPTER_PARENT_ID_INDEX, 'parentChapterId')
      charactersStore.createIndex(CHARACTER_STORY_ID_INDEX, 'storyId')
      illustrationsStore.createIndex(
        CHARACTER_ILLUSTRATION_STORY_ID_INDEX,
        'storyId',
      )
      illustrationsStore.createIndex(
        CHARACTER_ILLUSTRATION_CHARACTER_ID_INDEX,
        'characterId',
      )
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(
        request.error ??
          new Error('Failed to open version four test database.'),
      )
    }
  })
}
