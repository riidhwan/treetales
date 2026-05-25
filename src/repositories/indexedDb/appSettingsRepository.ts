import type { AppSettingsRepository } from '@/repositories/types'
import {
  APP_SETTINGS_STORE,
  requestToPromise,
  typedRequest,
} from '@/repositories/indexedDb/db'
import {
  type IndexedDbRepositoryOptions,
  withIndexedDbTransaction,
} from '@/repositories/indexedDb/transaction'
import type { AppSetting } from '@/services/types'

export function createIndexedDbAppSettingsRepository(
  options: IndexedDbRepositoryOptions = {},
): AppSettingsRepository {
  return {
    findSettingById: (id) => findSettingById(options, id),
    putSetting: (setting) => putSetting(options, setting),
    deleteSetting: (id) => deleteSetting(options, id),
  }
}

async function findSettingById(
  options: IndexedDbRepositoryOptions,
  id: string,
): Promise<AppSetting | undefined> {
  return withAppSettingsStore(options, 'readonly', (store) =>
    requestToPromise(typedRequest<AppSetting | undefined>(store.get(id))),
  )
}

async function putSetting(
  options: IndexedDbRepositoryOptions,
  setting: AppSetting,
): Promise<void> {
  await withAppSettingsStore(options, 'readwrite', async (store) => {
    await requestToPromise(typedRequest<IDBValidKey>(store.put(setting)))
  })
}

async function deleteSetting(
  options: IndexedDbRepositoryOptions,
  id: string,
): Promise<boolean> {
  return withAppSettingsStore(options, 'readwrite', async (store) => {
    const setting = await requestToPromise(
      typedRequest<AppSetting | undefined>(store.get(id)),
    )

    if (!setting) {
      return false
    }

    await requestToPromise(typedRequest<undefined>(store.delete(id)))

    return true
  })
}

async function withAppSettingsStore<T>(
  options: IndexedDbRepositoryOptions,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  return withIndexedDbTransaction(
    options,
    [APP_SETTINGS_STORE],
    mode,
    (transaction) => operation(transaction.objectStore(APP_SETTINGS_STORE)),
  )
}
