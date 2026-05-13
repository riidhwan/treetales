import { useEffect, useMemo, useState } from 'react'

import {
  getChaptersByStoryId,
  getNextChapters,
} from '@/services/chapterDb'
import { getStoryById } from '@/services/storyDb'
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
  const [visitedChapters, setVisitedChapters] = useState<Chapter[]>([])

  const { currentChapter, status } = readerState
  const previousChapter = useMemo(
    () =>
      visitedChapters.length > 1
        ? visitedChapters[visitedChapters.length - 2]
        : undefined,
    [visitedChapters],
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
            status: 'ready',
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
        return currentPath.slice(0, currentPathIndex + 1)
      }

      return [currentChapter]
    })
  }, [currentChapter, status])

  function selectPreviousChapter() {
    if (!previousChapter) {
      return
    }

    setVisitedChapters((currentPath) => currentPath.slice(0, -1))
    onSelectChapter(previousChapter.id)
  }

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

  return {
    ...readerState,
    previousChapter,
    selectNextChapter,
    selectPreviousChapter,
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
