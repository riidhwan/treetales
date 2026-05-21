import { sortByCreatedAt } from '@/lib/sorting'
import type {
  ChapterRepository,
  DeleteChapterRepositoryInput,
  UpdateChapterRepositoryInput,
} from '@/repositories/types'
import {
  CHAPTERS_STORE,
  CHAPTER_PARENT_ID_INDEX,
  CHAPTER_STORY_ID_INDEX,
  STORIES_STORE,
  abortTransaction,
  requestToPromise,
  typedRequest,
} from '@/repositories/indexedDb/db'
import type { StoreName } from '@/repositories/indexedDb/db'
import {
  type IndexedDbRepositoryOptions,
  withIndexedDbTransaction,
} from '@/repositories/indexedDb/transaction'
import type { Chapter, Story } from '@/services/types'

export function createIndexedDbChapterRepository(
  options: IndexedDbRepositoryOptions = {},
): ChapterRepository {
  return {
    insertChapter: (chapter) => insertChapter(options, chapter),
    findChapterById: (id) => findChapterById(options, id),
    findChaptersByStoryId: (storyId) => findChaptersByStoryId(options, storyId),
    findIntroChapterByStoryId: (storyId) =>
      findIntroChapterByStoryId(options, storyId),
    findChildChapters: (chapterId) => findChildChapters(options, chapterId),
    updateChapter: (id, input) => updateChapter(options, id, input),
    deleteChapter: (id, input) => deleteChapter(options, id, input),
  }
}

async function insertChapter(
  options: IndexedDbRepositoryOptions,
  chapter: Chapter,
): Promise<void> {
  await withTransaction(
    options,
    [STORIES_STORE, CHAPTERS_STORE],
    'readwrite',
    async (transaction) => {
      const chaptersStore = transaction.objectStore(CHAPTERS_STORE)

      await validateChapterWrite(transaction, chapter)
      await requestToPromise(
        typedRequest<IDBValidKey>(chaptersStore.add(chapter)),
      )
    },
  )
}

async function findChapterById(
  options: IndexedDbRepositoryOptions,
  id: string,
): Promise<Chapter | undefined> {
  return withChapterStore(options, 'readonly', (store) =>
    requestToPromise(typedRequest<Chapter | undefined>(store.get(id))),
  )
}

async function findChaptersByStoryId(
  options: IndexedDbRepositoryOptions,
  storyId: string,
): Promise<Chapter[]> {
  return withChapterStore(options, 'readonly', async (store) => {
    const index = store.index(CHAPTER_STORY_ID_INDEX)
    const chapters = await requestToPromise(
      typedRequest<Chapter[]>(index.getAll(storyId)),
    )

    return sortByCreatedAt(chapters)
  })
}

async function findIntroChapterByStoryId(
  options: IndexedDbRepositoryOptions,
  storyId: string,
): Promise<Chapter | undefined> {
  return withChapterStore(options, 'readonly', (store) =>
    findIntroChapter(store.index(CHAPTER_STORY_ID_INDEX), storyId),
  )
}

async function findChildChapters(
  options: IndexedDbRepositoryOptions,
  chapterId: string,
): Promise<Chapter[]> {
  return withChapterStore(options, 'readonly', async (store) => {
    const index = store.index(CHAPTER_PARENT_ID_INDEX)
    const chapters = await requestToPromise(
      typedRequest<Chapter[]>(index.getAll(chapterId)),
    )

    return sortByCreatedAt(chapters)
  })
}

async function updateChapter(
  options: IndexedDbRepositoryOptions,
  id: string,
  input: UpdateChapterRepositoryInput,
): Promise<Chapter | undefined> {
  return withTransaction(
    options,
    [STORIES_STORE, CHAPTERS_STORE],
    'readwrite',
    async (transaction) => {
      const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
      const chapter = await requestToPromise(
        typedRequest<Chapter | undefined>(chaptersStore.get(id)),
      )

      if (!chapter) {
        return undefined
      }

      const updatedChapter: Chapter = {
        ...chapter,
        ...input,
        parentChapterId:
          'parentChapterId' in input
            ? (input.parentChapterId ?? null)
            : chapter.parentChapterId,
        updatedAt: input.updatedAt,
      }

      await validateChapterWrite(transaction, updatedChapter)
      await requestToPromise(
        typedRequest<IDBValidKey>(chaptersStore.put(updatedChapter)),
      )

      return updatedChapter
    },
  )
}

async function deleteChapter(
  options: IndexedDbRepositoryOptions,
  id: string,
  input: DeleteChapterRepositoryInput,
): Promise<boolean> {
  return withTransaction(
    options,
    [CHAPTERS_STORE],
    'readwrite',
    async (transaction) => {
      const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
      const chapter = await requestToPromise(
        typedRequest<Chapter | undefined>(chaptersStore.get(id)),
      )

      if (!chapter) {
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

        await requestToPromise(
          typedRequest<IDBValidKey>(
            chaptersStore.put({
              ...storyChapter,
              parentChapterId: null,
              updatedAt: input.unlinkedChildrenUpdatedAt,
            } satisfies Chapter),
          ),
        )
      }

      await requestToPromise(typedRequest<undefined>(chaptersStore.delete(id)))

      return true
    },
  )
}

async function withChapterStore<T>(
  options: IndexedDbRepositoryOptions,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  return withTransaction(options, [CHAPTERS_STORE], mode, (transaction) =>
    operation(transaction.objectStore(CHAPTERS_STORE)),
  )
}

async function withTransaction<T>(
  options: IndexedDbRepositoryOptions,
  storeNames: readonly StoreName[],
  mode: IDBTransactionMode,
  operation: (transaction: IDBTransaction) => Promise<T>,
): Promise<T> {
  return withIndexedDbTransaction(options, storeNames, mode, operation)
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

  if (chapter.parentChapterId !== null) {
    const parentChapter = chapterById.get(chapter.parentChapterId)

    if (!parentChapter) {
      abortTransaction(
        transaction,
        new Error(
          `Parent chapter ${chapter.parentChapterId} does not exist in story ${chapter.storyId}.`,
        ),
      )
    }
  } else {
    const existingIntroChapter = storyChapters.find(
      (storyChapter) =>
        storyChapter.parentChapterId === null && storyChapter.id !== chapter.id,
    )

    if (existingIntroChapter) {
      abortTransaction(
        transaction,
        new Error(`Story ${chapter.storyId} already has an intro chapter.`),
      )
    }
  }

  chapterById.set(chapter.id, chapter)

  if (
    chapter.parentChapterId !== null &&
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
