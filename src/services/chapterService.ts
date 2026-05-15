import { createIndexedDbChapterRepository } from '@/repositories/indexedDb/chapterRepository'
import type {
  Chapter,
  CreateChapterInput,
  UpdateChapterInput,
} from '@/services/types'

const chapterRepository = createIndexedDbChapterRepository()

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

  await chapterRepository.insertChapter(chapter)

  return chapter
}

export function getChapterById(id: string): Promise<Chapter | undefined> {
  return chapterRepository.findChapterById(id)
}

export function getChaptersByStoryId(storyId: string): Promise<Chapter[]> {
  return chapterRepository.findChaptersByStoryId(storyId)
}

export function getIntroChapterByStoryId(
  storyId: string,
): Promise<Chapter | undefined> {
  return chapterRepository.findIntroChapterByStoryId(storyId)
}

export function getNextChapters(chapterId: string): Promise<Chapter[]> {
  return chapterRepository.findChildChapters(chapterId)
}

export function updateChapter(
  id: string,
  input: UpdateChapterInput,
): Promise<Chapter | undefined> {
  return chapterRepository.updateChapter(id, {
    ...input,
    updatedAt: Date.now(),
  })
}

export function deleteChapter(id: string): Promise<boolean> {
  return chapterRepository.deleteChapter(id, {
    unlinkedChildrenUpdatedAt: Date.now(),
  })
}
