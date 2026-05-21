import type {
  RepositoryUnitOfWork,
  RepositoryUnitOfWorkContext,
} from '@/repositories/types'
import {
  CHARACTERS_STORE,
  CHAPTERS_STORE,
  STORIES_STORE,
} from '@/repositories/indexedDb/db'
import { createIndexedDbCharacterRepository } from '@/repositories/indexedDb/characterRepository'
import { createIndexedDbChapterRepository } from '@/repositories/indexedDb/chapterRepository'
import { createIndexedDbStoryRepository } from '@/repositories/indexedDb/storyRepository'
import { withIndexedDbTransaction } from '@/repositories/indexedDb/transaction'

export function createIndexedDbRepositoryUnitOfWork(): RepositoryUnitOfWork {
  return {
    run,
  }
}

async function run<T>(
  operation: (context: RepositoryUnitOfWorkContext) => Promise<T>,
): Promise<T> {
  return withIndexedDbTransaction(
    {},
    [STORIES_STORE, CHAPTERS_STORE, CHARACTERS_STORE],
    'readwrite',
    (transaction) =>
      operation({
        stories: createIndexedDbStoryRepository({ transaction }),
        chapters: createIndexedDbChapterRepository({ transaction }),
        characters: createIndexedDbCharacterRepository({ transaction }),
      }),
  )
}
