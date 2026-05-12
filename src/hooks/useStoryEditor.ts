import { useEffect, useState } from 'react'

import { getStoryById, updateStory } from '@/services/storyDb'
import type { Story, UpdateStoryInput } from '@/services/types'

export interface StoryEditorServices {
  readonly getStoryById: (storyId: string) => Promise<Story | undefined>
  readonly updateStory: (
    storyId: string,
    input: UpdateStoryInput,
  ) => Promise<Story | undefined>
}

export const DEFAULT_STORY_EDITOR_SERVICES: StoryEditorServices = {
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
  const [story, setStory] = useState<Story | undefined>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<EditorStatus>('loading')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [successMessage, setSuccessMessage] = useState<string | undefined>()

  const trimmedTitle = title.trim()
  const trimmedDescription = description.trim()
  const canSave = trimmedTitle.length > 0 && !isSaving

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

        setStory(loadedStory)
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

  return {
    canSave,
    description,
    errorMessage,
    isSaving,
    saveStory,
    setDescription,
    setTitle,
    status,
    story,
    successMessage,
    title,
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
