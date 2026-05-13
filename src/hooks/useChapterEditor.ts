import { useEffect, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import {
  createChapter,
  getChapterById,
  getNextChapters,
  updateChapter,
} from '@/services/chapterDb'
import { getStoryById } from '@/services/storyDb'
import type {
  Chapter,
  CreateChapterInput,
  Story,
  UpdateChapterInput,
} from '@/services/types'

export interface ChapterEditorServices {
  readonly createChapter: (input: CreateChapterInput) => Promise<Chapter>
  readonly getChapterById: (chapterId: string) => Promise<Chapter | undefined>
  readonly getNextChapters: (chapterId: string) => Promise<Chapter[]>
  readonly getStoryById: (storyId: string) => Promise<Story | undefined>
  readonly updateChapter: (
    chapterId: string,
    input: UpdateChapterInput,
  ) => Promise<Chapter | undefined>
}

export const DEFAULT_CHAPTER_EDITOR_SERVICES: ChapterEditorServices = {
  createChapter,
  getChapterById,
  getNextChapters,
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
  const [childChapters, setChildChapters] = useState<Chapter[]>([])
  const [content, setContent] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [isCreatingChildChapter, setIsCreatingChildChapter] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newChildChapterTitle, setNewChildChapterTitle] =
    useState('New chapter')
  const [status, setStatus] = useState<ChapterEditorStatus>('loading')
  const [story, setStory] = useState<Story | undefined>()
  const [successMessage, setSuccessMessage] = useState<string | undefined>()
  const [title, setTitle] = useState('')

  const trimmedTitle = title.trim()
  const trimmedNewChildChapterTitle = newChildChapterTitle.trim()
  const canSave =
    Boolean(chapter) &&
    status === 'ready' &&
    trimmedTitle.length > 0 &&
    !isSaving
  const canCreateChildChapter =
    Boolean(chapter) &&
    status === 'ready' &&
    trimmedNewChildChapterTitle.length > 0 &&
    !isCreatingChildChapter

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
          setChildChapters([])
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
          setChildChapters([])
          setStory(loadedStory)
          setStatus('missing-chapter')
          return
        }

        const loadedChildChapters = await services.getNextChapters(chapterId)

        if (!isCurrent) {
          return
        }

        setChapter(loadedChapter)
        setChildChapters(
          loadedChildChapters.filter(
            (childChapter) => childChapter.storyId === storyId,
          ),
        )
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

  async function createChildChapter() {
    if (!canCreateChildChapter) {
      return undefined
    }

    setIsCreatingChildChapter(true)
    setErrorMessage(undefined)
    setSuccessMessage(undefined)

    try {
      const childChapter = await services.createChapter({
        content: '',
        parentChapterId: chapterId,
        storyId,
        title: trimmedNewChildChapterTitle,
      })

      setChildChapters((currentChildChapters) => [
        ...currentChildChapters,
        childChapter,
      ])
      setNewChildChapterTitle('New chapter')
      setSuccessMessage('Child chapter created.')

      return childChapter
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      return undefined
    } finally {
      setIsCreatingChildChapter(false)
    }
  }

  return {
    canCreateChildChapter,
    canSave,
    chapter,
    childChapters,
    content,
    createChildChapter,
    errorMessage,
    isCreatingChildChapter,
    isSaving,
    newChildChapterTitle,
    saveChapter,
    setContent,
    setNewChildChapterTitle,
    setTitle,
    status,
    story,
    successMessage,
    title,
  }
}
