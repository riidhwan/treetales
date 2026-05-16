import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PGliteInterface } from '@electric-sql/pglite'

import { getPgliteDb } from '@/repositories/pglite/db'
import { createPgliteRepositoryUnitOfWork } from '@/repositories/pglite/unitOfWork'
import type { Story } from '@/services/types'
import { createTestPgliteDb } from '@/test/pglite'

vi.mock('@/repositories/pglite/db', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/repositories/pglite/db')>()

  return {
    ...actual,
    getPgliteDb: vi.fn(),
  }
})

let db: PGliteInterface
const PGLITE_TEST_TIMEOUT_MS = 15_000

beforeAll(async () => {
  db = await createTestPgliteDb()
  vi.mocked(getPgliteDb).mockResolvedValue(db)
}, PGLITE_TEST_TIMEOUT_MS)

beforeEach(async () => {
  vi.mocked(getPgliteDb).mockResolvedValue(db)
  await db.query('DELETE FROM stories')
})

afterAll(async () => {
  await db.close()
})

describe('pglite repository unit of work', () => {
  it('commits multi-repository writes together', async () => {
    const unitOfWork = createPgliteRepositoryUnitOfWork()
    const story = createStory('story-1')

    await unitOfWork.run(async ({ stories, chapters }) => {
      await stories.insertStory(story)
      await chapters.insertChapter({
        id: 'chapter-1',
        storyId: story.id,
        title: 'Intro',
        content: 'Start',
        parentChapterId: null,
        createdAt: 20,
        updatedAt: 20,
      })
    })

    const persistedChapters = await db.query<{ readonly id: string }>(
      'SELECT id FROM chapters WHERE story_id = $1',
      [story.id],
    )

    await expect(
      db.query('SELECT id FROM stories WHERE id = $1', [story.id]),
    ).resolves.toMatchObject({ rows: [{ id: story.id }] })
    expect(persistedChapters.rows).toEqual([{ id: 'chapter-1' }])
  })

  it('rolls back multi-repository writes when the operation fails', async () => {
    const unitOfWork = createPgliteRepositoryUnitOfWork()
    const story = createStory('story-1')

    await expect(
      unitOfWork.run(async ({ stories, chapters }) => {
        await stories.insertStory(story)
        await chapters.insertChapter({
          id: 'chapter-1',
          storyId: story.id,
          title: 'Intro',
          content: 'Start',
          parentChapterId: null,
          createdAt: 20,
          updatedAt: 20,
        })

        throw new Error('stop')
      }),
    ).rejects.toThrow('stop')

    await expect(
      db.query('SELECT id FROM stories WHERE id = $1', [story.id]),
    ).resolves.toMatchObject({ rows: [] })
    await expect(
      db.query('SELECT id FROM chapters WHERE story_id = $1', [story.id]),
    ).resolves.toMatchObject({ rows: [] })
  })
})

function createStory(id: string): Story {
  return {
    id,
    title: 'Story',
    description: 'Description',
    createdAt: 10,
    updatedAt: 10,
  }
}
