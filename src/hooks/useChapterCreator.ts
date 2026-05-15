import { useEffect, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import {
  createChapter,
  getChapterById,
  getIntroChapterByStoryId,
} from '@/services/chapterDb'
import { getStoryById } from '@/services/storyService'
import type { Chapter, CreateChapterInput, Story } from '@/services/types'

export interface ChapterCreatorServices {
  readonly createChapter: (input: CreateChapterInput) => Promise<Chapter>
  readonly getChapterById: (chapterId: string) => Promise<Chapter | undefined>
  readonly getIntroChapterByStoryId: (
    storyId: string,
  ) => Promise<Chapter | undefined>
  readonly getStoryById: (storyId: string) => Promise<Story | undefined>
}

export const DEFAULT_CHAPTER_CREATOR_SERVICES: ChapterCreatorServices = {
  createChapter,
  getChapterById,
  getIntroChapterByStoryId,
  getStoryById,
}

export type ChapterCreatorStatus =
  | 'loading'
  | 'ready'
  | 'missing-story'
  | 'missing-parent-chapter'
  | 'intro-chapter-exists'
  | 'error'

interface UseChapterCreatorOptions {
  readonly parentChapterId?: string
  readonly services?: ChapterCreatorServices
  readonly storyId: string
}

export function useChapterCreator({
  parentChapterId,
  services = DEFAULT_CHAPTER_CREATOR_SERVICES,
  storyId,
}: UseChapterCreatorOptions) {
  const [content, setContent] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [isCreating, setIsCreating] = useState(false)
  const [introChapter, setIntroChapter] = useState<Chapter | undefined>()
  const [parentChapter, setParentChapter] = useState<Chapter | undefined>()
  const [status, setStatus] = useState<ChapterCreatorStatus>('loading')
  const [story, setStory] = useState<Story | undefined>()
  const [title, setTitle] = useState('')

  const trimmedTitle = title.trim()
  const canCreate =
    status === 'ready' &&
    trimmedTitle.length > 0 &&
    !isCreating

  useEffect(() => {
    let isCurrent = true

    async function loadChapterContext() {
      setStatus('loading')
      setErrorMessage(undefined)

      try {
        const loadedStory = await services.getStoryById(storyId)

        if (!isCurrent) {
          return
        }

        if (!loadedStory) {
          setParentChapter(undefined)
          setIntroChapter(undefined)
          setStory(undefined)
          setStatus('missing-story')
          return
        }

        if (!parentChapterId) {
          const loadedIntroChapter =
            await services.getIntroChapterByStoryId(storyId)

          if (!isCurrent) {
            return
          }

          setParentChapter(undefined)
          setIntroChapter(loadedIntroChapter)
          setStory(loadedStory)
          setStatus(
            loadedIntroChapter ? 'intro-chapter-exists' : 'ready',
          )
          return
        }

        const loadedParentChapter =
          await services.getChapterById(parentChapterId)

        if (!isCurrent) {
          return
        }

        if (
          !loadedParentChapter ||
          loadedParentChapter.storyId !== storyId
        ) {
          setIntroChapter(undefined)
          setParentChapter(undefined)
          setStory(loadedStory)
          setStatus('missing-parent-chapter')
          return
        }

        setIntroChapter(undefined)
        setParentChapter(loadedParentChapter)
        setStory(loadedStory)
        setStatus('ready')
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error))
          setIntroChapter(undefined)
          setParentChapter(undefined)
          setStatus('error')
        }
      }
    }

    void loadChapterContext()

    return () => {
      isCurrent = false
    }
  }, [parentChapterId, services, storyId])

  async function createChapterFromForm() {
    if (!canCreate) {
      return undefined
    }

    setIsCreating(true)
    setErrorMessage(undefined)

    try {
      return await services.createChapter({
        content,
        parentChapterId: parentChapterId ?? null,
        storyId,
        title: trimmedTitle,
      })
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      return undefined
    } finally {
      setIsCreating(false)
    }
  }

  return {
    canCreate,
    content,
    createChapterFromForm,
    errorMessage,
    introChapter,
    isCreating,
    parentChapter,
    setContent,
    setTitle,
    status,
    story,
    title,
  }
}
