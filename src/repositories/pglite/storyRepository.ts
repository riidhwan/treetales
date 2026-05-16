import type { PGliteInterface } from '@electric-sql/pglite'

import type {
  StoryRepository,
  UpdateStoryRepositoryInput,
} from '@/repositories/types'
import type { Story } from '@/services/types'

type TimestampColumn = number | string | bigint

interface StoryRow {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly created_at: TimestampColumn
  readonly updated_at: TimestampColumn
}

interface PgliteQueryExecutor {
  readonly query: PGliteInterface['query']
}

interface PgliteTransactionProvider extends PgliteQueryExecutor {
  readonly transaction: PGliteInterface['transaction']
}

type PgliteRepositoryExecutor =
  | PgliteQueryExecutor
  | PgliteTransactionProvider

export function createPgliteStoryRepository(
  db: PgliteRepositoryExecutor,
): StoryRepository {
  return {
    insertStory: (story) => insertStory(db, story),
    findStories: () => findStories(db),
    findStoryById: (id) => findStoryById(db, id),
    updateStory: (id, input) => updateStory(db, id, input),
    deleteStory: (id) => deleteStory(db, id),
  }
}

async function insertStory(
  db: PgliteRepositoryExecutor,
  story: Story,
): Promise<void> {
  await runPgliteWrite(db, async (transaction) => {
    await transaction.query(
      `
        INSERT INTO stories (id, title, description, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        story.id,
        story.title,
        story.description,
        story.createdAt,
        story.updatedAt,
      ],
    )
  })
}

async function findStories(db: PgliteQueryExecutor): Promise<Story[]> {
  const result = await db.query<StoryRow>(`
    SELECT id, title, description, created_at, updated_at
    FROM stories
    ORDER BY created_at, id
  `)

  return result.rows.map(mapStoryRow)
}

async function findStoryById(
  db: PgliteQueryExecutor,
  id: string,
): Promise<Story | undefined> {
  const result = await db.query<StoryRow>(
    `
      SELECT id, title, description, created_at, updated_at
      FROM stories
      WHERE id = $1
    `,
    [id],
  )

  return result.rows[0] ? mapStoryRow(result.rows[0]) : undefined
}

async function updateStory(
  db: PgliteRepositoryExecutor,
  id: string,
  input: UpdateStoryRepositoryInput,
): Promise<Story | undefined> {
  return runPgliteWrite(db, async (transaction) => {
    const result = await transaction.query<StoryRow>(
      `
        UPDATE stories
        SET
          title = COALESCE($2, title),
          description = COALESCE($3, description),
          updated_at = $4
        WHERE id = $1
        RETURNING id, title, description, created_at, updated_at
      `,
      [id, input.title ?? null, input.description ?? null, input.updatedAt],
    )

    return result.rows[0] ? mapStoryRow(result.rows[0]) : undefined
  })
}

async function deleteStory(
  db: PgliteRepositoryExecutor,
  id: string,
): Promise<boolean> {
  return runPgliteWrite(db, async (transaction) => {
    const result = await transaction.query<{ readonly id: string }>(
      'DELETE FROM stories WHERE id = $1 RETURNING id',
      [id],
    )

    return result.rows.length > 0
  })
}

function runPgliteWrite<T>(
  db: PgliteRepositoryExecutor,
  operation: (transaction: PgliteQueryExecutor) => Promise<T>,
): Promise<T> {
  if (hasTransaction(db)) {
    return db.transaction(operation)
  }

  return operation(db)
}

function hasTransaction(
  db: PgliteRepositoryExecutor,
): db is PgliteTransactionProvider {
  return 'transaction' in db && typeof db.transaction === 'function'
}

function mapStoryRow(row: StoryRow): Story {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at),
  }
}

function toTimestamp(value: TimestampColumn): number {
  if (typeof value === 'number') {
    return value
  }

  return Number(value)
}
