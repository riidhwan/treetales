import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import type { PGliteInterface } from '@electric-sql/pglite'

import { getPgliteDb } from '@/repositories/pglite/db'
import { getChaptersByStoryId, getNextChapters } from '@/services/chapterService'
import { createExampleStory } from '@/services/exampleStory'
import { getStories } from '@/services/storyService'
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

describe('createExampleStory', () => {
  beforeAll(async () => {
    db = await createTestPgliteDb()
    vi.mocked(getPgliteDb).mockResolvedValue(db)
  }, PGLITE_TEST_TIMEOUT_MS)

  afterEach(async () => {
    vi.restoreAllMocks()
    vi.mocked(getPgliteDb).mockResolvedValue(db)
    await db.query('DELETE FROM stories')
  })

  afterAll(async () => {
    await db.close()
  })

  it('creates a readable branching example story', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100)

    const exampleStory = await createExampleStory()

    expect(exampleStory.story).toMatchObject({
      id: 'example-story-lantern-road',
      title: 'The Lantern Road',
      createdAt: 100,
      updatedAt: 100,
    })
    expect(exampleStory.chapters).toHaveLength(5)
    await expect(getStories()).resolves.toEqual([exampleStory.story])

    const introChapter = exampleStory.chapters[0]
    const nextChapters = await getNextChapters(introChapter.id)

    expect(introChapter).toMatchObject({
      title: 'A Light in the Pines',
      parentChapterId: null,
    })
    expect(nextChapters.map((chapter) => chapter.title)).toEqual([
      'Cross the Moonlit Bridge',
      'Follow the Willow Lights',
    ])
  })

  it('returns the existing example story without duplicating it', async () => {
    const firstExampleStory = await createExampleStory()
    const secondExampleStory = await createExampleStory()
    const chapters = await getChaptersByStoryId(firstExampleStory.story.id)

    expect(secondExampleStory.story).toEqual(firstExampleStory.story)
    expect(secondExampleStory.chapters).toEqual(chapters)
    expect(chapters).toHaveLength(5)
    await expect(getStories()).resolves.toEqual([firstExampleStory.story])
  })
})
