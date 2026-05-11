import { IDBFactory } from 'fake-indexeddb'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  CHAPTERS_STORE,
  CHAPTER_PARENT_IDS_INDEX,
  CHAPTER_STORY_ID_INDEX,
  DB_NAME,
  STORIES_STORE,
  getStore,
  openDb,
  requestToPromise,
  typedRequest,
  transactionDone,
} from '@/services/db'
import type { Story } from '@/services/types'

describe('openDb', () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory()
  })

  afterEach(async () => {
    await deleteDatabase()
  })

  it('initializes expected stores and indexes', async () => {
    const db = await openDb()

    expect(db.name).toBe(DB_NAME)
    expect(db.version).toBe(1)
    expect(db.objectStoreNames.contains(STORIES_STORE)).toBe(true)
    expect(db.objectStoreNames.contains(CHAPTERS_STORE)).toBe(true)

    const transaction = db.transaction(CHAPTERS_STORE, 'readonly')
    const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
    const storyIdIndex = chaptersStore.index(CHAPTER_STORY_ID_INDEX)
    const parentChapterIdsIndex = chaptersStore.index(CHAPTER_PARENT_IDS_INDEX)

    expect(storyIdIndex.keyPath).toBe('storyId')
    expect(storyIdIndex.multiEntry).toBe(false)
    expect(parentChapterIdsIndex.keyPath).toBe('parentChapterIds')
    expect(parentChapterIdsIndex.multiEntry).toBe(true)

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
