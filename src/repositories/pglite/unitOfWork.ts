import type {
  RepositoryUnitOfWork,
  RepositoryUnitOfWorkContext,
} from '@/repositories/types'
import { getPgliteDb } from '@/repositories/pglite/db'
import { createPgliteChapterRepository } from '@/repositories/pglite/chapterRepository'
import { createPgliteStoryRepository } from '@/repositories/pglite/storyRepository'

export function createPgliteRepositoryUnitOfWork(): RepositoryUnitOfWork {
  return {
    run,
  }
}

async function run<T>(
  operation: (context: RepositoryUnitOfWorkContext) => Promise<T>,
): Promise<T> {
  const db = await getPgliteDb()

  return db.transaction((transaction) =>
    operation({
      stories: createPgliteStoryRepository(transaction),
      chapters: createPgliteChapterRepository(transaction),
    }),
  )
}
