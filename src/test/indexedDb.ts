import { IDBFactory } from 'fake-indexeddb'

import { DB_NAME } from '@/repositories/indexedDb/db'

export function installFakeIndexedDb(): void {
  globalThis.indexedDB = new IDBFactory()
}

export function deleteTestDatabase(): Promise<void> {
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
