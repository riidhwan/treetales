import {
  CHAPTERS_STORE,
  CHAPTER_PARENT_IDS_INDEX,
  CHAPTER_STORY_ID_INDEX,
  STORIES_STORE,
  abortTransaction,
  openDb,
  requestToPromise,
  transactionDone,
} from '@/services/db'
import type {
  Chapter,
  CreateChapterInput,
  Story,
  UpdateChapterInput,
} from '@/services/types'

export async function createChapter(
  input: CreateChapterInput,
): Promise<Chapter> {
  const db = await openDb()

  try {
    const transaction = db.transaction(
      [STORIES_STORE, CHAPTERS_STORE],
      'readwrite',
    )
    const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
    const now = Date.now()
    const chapter: Chapter = {
      id: crypto.randomUUID(),
      storyId: input.storyId,
      title: input.title,
      content: input.content,
      parentChapterIds: [...input.parentChapterIds],
      createdAt: now,
      updatedAt: now,
    }

    await validateChapterWrite(transaction, chapter)
    chaptersStore.add(chapter)
    await transactionDone(transaction)

    return chapter
  } finally {
    db.close()
  }
}

export async function getChapterById(
  id: string,
): Promise<Chapter | undefined> {
  const db = await openDb()

  try {
    const transaction = db.transaction(CHAPTERS_STORE, 'readonly')
    const store = transaction.objectStore(CHAPTERS_STORE)
    const chapter = await requestToPromise<Chapter | undefined>(store.get(id))

    await transactionDone(transaction)

    return chapter
  } finally {
    db.close()
  }
}

export async function getChaptersByStoryId(storyId: string): Promise<Chapter[]> {
  const db = await openDb()

  try {
    const transaction = db.transaction(CHAPTERS_STORE, 'readonly')
    const store = transaction.objectStore(CHAPTERS_STORE)
    const index = store.index(CHAPTER_STORY_ID_INDEX)
    const chapters = await requestToPromise<Chapter[]>(index.getAll(storyId))

    await transactionDone(transaction)

    return sortByCreatedAt(chapters)
  } finally {
    db.close()
  }
}

export async function getNextChapters(chapterId: string): Promise<Chapter[]> {
  const db = await openDb()

  try {
    const transaction = db.transaction(CHAPTERS_STORE, 'readonly')
    const store = transaction.objectStore(CHAPTERS_STORE)
    const index = store.index(CHAPTER_PARENT_IDS_INDEX)
    const chapters = await requestToPromise<Chapter[]>(index.getAll(chapterId))

    await transactionDone(transaction)

    return sortByCreatedAt(chapters)
  } finally {
    db.close()
  }
}

function sortByCreatedAt<TItem extends { id: string; createdAt: number }>(
  items: TItem[],
): TItem[] {
  return [...items].sort((firstItem, secondItem) => {
    if (firstItem.createdAt !== secondItem.createdAt) {
      return firstItem.createdAt - secondItem.createdAt
    }

    return firstItem.id.localeCompare(secondItem.id)
  })
}

export async function updateChapter(
  id: string,
  input: UpdateChapterInput,
): Promise<Chapter | undefined> {
  const db = await openDb()

  try {
    const transaction = db.transaction(
      [STORIES_STORE, CHAPTERS_STORE],
      'readwrite',
    )
    const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
    const chapter = await requestToPromise<Chapter | undefined>(
      chaptersStore.get(id),
    )

    if (!chapter) {
      await transactionDone(transaction)
      return undefined
    }

    const updatedChapter: Chapter = {
      ...chapter,
      ...input,
      parentChapterIds: input.parentChapterIds
        ? [...input.parentChapterIds]
        : chapter.parentChapterIds,
      updatedAt: Date.now(),
    }

    await validateChapterWrite(transaction, updatedChapter)
    chaptersStore.put(updatedChapter)
    await transactionDone(transaction)

    return updatedChapter
  } finally {
    db.close()
  }
}

export async function deleteChapter(id: string): Promise<boolean> {
  const db = await openDb()

  try {
    const transaction = db.transaction(CHAPTERS_STORE, 'readwrite')
    const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
    const chapter = await requestToPromise<Chapter | undefined>(
      chaptersStore.get(id),
    )

    if (!chapter) {
      await transactionDone(transaction)
      return false
    }

    const storyChapters = await requestToPromise<Chapter[]>(
      chaptersStore.index(CHAPTER_STORY_ID_INDEX).getAll(chapter.storyId),
    )

    for (const storyChapter of storyChapters) {
      if (!storyChapter.parentChapterIds.includes(id)) {
        continue
      }

      chaptersStore.put({
        ...storyChapter,
        parentChapterIds: storyChapter.parentChapterIds.filter(
          (parentChapterId) => parentChapterId !== id,
        ),
        updatedAt: Date.now(),
      } satisfies Chapter)
    }

    chaptersStore.delete(id)
    await transactionDone(transaction)

    return true
  } finally {
    db.close()
  }
}

async function validateChapterWrite(
  transaction: IDBTransaction,
  chapter: Chapter,
): Promise<void> {
  const storiesStore = transaction.objectStore(STORIES_STORE)
  const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
  const story = await requestToPromise<Story | undefined>(
    storiesStore.get(chapter.storyId),
  )

  if (!story) {
    abortTransaction(
      transaction,
      new Error(`Story ${chapter.storyId} does not exist.`),
    )
  }

  const uniqueParentIds = new Set(chapter.parentChapterIds)

  if (uniqueParentIds.size !== chapter.parentChapterIds.length) {
    abortTransaction(
      transaction,
      new Error('A chapter cannot list the same parent more than once.'),
    )
  }

  if (uniqueParentIds.has(chapter.id)) {
    abortTransaction(transaction, new Error('A chapter cannot parent itself.'))
  }

  const storyChapters = await requestToPromise<Chapter[]>(
    chaptersStore.index(CHAPTER_STORY_ID_INDEX).getAll(chapter.storyId),
  )
  const chapterById = new Map(
    storyChapters.map((storyChapter) => [storyChapter.id, storyChapter]),
  )

  for (const parentChapterId of chapter.parentChapterIds) {
    const parentChapter = chapterById.get(parentChapterId)

    if (!parentChapter) {
      abortTransaction(
        transaction,
        new Error(
          `Parent chapter ${parentChapterId} does not exist in story ${chapter.storyId}.`,
        ),
      )
    }
  }

  chapterById.set(chapter.id, chapter)

  for (const parentChapterId of chapter.parentChapterIds) {
    if (canReachChapter(chapter.id, parentChapterId, chapterById)) {
      abortTransaction(
        transaction,
        new Error('Chapter parent relationships cannot contain cycles.'),
      )
    }
  }
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
      if (!chapter.parentChapterIds.includes(currentChapterId)) {
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
