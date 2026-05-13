import { useEffect, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import {
  createChapter,
  getIntroChapterByStoryId,
} from '@/services/chapterDb'
import { getStoryById, updateStory } from '@/services/storyDb'
import type {
  Chapter,
  CreateChapterInput,
  Story,
  UpdateStoryInput,
} from '@/services/types'

export interface StoryEditorServices {
  readonly createChapter: (input: CreateChapterInput) => Promise<Chapter>
  readonly getIntroChapterByStoryId: (
    storyId: string,
  ) => Promise<Chapter | undefined>
  readonly getStoryById: (storyId: string) => Promise<Story | undefined>
  readonly updateStory: (
    storyId: string,
    input: UpdateStoryInput,
  ) => Promise<Story | undefined>
}

export const DEFAULT_STORY_EDITOR_SERVICES: StoryEditorServices = {
  createChapter,
  getIntroChapterByStoryId,
  getStoryById,
  updateStory,
}

export type EditorStatus = 'loading' | 'ready' | 'missing-story'

interface UseStoryEditorOptions {
  readonly services?: StoryEditorServices
  readonly storyId: string
}

export function useStoryEditor({
  services = DEFAULT_STORY_EDITOR_SERVICES,
  storyId,
}: UseStoryEditorOptions) {
  const [introChapter, setIntroChapter] = useState<Chapter | undefined>()
  const [story, setStory] = useState<Story | undefined>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [introChapterTitle, setIntroChapterTitle] = useState('Introduction')
  const [status, setStatus] = useState<EditorStatus>('loading')
  const [isCreatingIntroChapter, setIsCreatingIntroChapter] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [successMessage, setSuccessMessage] = useState<string | undefined>()

  const trimmedTitle = title.trim()
  const trimmedDescription = description.trim()
  const trimmedIntroChapterTitle = introChapterTitle.trim()
  const canSave = trimmedTitle.length > 0 && !isSaving
  const canCreateIntroChapter =
    !introChapter &&
    trimmedIntroChapterTitle.length > 0 &&
    !isCreatingIntroChapter

  useEffect(() => {
    let isCurrent = true

    async function loadStory() {
      setStatus('loading')
      setErrorMessage(undefined)
      setSuccessMessage(undefined)

      try {
        const loadedStory = await services.getStoryById(storyId)

        if (!isCurrent) {
          return
        }

        if (!loadedStory) {
          setStory(undefined)
          setStatus('missing-story')
          return
        }

        const loadedIntroChapter =
          await services.getIntroChapterByStoryId(storyId)

        if (!isCurrent) {
          return
        }

        setStory(loadedStory)
        setIntroChapter(loadedIntroChapter)
        setTitle(loadedStory.title)
        setDescription(loadedStory.description)
        setStatus('ready')
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error))
          setStatus('ready')
        }
      }
    }

    void loadStory()

    return () => {
      isCurrent = false
    }
  }, [services, storyId])

  async function saveStory() {
    if (!canSave) {
      return
    }

    setIsSaving(true)
    setErrorMessage(undefined)
    setSuccessMessage(undefined)

    try {
      const updatedStory = await services.updateStory(storyId, {
        title: trimmedTitle,
        description: trimmedDescription,
      })

      if (!updatedStory) {
        setStory(undefined)
        setStatus('missing-story')
        return
      }

      setStory(updatedStory)
      setTitle(updatedStory.title)
      setDescription(updatedStory.description)
      setSuccessMessage('Story saved.')
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function createIntroChapter() {
    if (!canCreateIntroChapter) {
      return undefined
    }

    setIsCreatingIntroChapter(true)
    setErrorMessage(undefined)
    setSuccessMessage(undefined)

    try {
      const chapter = await services.createChapter({
        content: '',
        parentChapterId: null,
        storyId,
        title: trimmedIntroChapterTitle,
      })

      setIntroChapter(chapter)
      setIntroChapterTitle('Introduction')
      setSuccessMessage('Intro chapter created.')

      return chapter
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      return undefined
    } finally {
      setIsCreatingIntroChapter(false)
    }
  }

  return {
    canSave,
    canCreateIntroChapter,
    createIntroChapter,
    description,
    errorMessage,
    introChapterTitle,
    isCreatingIntroChapter,
    isSaving,
    saveStory,
    setDescription,
    setIntroChapterTitle,
    setTitle,
    introChapter,
    status,
    story,
    successMessage,
    title,
  }
}
