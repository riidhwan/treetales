import { useEffect, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import { deleteStory, getStoryById } from '@/services/storyService'
import type { Story } from '@/services/types'

export interface StoryDetailServices {
  readonly deleteStory: (id: string) => Promise<boolean>
  readonly getStoryById: (id: string) => Promise<Story | undefined>
}

export const DEFAULT_STORY_DETAIL_SERVICES: StoryDetailServices = {
  deleteStory,
  getStoryById,
}

export type StoryDetailStatus =
  | 'loading'
  | 'ready'
  | 'missing-story'
  | 'error'

interface UseStoryDetailOptions {
  readonly onDeleted: () => void
  readonly services?: StoryDetailServices
  readonly storyId: string
}

export function useStoryDetail({
  onDeleted,
  services = DEFAULT_STORY_DETAIL_SERVICES,
  storyId,
}: UseStoryDetailOptions) {
  const [story, setStory] = useState<Story | undefined>()
  const [status, setStatus] = useState<StoryDetailStatus>('loading')
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  useEffect(() => {
    let isCurrent = true

    async function loadStory() {
      setStatus('loading')
      setErrorMessage(undefined)

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
        setStatus('ready')
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error))
          setStatus('error')
        }
      }
    }

    void loadStory()

    return () => {
      isCurrent = false
    }
  }, [services, storyId])

  async function deleteStory() {
    if (!story) {
      return
    }

    setIsDeleting(true)
    setErrorMessage(undefined)

    try {
      const wasDeleted = await services.deleteStory(story.id)

      if (wasDeleted) {
        onDeleted()
        return
      }

      setStory(undefined)
      setStatus('missing-story')
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    deleteStory,
    errorMessage,
    isDeleting,
    status,
    story,
  }
}
