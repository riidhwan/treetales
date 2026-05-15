import type { PGliteInterface } from '@electric-sql/pglite'
import { PGliteWorker } from '@electric-sql/pglite/worker'

import { PGLITE_WORKER_ID } from '@/repositories/pglite/config'

export const PGLITE_SCHEMA_VERSION = 1

interface SchemaMigrationRow {
  readonly version: number
}

interface SchemaMigration {
  readonly version: number
  readonly sql: string
}

const SCHEMA_MIGRATIONS: readonly SchemaMigration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS stories (
        id text PRIMARY KEY,
        title text NOT NULL,
        description text NOT NULL,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL
      );

      CREATE TABLE IF NOT EXISTS chapters (
        id text PRIMARY KEY,
        story_id text NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        title text NOT NULL,
        content text NOT NULL,
        parent_chapter_id text REFERENCES chapters(id) ON DELETE SET NULL,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        CONSTRAINT chapters_parent_not_self CHECK (
          parent_chapter_id IS NULL OR parent_chapter_id <> id
        )
      );

      CREATE INDEX IF NOT EXISTS chapters_story_id_idx
        ON chapters(story_id);

      CREATE INDEX IF NOT EXISTS chapters_parent_chapter_id_idx
        ON chapters(parent_chapter_id);

      CREATE UNIQUE INDEX IF NOT EXISTS chapters_one_intro_per_story_idx
        ON chapters(story_id)
        WHERE parent_chapter_id IS NULL;
    `,
  },
]

let databasePromise: Promise<PGliteInterface> | undefined
let schemaSetupPromise: Promise<void> | undefined

export async function getPgliteDb(): Promise<PGliteInterface> {
  databasePromise ??= createBrowserPgliteConnection()
  const db = await databasePromise

  schemaSetupPromise ??= setupPgliteSchema(db).catch((error: unknown) => {
    schemaSetupPromise = undefined
    throw error
  })
  await schemaSetupPromise

  return db
}

export async function createBrowserPgliteConnection(): Promise<PGliteInterface> {
  if (typeof Worker === 'undefined') {
    throw new Error('PGlite browser worker is unavailable in this environment.')
  }

  return PGliteWorker.create(createPgliteWorker(), { id: PGLITE_WORKER_ID })
}

export async function setupPgliteSchema(db: PGliteInterface): Promise<void> {
  await db.transaction(async (transaction) => {
    await transaction.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version integer PRIMARY KEY,
        applied_at bigint NOT NULL
      );
    `)

    const appliedResult = await transaction.query<SchemaMigrationRow>(
      'SELECT version FROM schema_migrations',
    )
    const appliedVersions = new Set(
      appliedResult.rows.map(({ version }) => version),
    )

    for (const migration of SCHEMA_MIGRATIONS) {
      if (appliedVersions.has(migration.version)) {
        continue
      }

      await transaction.exec(migration.sql)
      await transaction.query(
        'INSERT INTO schema_migrations (version, applied_at) VALUES ($1, $2)',
        [migration.version, Date.now()],
      )
    }
  })
}

export function resetPgliteConnectionForTests(): void {
  databasePromise = undefined
  schemaSetupPromise = undefined
}

function createPgliteWorker(): Worker {
  return new Worker(new URL('./pglite.worker.ts', import.meta.url), {
    name: PGLITE_WORKER_ID,
    type: 'module',
  })
}
