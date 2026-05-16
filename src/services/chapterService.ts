import { getPgliteDb } from '@/repositories/pglite/db'
import { createPgliteChapterRepository } from '@/repositories/pglite/chapterRepository'
import type { ChapterRepository } from '@/repositories/types'
import type {
  Chapter,
  CreateChapterInput,
  UpdateChapterInput,
} from '@/services/types'

export async function createChapter(
  input: CreateChapterInput,
): Promise<Chapter> {
  const now = Date.now()
  const chapter: Chapter = {
    id: crypto.randomUUID(),
    storyId: input.storyId,
    title: input.title,
    content: input.content,
    parentChapterId: input.parentChapterId,
    createdAt: now,
    updatedAt: now,
  }

  const chapterRepository = await getChapterRepository()
  await chapterRepository.insertChapter(chapter)

  return chapter
}

export async function getChapterById(id: string): Promise<Chapter | undefined> {
  const chapterRepository = await getChapterRepository()

  return chapterRepository.findChapterById(id)
}

export async function getChaptersByStoryId(storyId: string): Promise<Chapter[]> {
  const chapterRepository = await getChapterRepository()

  return chapterRepository.findChaptersByStoryId(storyId)
}

export async function getIntroChapterByStoryId(
  storyId: string,
): Promise<Chapter | undefined> {
  const chapterRepository = await getChapterRepository()

  return chapterRepository.findIntroChapterByStoryId(storyId)
}

export async function getNextChapters(chapterId: string): Promise<Chapter[]> {
  const chapterRepository = await getChapterRepository()

  return chapterRepository.findChildChapters(chapterId)
}

export async function updateChapter(
  id: string,
  input: UpdateChapterInput,
): Promise<Chapter | undefined> {
  const chapterRepository = await getChapterRepository()

  return chapterRepository.updateChapter(id, {
    ...input,
    updatedAt: Date.now(),
  })
}

export async function deleteChapter(id: string): Promise<boolean> {
  const chapterRepository = await getChapterRepository()

  return chapterRepository.deleteChapter(id, {
    unlinkedChildrenUpdatedAt: Date.now(),
  })
}

async function getChapterRepository(): Promise<ChapterRepository> {
  const db = await getPgliteDb()

  return createPgliteChapterRepository(db)
}
