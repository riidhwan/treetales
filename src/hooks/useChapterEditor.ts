import { useEffect, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import { getChapterById, updateChapter } from '@/services/chapterDb'
import { getStoryById } from '@/services/storyService'
import type { Chapter, Story, UpdateChapterInput } from '@/services/types'

export interface ChapterEditorServices {
  readonly getChapterById: (chapterId: string) => Promise<Chapter | undefined>
  readonly getStoryById: (storyId: string) => Promise<Story | undefined>
  readonly updateChapter: (
    chapterId: string,
    input: UpdateChapterInput,
  ) => Promise<Chapter | undefined>
}

export const DEFAULT_CHAPTER_EDITOR_SERVICES: ChapterEditorServices = {
  getChapterById,
  getStoryById,
  updateChapter,
}

export type ChapterEditorStatus =
  | 'loading'
  | 'ready'
  | 'missing-story'
  | 'missing-chapter'

interface UseChapterEditorOptions {
  readonly chapterId: string
  readonly services?: ChapterEditorServices
  readonly storyId: string
}

export function useChapterEditor({
  chapterId,
  services = DEFAULT_CHAPTER_EDITOR_SERVICES,
  storyId,
}: UseChapterEditorOptions) {
  const [chapter, setChapter] = useState<Chapter | undefined>()
  const [content, setContent] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<ChapterEditorStatus>('loading')
  const [story, setStory] = useState<Story | undefined>()
  const [successMessage, setSuccessMessage] = useState<string | undefined>()
  const [title, setTitle] = useState('')

  const trimmedTitle = title.trim()
  const canSave =
    Boolean(chapter) &&
    status === 'ready' &&
    trimmedTitle.length > 0 &&
    !isSaving

  useEffect(() => {
    let isCurrent = true

    async function loadChapter() {
      setStatus('loading')
      setErrorMessage(undefined)
      setSuccessMessage(undefined)

      try {
        const loadedStory = await services.getStoryById(storyId)

        if (!isCurrent) {
          return
        }

        if (!loadedStory) {
          setChapter(undefined)
          setStory(undefined)
          setStatus('missing-story')
          return
        }

        const loadedChapter = await services.getChapterById(chapterId)

        if (!isCurrent) {
          return
        }

        if (!loadedChapter || loadedChapter.storyId !== storyId) {
          setChapter(undefined)
          setStory(loadedStory)
          setStatus('missing-chapter')
          return
        }

        setChapter(loadedChapter)
        setContent(loadedChapter.content)
        setStory(loadedStory)
        setTitle(loadedChapter.title)
        setStatus('ready')
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error))
          setStatus('ready')
        }
      }
    }

    void loadChapter()

    return () => {
      isCurrent = false
    }
  }, [chapterId, services, storyId])

  async function saveChapter() {
    if (!canSave) {
      return
    }

    setIsSaving(true)
    setErrorMessage(undefined)
    setSuccessMessage(undefined)

    try {
      const updatedChapter = await services.updateChapter(chapterId, {
        content,
        title: trimmedTitle,
      })

      if (!updatedChapter || updatedChapter.storyId !== storyId) {
        setChapter(undefined)
        setStatus('missing-chapter')
        return
      }

      setChapter(updatedChapter)
      setContent(updatedChapter.content)
      setTitle(updatedChapter.title)
      setSuccessMessage('Chapter saved.')
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    canSave,
    chapter,
    content,
    errorMessage,
    isSaving,
    saveChapter,
    setContent,
    setTitle,
    status,
    story,
    successMessage,
    title,
  }
}
