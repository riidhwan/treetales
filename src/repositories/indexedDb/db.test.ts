import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  CHAPTERS_STORE,
  CHAPTER_PARENT_ID_INDEX,
  CHAPTER_STORY_ID_INDEX,
  DB_NAME,
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
    await deleteTestDatabase()
  })

  it('initializes expected stores and indexes', async () => {
    const db = await openDb()

    expect(db.name).toBe(DB_NAME)
    expect(db.version).toBe(2)
    expect(db.objectStoreNames.contains(STORIES_STORE)).toBe(true)
    expect(db.objectStoreNames.contains(CHAPTERS_STORE)).toBe(true)

    const transaction = db.transaction(CHAPTERS_STORE, 'readonly')
    const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
    const storyIdIndex = chaptersStore.index(CHAPTER_STORY_ID_INDEX)
    const parentChapterIdIndex = chaptersStore.index(CHAPTER_PARENT_ID_INDEX)

    expect(storyIdIndex.keyPath).toBe('storyId')
    expect(storyIdIndex.multiEntry).toBe(false)
    expect(parentChapterIdIndex.keyPath).toBe('parentChapterId')
    expect(parentChapterIdIndex.multiEntry).toBe(false)

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

    expect(root?.parentChapterId).toBeNull()
    expect(child?.parentChapterId).toBe('chapter-root')
    expect('parentChapterIds' in (child ?? {})).toBe(false)
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
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open legacy test database.'))
    }
  })
}
