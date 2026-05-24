import { useEffect, useMemo, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import {
  createOrReuseExampleStoryCopy,
  listBuiltInExampleStories,
  type BuiltInExampleStorySummary,
  type CreateOrReuseExampleStoryCopyResult,
} from '@/services/builtInExampleStories'
import {
  createStory,
  getStories,
} from '@/services/storyService'
import type { CreateStoryInput, Story } from '@/services/types'

export interface StoryDashboardServices {
  readonly createOrReuseExampleStoryCopy: (
    builtInExampleStoryId: string,
  ) => Promise<CreateOrReuseExampleStoryCopyResult>
  readonly createStory: (input: CreateStoryInput) => Promise<Story>
  readonly getStories: () => Promise<Story[]>
  readonly listBuiltInExampleStories: () => BuiltInExampleStorySummary[]
}

export const DEFAULT_STORY_DASHBOARD_SERVICES: StoryDashboardServices = {
  createOrReuseExampleStoryCopy,
  createStory,
  getStories,
  listBuiltInExampleStories,
}

interface UseStoryDashboardOptions {
  readonly onEditStory: (storyId: string) => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryDashboardServices
}

export function useStoryDashboard({
  onEditStory,
  onReadStory,
  services = DEFAULT_STORY_DASHBOARD_SERVICES,
}: UseStoryDashboardOptions) {
  const [stories, setStories] = useState<Story[]>([])
  const [starterStories, setStarterStories] = useState<
    BuiltInExampleStorySummary[]
  >([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [creatingStarterId, setCreatingStarterId] = useState<string>()
  const [unavailableStarterId, setUnavailableStarterId] = useState<string>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const trimmedTitle = title.trim()
  const trimmedDescription = description.trim()
  const canCreate = trimmedTitle.length > 0 && !isCreating
  const sortedStories = useMemo(
    () =>
      [...stories].sort((firstStory, secondStory) => {
        if (firstStory.updatedAt !== secondStory.updatedAt) {
          return secondStory.updatedAt - firstStory.updatedAt
        }

        return firstStory.title.localeCompare(secondStory.title)
      }),
    [stories],
  )

  useEffect(() => {
    let isCurrent = true

    async function loadStories() {
      setIsLoading(true)
      setErrorMessage(undefined)

      try {
        const loadedStarterStories = services.listBuiltInExampleStories()
        const loadedStories = await services.getStories()

        if (isCurrent) {
          setStarterStories(loadedStarterStories)
          setStories(loadedStories)
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error))
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadStories()

    return () => {
      isCurrent = false
    }
  }, [services])

  async function createStoryFromForm() {
    if (!canCreate) {
      return
    }

    setIsCreating(true)
    setErrorMessage(undefined)

    try {
      const story = await services.createStory({
        title: trimmedTitle,
        description: trimmedDescription,
      })

      setStories((currentStories) => [
        ...currentStories,
        story,
      ])
      setTitle('')
      setDescription('')
      setIsFormOpen(false)
      onEditStory(story.id)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  async function createOrReuseStarterStory(builtInExampleStoryId: string) {
    setCreatingStarterId(builtInExampleStoryId)
    setUnavailableStarterId(undefined)
    setErrorMessage(undefined)

    try {
      const result = await services.createOrReuseExampleStoryCopy(
        builtInExampleStoryId,
      )

      if (result.status === 'not-found') {
        setUnavailableStarterId(builtInExampleStoryId)
        return
      }

      setStories((currentStories) => [
        ...currentStories.filter((story) => story.id !== result.story.id),
        result.story,
      ])
      onReadStory(result.story.id)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setCreatingStarterId(undefined)
    }
  }

  return {
    canCreate,
    createOrReuseStarterStory,
    createStoryFromForm,
    creatingStarterId,
    description,
    errorMessage,
    isFormOpen,
    isLoading,
    setDescription,
    setIsFormOpen,
    setTitle,
    sortedStories,
    starterStories,
    title,
    unavailableStarterId,
  }
}
