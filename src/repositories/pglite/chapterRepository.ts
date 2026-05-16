import type { PGliteInterface } from '@electric-sql/pglite'

import type {
  ChapterRepository,
  DeleteChapterRepositoryInput,
  UpdateChapterRepositoryInput,
} from '@/repositories/types'
import type { Chapter } from '@/services/types'

type TimestampColumn = number | string | bigint

interface ChapterRow {
  readonly id: string
  readonly story_id: string
  readonly title: string
  readonly content: string
  readonly parent_chapter_id: string | null
  readonly created_at: TimestampColumn
  readonly updated_at: TimestampColumn
}

interface StoryExistsRow {
  readonly exists: boolean
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

export function createPgliteChapterRepository(
  db: PgliteRepositoryExecutor,
): ChapterRepository {
  return {
    insertChapter: (chapter) => insertChapter(db, chapter),
    findChapterById: (id) => findChapterById(db, id),
    findChaptersByStoryId: (storyId) => findChaptersByStoryId(db, storyId),
    findIntroChapterByStoryId: (storyId) =>
      findIntroChapterByStoryId(db, storyId),
    findChildChapters: (chapterId) => findChildChapters(db, chapterId),
    updateChapter: (id, input) => updateChapter(db, id, input),
    deleteChapter: (id, input) => deleteChapter(db, id, input),
  }
}

async function insertChapter(
  db: PgliteRepositoryExecutor,
  chapter: Chapter,
): Promise<void> {
  await runPgliteWrite(db, async (transaction) => {
    await validateChapterWrite(transaction, chapter)
    await transaction.query(
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
      [
        chapter.id,
        chapter.storyId,
        chapter.title,
        chapter.content,
        chapter.parentChapterId,
        chapter.createdAt,
        chapter.updatedAt,
      ],
    )
  })
}

async function findChapterById(
  db: PgliteQueryExecutor,
  id: string,
): Promise<Chapter | undefined> {
  const result = await db.query<ChapterRow>(
    `
      SELECT
        id,
        story_id,
        title,
        content,
        parent_chapter_id,
        created_at,
        updated_at
      FROM chapters
      WHERE id = $1
    `,
    [id],
  )

  return result.rows[0] ? mapChapterRow(result.rows[0]) : undefined
}

async function findChaptersByStoryId(
  db: PgliteQueryExecutor,
  storyId: string,
): Promise<Chapter[]> {
  const result = await db.query<ChapterRow>(
    `
      SELECT
        id,
        story_id,
        title,
        content,
        parent_chapter_id,
        created_at,
        updated_at
      FROM chapters
      WHERE story_id = $1
      ORDER BY created_at, id
    `,
    [storyId],
  )

  return result.rows.map(mapChapterRow)
}

async function findIntroChapterByStoryId(
  db: PgliteQueryExecutor,
  storyId: string,
): Promise<Chapter | undefined> {
  const result = await db.query<ChapterRow>(
    `
      SELECT
        id,
        story_id,
        title,
        content,
        parent_chapter_id,
        created_at,
        updated_at
      FROM chapters
      WHERE story_id = $1 AND parent_chapter_id IS NULL
      ORDER BY created_at, id
      LIMIT 1
    `,
    [storyId],
  )

  return result.rows[0] ? mapChapterRow(result.rows[0]) : undefined
}

async function findChildChapters(
  db: PgliteQueryExecutor,
  chapterId: string,
): Promise<Chapter[]> {
  const result = await db.query<ChapterRow>(
    `
      SELECT
        id,
        story_id,
        title,
        content,
        parent_chapter_id,
        created_at,
        updated_at
      FROM chapters
      WHERE parent_chapter_id = $1
      ORDER BY created_at, id
    `,
    [chapterId],
  )

  return result.rows.map(mapChapterRow)
}

async function updateChapter(
  db: PgliteRepositoryExecutor,
  id: string,
  input: UpdateChapterRepositoryInput,
): Promise<Chapter | undefined> {
  return runPgliteWrite(db, async (transaction) => {
    const currentChapter = await findChapterById(transaction, id)

    if (!currentChapter) {
      return undefined
    }

    const updatedChapter: Chapter = {
      ...currentChapter,
      ...input,
      parentChapterId:
        'parentChapterId' in input
          ? (input.parentChapterId ?? null)
          : currentChapter.parentChapterId,
      updatedAt: input.updatedAt,
    }

    await validateChapterWrite(transaction, updatedChapter)

    const result = await transaction.query<ChapterRow>(
      `
        UPDATE chapters
        SET
          title = $2,
          content = $3,
          parent_chapter_id = $4,
          updated_at = $5
        WHERE id = $1
        RETURNING
          id,
          story_id,
          title,
          content,
          parent_chapter_id,
          created_at,
          updated_at
      `,
      [
        id,
        updatedChapter.title,
        updatedChapter.content,
        updatedChapter.parentChapterId,
        updatedChapter.updatedAt,
      ],
    )

    return result.rows[0] ? mapChapterRow(result.rows[0]) : undefined
  })
}

async function deleteChapter(
  db: PgliteRepositoryExecutor,
  id: string,
  input: DeleteChapterRepositoryInput,
): Promise<boolean> {
  return runPgliteWrite(db, async (transaction) => {
    const chapter = await findChapterById(transaction, id)

    if (!chapter) {
      return false
    }

    const directChildResult = await transaction.query<{ readonly id: string }>(
      `
        SELECT id
        FROM chapters
        WHERE story_id = $1 AND parent_chapter_id = $2
      `,
      [chapter.storyId, id],
    )

    const result = await transaction.query<{ readonly id: string }>(
      'DELETE FROM chapters WHERE id = $1 RETURNING id',
      [id],
    )

    if (result.rows.length === 0) {
      return false
    }

    for (const child of directChildResult.rows) {
      await transaction.query(
        `
          UPDATE chapters
          SET updated_at = $2
          WHERE id = $1
        `,
        [child.id, input.unlinkedChildrenUpdatedAt],
      )
    }

    return true
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

async function validateChapterWrite(
  db: PgliteQueryExecutor,
  chapter: Chapter,
): Promise<void> {
  const storyResult = await db.query<StoryExistsRow>(
    'SELECT EXISTS(SELECT 1 FROM stories WHERE id = $1) AS exists',
    [chapter.storyId],
  )

  if (!storyResult.rows[0]?.exists) {
    throw new Error(`Story ${chapter.storyId} does not exist.`)
  }

  if (chapter.parentChapterId === chapter.id) {
    throw new Error('A chapter cannot parent itself.')
  }

  const storyChapters = await findChaptersByStoryId(db, chapter.storyId)
  const chapterById = new Map(
    storyChapters.map((storyChapter) => [storyChapter.id, storyChapter]),
  )

  if (chapter.parentChapterId) {
    const parentChapter = chapterById.get(chapter.parentChapterId)

    if (!parentChapter) {
      throw new Error(
        `Parent chapter ${chapter.parentChapterId} does not exist in story ${chapter.storyId}.`,
      )
    }
  }

  chapterById.set(chapter.id, chapter)

  if (
    chapter.parentChapterId &&
    canReachChapter(chapter.id, chapter.parentChapterId, chapterById)
  ) {
    throw new Error('Chapter parent relationships cannot contain cycles.')
  }
}

function mapChapterRow(row: ChapterRow): Chapter {
  return {
    id: row.id,
    storyId: row.story_id,
    title: row.title,
    content: row.content,
    parentChapterId: row.parent_chapter_id,
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

function canReachChapter(
  fromChapterId: string,
  targetChapterId: string,
  chapterById: Map<string, Chapter>,
): boolean {
  const visitedChapterIds = new Set<string>()
  const pendingChapterIds = [fromChapterId]

  while (pendingChapterIds.length > 0) {
    const currentChapterId = pendingChapterIds.pop()

    if (!currentChapterId || visitedChapterIds.has(currentChapterId)) {
      continue
    }

    visitedChapterIds.add(currentChapterId)

    for (const chapter of chapterById.values()) {
      if (chapter.parentChapterId !== currentChapterId) {
        continue
      }

      if (chapter.id === targetChapterId) {
        return true
      }

      pendingChapterIds.push(chapter.id)
    }
  }

  return false
}
