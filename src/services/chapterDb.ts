import { sortByCreatedAt } from '@/lib/sorting'
import {
  CHAPTERS_STORE,
  CHAPTER_PARENT_ID_INDEX,
  CHAPTER_STORY_ID_INDEX,
  STORIES_STORE,
  abortTransaction,
  openDb,
  requestToPromise,
  typedRequest,
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
      parentChapterId: input.parentChapterId,
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
    const chapter = await requestToPromise(
      typedRequest<Chapter | undefined>(store.get(id)),
    )

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
    const chapters = await requestToPromise(
      typedRequest<Chapter[]>(index.getAll(storyId)),
    )

    await transactionDone(transaction)

    return sortByCreatedAt(chapters)
  } finally {
    db.close()
  }
}

export async function getIntroChapterByStoryId(
  storyId: string,
): Promise<Chapter | undefined> {
  const db = await openDb()

  try {
    const transaction = db.transaction(CHAPTERS_STORE, 'readonly')
    const store = transaction.objectStore(CHAPTERS_STORE)
    const index = store.index(CHAPTER_STORY_ID_INDEX)
    const introChapter = await findIntroChapter(index, storyId)

    await transactionDone(transaction)

    return introChapter
  } finally {
    db.close()
  }
}

export async function getNextChapters(chapterId: string): Promise<Chapter[]> {
  const db = await openDb()

  try {
    const transaction = db.transaction(CHAPTERS_STORE, 'readonly')
    const store = transaction.objectStore(CHAPTERS_STORE)
    const index = store.index(CHAPTER_PARENT_ID_INDEX)
    const chapters = await requestToPromise(
      typedRequest<Chapter[]>(index.getAll(chapterId)),
    )

    await transactionDone(transaction)

    return sortByCreatedAt(chapters)
  } finally {
    db.close()
  }
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
    const chapter = await requestToPromise(
      typedRequest<Chapter | undefined>(chaptersStore.get(id)),
    )

    if (!chapter) {
      await transactionDone(transaction)
      return undefined
    }

    const updatedChapter: Chapter = {
      ...chapter,
      ...input,
      parentChapterId:
        'parentChapterId' in input
          ? (input.parentChapterId ?? null)
          : chapter.parentChapterId,
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
    const chapter = await requestToPromise(
      typedRequest<Chapter | undefined>(chaptersStore.get(id)),
    )

    if (!chapter) {
      await transactionDone(transaction)
      return false
    }

    const storyChapters = await requestToPromise(
      typedRequest<Chapter[]>(
        chaptersStore.index(CHAPTER_STORY_ID_INDEX).getAll(chapter.storyId),
      ),
    )

    for (const storyChapter of storyChapters) {
      if (storyChapter.parentChapterId !== id) {
        continue
      }

      chaptersStore.put({
        ...storyChapter,
        parentChapterId: null,
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

function findIntroChapter(
  index: IDBIndex,
  storyId: string,
): Promise<Chapter | undefined> {
  return new Promise((resolve, reject) => {
    const request = index.openCursor(storyId)
    let introChapter: Chapter | undefined

    request.onsuccess = () => {
      const cursor = request.result

      if (!cursor) {
        resolve(introChapter)
        return
      }

      const chapter = cursor.value as Chapter

      if (
        chapter.parentChapterId === null &&
        (!introChapter || compareChapterOrder(chapter, introChapter) < 0)
      ) {
        introChapter = chapter
      }

      cursor.continue()
    }

    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB request failed.'))
    }
  })
}

async function validateChapterWrite(
  transaction: IDBTransaction,
  chapter: Chapter,
): Promise<void> {
  const storiesStore = transaction.objectStore(STORIES_STORE)
  const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
  const story = await requestToPromise(
    typedRequest<Story | undefined>(storiesStore.get(chapter.storyId)),
  )

  if (!story) {
    abortTransaction(
      transaction,
      new Error(`Story ${chapter.storyId} does not exist.`),
    )
  }

  if (chapter.parentChapterId === chapter.id) {
    abortTransaction(transaction, new Error('A chapter cannot parent itself.'))
  }

  const storyChapters = await requestToPromise(
    typedRequest<Chapter[]>(
      chaptersStore.index(CHAPTER_STORY_ID_INDEX).getAll(chapter.storyId),
    ),
  )
  const chapterById = new Map(
    storyChapters.map((storyChapter) => [storyChapter.id, storyChapter]),
  )

  if (chapter.parentChapterId) {
    const parentChapter = chapterById.get(chapter.parentChapterId)

    if (!parentChapter) {
      abortTransaction(
        transaction,
        new Error(
          `Parent chapter ${chapter.parentChapterId} does not exist in story ${chapter.storyId}.`,
        ),
      )
    }
  }

  chapterById.set(chapter.id, chapter)

  if (
    chapter.parentChapterId &&
    canReachChapter(chapter.id, chapter.parentChapterId, chapterById)
  ) {
    abortTransaction(
      transaction,
      new Error('Chapter parent relationships cannot contain cycles.'),
    )
  }
}

function compareChapterOrder(left: Chapter, right: Chapter): number {
  if (left.createdAt !== right.createdAt) {
    return left.createdAt - right.createdAt
  }

  return left.id.localeCompare(right.id)
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
