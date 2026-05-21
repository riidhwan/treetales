import { useEffect, useMemo, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import {
  getChaptersByStoryId,
  getNextChapters,
} from '@/services/chapterService'
import { getStoryById } from '@/services/storyService'
import type { Chapter, Story } from '@/services/types'

export interface StoryReaderServices {
  readonly getChaptersByStoryId: (storyId: string) => Promise<Chapter[]>
  readonly getNextChapters: (chapterId: string) => Promise<Chapter[]>
  readonly getStoryById: (storyId: string) => Promise<Story | undefined>
}

export const DEFAULT_STORY_READER_SERVICES: StoryReaderServices = {
  getChaptersByStoryId,
  getNextChapters,
  getStoryById,
}

export type ReaderStatus =
  | 'loading'
  | 'ready'
  | 'missing-story'
  | 'missing-chapter'
  | 'error'

interface ReaderState {
  readonly chapters: Chapter[]
  readonly currentChapter?: Chapter
  readonly errorMessage?: string
  readonly nextChapters: Chapter[]
  readonly status: ReaderStatus
  readonly story?: Story
}

interface UseStoryReaderOptions {
  readonly chapterId?: string
  readonly onSelectChapter: (chapterId: string) => void
  readonly services?: StoryReaderServices
  readonly storyId: string
}

export function useStoryReader({
  chapterId,
  onSelectChapter,
  services = DEFAULT_STORY_READER_SERVICES,
  storyId,
}: UseStoryReaderOptions) {
  const [readerState, setReaderState] = useState<ReaderState>({
    chapters: [],
    nextChapters: [],
    status: 'loading',
  })
  const [, setVisitedChapters] = useState<Chapter[]>([])

  const { currentChapter, status } = readerState
  const parentChapter = useMemo(
    () =>
      currentChapter?.parentChapterId
        ? readerState.chapters.find(
            (chapter) => chapter.id === currentChapter.parentChapterId,
          )
        : undefined,
    [currentChapter, readerState.chapters],
  )
  useEffect(() => {
    setVisitedChapters([])
  }, [storyId])

  useEffect(() => {
    let isCurrent = true

    async function loadReader() {
      setReaderState({
        chapters: [],
        nextChapters: [],
        status: 'loading',
      })

      try {
        const loadedStory = await services.getStoryById(storyId)

        if (!isCurrent) {
          return
        }

        if (!loadedStory) {
          setReaderState({
            chapters: [],
            nextChapters: [],
            status: 'missing-story',
          })
          return
        }

        const chapters = await services.getChaptersByStoryId(storyId)

        if (!isCurrent) {
          return
        }

        const selectedChapter = chapterId
          ? chapters.find((chapter) => chapter.id === chapterId)
          : chapters[0]

        if (!selectedChapter) {
          setReaderState({
            chapters,
            nextChapters: [],
            status: chapterId ? 'missing-chapter' : 'ready',
            story: loadedStory,
          })
          return
        }

        const loadedNextChapters = await services.getNextChapters(
          selectedChapter.id,
        )

        if (!isCurrent) {
          return
        }

        setReaderState({
          chapters,
          currentChapter: selectedChapter,
          nextChapters: loadedNextChapters.filter(
            (nextChapter) => nextChapter.storyId === storyId,
          ),
          status: 'ready',
          story: loadedStory,
        })
      } catch (error) {
        if (isCurrent) {
          setReaderState({
            chapters: [],
            errorMessage: getErrorMessage(error),
            nextChapters: [],
            status: 'error',
          })
        }
      }
    }

    void loadReader()

    return () => {
      isCurrent = false
    }
  }, [chapterId, services, storyId])

  useEffect(() => {
    if (status !== 'ready' || !currentChapter) {
      return
    }

    setVisitedChapters((currentPath) => {
      if (currentPath.length === 0) {
        return [currentChapter]
      }

      const currentPathIndex = currentPath.findIndex(
        (visitedChapter) => visitedChapter.id === currentChapter.id,
      )

      if (currentPathIndex === currentPath.length - 1) {
        return currentPath.map((visitedChapter, index) =>
          index === currentPathIndex ? currentChapter : visitedChapter,
        )
      }

      if (currentPathIndex >= 0) {
        return currentPath
      }

      return [currentChapter]
    })
  }, [currentChapter, status])

  function selectNextChapter(nextChapter: Chapter) {
    setVisitedChapters((currentPath) => {
      const pathWithCurrent =
        currentChapter &&
        currentPath.every(
          (visitedChapter) => visitedChapter.id !== currentChapter.id,
        )
          ? [currentChapter]
          : currentPath

      if (
        pathWithCurrent[pathWithCurrent.length - 1]?.id === nextChapter.id
      ) {
        return pathWithCurrent
      }

      return [...pathWithCurrent, nextChapter]
    })
    onSelectChapter(nextChapter.id)
  }

  function selectParentChapter() {
    if (!parentChapter) {
      return
    }

    setVisitedChapters((currentPath) => {
      const parentPathIndex = currentPath.findIndex(
        (visitedChapter) => visitedChapter.id === parentChapter.id,
      )

      if (parentPathIndex >= 0) {
        return currentPath.slice(0, parentPathIndex + 1)
      }

      return [parentChapter]
    })
    onSelectChapter(parentChapter.id)
  }

  return {
    ...readerState,
    parentChapter,
    selectNextChapter,
    selectParentChapter,
  }
}
