import {
  assertTransactionSupportsMode,
  openDb,
  transactionDone,
} from '@/repositories/indexedDb/db'
import type { StoreName } from '@/repositories/indexedDb/db'

export interface IndexedDbRepositoryOptions {
  readonly transaction?: IDBTransaction
}

export async function withIndexedDbTransaction<T>(
  options: IndexedDbRepositoryOptions,
  storeNames: readonly StoreName[],
  mode: IDBTransactionMode,
  operation: (transaction: IDBTransaction) => Promise<T>,
): Promise<T> {
  if (options.transaction) {
    assertTransactionSupportsMode(options.transaction, mode)
    return operation(options.transaction)
  }

  const db = await openDb()

  try {
    const transaction = db.transaction([...storeNames], mode)

    try {
      const result = await operation(transaction)
      await transactionDone(transaction)

      return result
    } catch (error) {
      abortOpenTransaction(transaction)
      throw error
    }
  } finally {
    db.close()
  }
}

function abortOpenTransaction(transaction: IDBTransaction): void {
  try {
    transaction.abort()
  } catch {
    // The transaction may already be inactive after a failed request.
  }
}
