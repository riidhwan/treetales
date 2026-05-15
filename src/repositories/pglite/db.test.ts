import { afterEach, describe, expect, it, vi } from 'vitest'

import type { PGliteInterface } from '@electric-sql/pglite'

import {
  PGLITE_SCHEMA_VERSION,
  createBrowserPgliteConnection,
  getPgliteDb,
  resetPgliteConnectionForTests,
  setupPgliteSchema,
} from '@/repositories/pglite/db'
import { createTestPgliteDb } from '@/test/pglite'

const PGLITE_TEST_TIMEOUT_MS = 15_000

let db: PGliteInterface | undefined

afterEach(async () => {
  await db?.close()
  db = undefined
  resetPgliteConnectionForTests()
  vi.unstubAllGlobals()
})

describe('setupPgliteSchema', () => {
  it('applies the current schema migration once', async () => {
    db = await createTestPgliteDb()

    await setupPgliteSchema(db)

    const result = await db.query<{ version: number }>(
      'SELECT version FROM schema_migrations ORDER BY version',
    )

    expect(result.rows).toEqual([{ version: PGLITE_SCHEMA_VERSION }])
  }, PGLITE_TEST_TIMEOUT_MS)

  it('creates story and chapter tables with the expected constraints', async () => {
    db = await createTestPgliteDb()

    await db.query(
      `
        INSERT INTO stories (id, title, description, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
      `,
      ['story-1', 'Story', 'Description', 10, 10],
    )
    await db.query(
      `
        INSERT INTO chapters (
          id,
          story_id,
          title,
          content,
          parent_chapter_id,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      ['chapter-1', 'story-1', 'Intro', 'Start', null, 10, 10],
    )

    await expect(
      db.query(
        `
          INSERT INTO chapters (
            id,
            story_id,
            title,
            content,
            parent_chapter_id,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        ['chapter-2', 'story-1', 'Second intro', 'Again', null, 20, 20],
      ),
    ).rejects.toThrow()
  }, PGLITE_TEST_TIMEOUT_MS)

  it('cascades story deletion to chapters', async () => {
    db = await createTestPgliteDb()

    await db.exec(`
      INSERT INTO stories (id, title, description, created_at, updated_at)
      VALUES ('story-1', 'Story', 'Description', 10, 10);

      INSERT INTO chapters (
        id,
        story_id,
        title,
        content,
        parent_chapter_id,
        created_at,
        updated_at
      )
      VALUES ('chapter-1', 'story-1', 'Intro', 'Start', null, 10, 10);
    `)

    await db.query('DELETE FROM stories WHERE id = $1', ['story-1'])

    const chapters = await db.query('SELECT id FROM chapters')

    expect(chapters.rows).toEqual([])
  }, PGLITE_TEST_TIMEOUT_MS)

  it('clears child parent references when deleting a parent chapter', async () => {
    db = await createTestPgliteDb()

    await db.exec(`
      INSERT INTO stories (id, title, description, created_at, updated_at)
      VALUES ('story-1', 'Story', 'Description', 10, 10);

      INSERT INTO chapters (
        id,
        story_id,
        title,
        content,
        parent_chapter_id,
        created_at,
        updated_at
      )
      VALUES ('chapter-1', 'story-1', 'Intro', 'Start', null, 10, 10);

      INSERT INTO chapters (
        id,
        story_id,
        title,
        content,
        parent_chapter_id,
        created_at,
        updated_at
      )
      VALUES ('chapter-2', 'story-1', 'Child', 'Continue', 'chapter-1', 20, 20);
    `)

    await db.query('DELETE FROM chapters WHERE id = $1', ['chapter-1'])

    const result = await db.query<{ parent_chapter_id: string | null }>(
      'SELECT parent_chapter_id FROM chapters WHERE id = $1',
      ['chapter-2'],
    )

    expect(result.rows).toEqual([{ parent_chapter_id: null }])
  }, PGLITE_TEST_TIMEOUT_MS)
})

describe('getPgliteDb', () => {
  it('reports when browser workers are unavailable', async () => {
    vi.stubGlobal('Worker', undefined)

    await expect(getPgliteDb()).rejects.toThrow(
      'PGlite browser worker is unavailable in this environment.',
    )
  })

  it('allows tests to retry connection setup after a failed attempt', async () => {
    vi.stubGlobal('Worker', undefined)

    await expect(getPgliteDb()).rejects.toThrow()

    resetPgliteConnectionForTests()

    await expect(createBrowserPgliteConnection()).rejects.toThrow(
      'PGlite browser worker is unavailable in this environment.',
    )
  })
})
