import type {
  RepositoryUnitOfWork,
  RepositoryUnitOfWorkContext,
} from '@/repositories/types'
import {
  CHAPTERS_STORE,
  STORIES_STORE,
  openDb,
  transactionDone,
} from '@/repositories/indexedDb/db'
import { createIndexedDbChapterRepository } from '@/repositories/indexedDb/chapterRepository'
import { createIndexedDbStoryRepository } from '@/repositories/indexedDb/storyRepository'

export function createIndexedDbRepositoryUnitOfWork(): RepositoryUnitOfWork {
  return {
    run,
  }
}

async function run<T>(
  operation: (context: RepositoryUnitOfWorkContext) => Promise<T>,
): Promise<T> {
  const db = await openDb()

  try {
    const transaction = db.transaction(
      [STORIES_STORE, CHAPTERS_STORE],
      'readwrite',
    )

    try {
      const result = await operation({
        stories: createIndexedDbStoryRepository({ transaction }),
        chapters: createIndexedDbChapterRepository({ transaction }),
      })

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
