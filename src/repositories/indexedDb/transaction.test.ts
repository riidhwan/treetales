import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  STORIES_STORE,
  openDb,
  requestToPromise,
  transactionDone,
  typedRequest,
} from '@/repositories/indexedDb/db'
import { withIndexedDbTransaction } from '@/repositories/indexedDb/transaction'
import type { Story } from '@/services/types'
import {
  deleteTestDatabase,
  installFakeIndexedDb,
} from '@/test/indexedDb'

beforeEach(() => {
  installFakeIndexedDb()
})

afterEach(async () => {
  vi.restoreAllMocks()
  await deleteTestDatabase()
})

describe('withIndexedDbTransaction', () => {
  it('commits standalone transactions', async () => {
    const story = createStory('story-1')

    await withIndexedDbTransaction(
      {},
      [STORIES_STORE],
      'readwrite',
      async (transaction) => {
        await requestToPromise(
          typedRequest<IDBValidKey>(
            transaction.objectStore(STORIES_STORE).add(story),
          ),
        )
      },
    )

    await expect(findStory(story.id)).resolves.toEqual(story)
  })

  it('aborts standalone transactions when the operation fails', async () => {
    const story = createStory('story-1')

    await expect(
      withIndexedDbTransaction(
        {},
        [STORIES_STORE],
        'readwrite',
        async (transaction) => {
          await requestToPromise(
            typedRequest<IDBValidKey>(
              transaction.objectStore(STORIES_STORE).add(story),
            ),
          )

          throw new Error('stop transaction')
        },
      ),
    ).rejects.toThrow('stop transaction')

    await expect(findStory(story.id)).resolves.toBeUndefined()
  })

  it('does not complete or abort borrowed transactions', async () => {
    const db = await openDb()
    const story = createStory('story-1')

    try {
      const transaction = db.transaction(STORIES_STORE, 'readwrite')
      const done = transactionDone(transaction)

      await expect(
        withIndexedDbTransaction(
          { transaction },
          [STORIES_STORE],
          'readwrite',
          async (borrowedTransaction) => {
            await requestToPromise(
              typedRequest<IDBValidKey>(
                borrowedTransaction.objectStore(STORIES_STORE).add(story),
              ),
            )

            throw new Error('caller owns transaction')
          },
        ),
      ).rejects.toThrow('caller owns transaction')

      await expect(done).resolves.toBeUndefined()
    } finally {
      db.close()
    }

    await expect(findStory(story.id)).resolves.toEqual(story)
  })
})

async function findStory(id: string): Promise<Story | undefined> {
  const db = await openDb()

  try {
    const transaction = db.transaction(STORIES_STORE, 'readonly')
    const story = await requestToPromise(
      typedRequest<Story | undefined>(
        transaction.objectStore(STORIES_STORE).get(id),
      ),
    )
    await transactionDone(transaction)

    return story
  } finally {
    db.close()
  }
}

function createStory(id: string): Story {
  return {
    id,
    title: 'Story',
    description: 'Description',
    createdAt: 10,
    updatedAt: 10,
  }
}
