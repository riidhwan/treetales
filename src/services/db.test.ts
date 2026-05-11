import { IDBFactory } from 'fake-indexeddb'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  CHAPTERS_STORE,
  CHAPTER_PARENT_IDS_INDEX,
  CHAPTER_STORY_ID_INDEX,
  DB_NAME,
  STORIES_STORE,
  openDb,
} from '@/services/db'

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
})

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
