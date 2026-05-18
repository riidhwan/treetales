import { useEffect, useMemo, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import {
  createExampleStory,
  type ExampleStory,
} from '@/services/exampleStory'
import {
  createStory,
  getStories,
} from '@/services/storyService'
import type { CreateStoryInput, Story } from '@/services/types'

export interface StoryDashboardServices {
  readonly createExampleStory: () => Promise<ExampleStory>
  readonly createStory: (input: CreateStoryInput) => Promise<Story>
  readonly getStories: () => Promise<Story[]>
}

export const DEFAULT_STORY_DASHBOARD_SERVICES: StoryDashboardServices = {
  createExampleStory,
  createStory,
  getStories,
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
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isCreatingExample, setIsCreatingExample] = useState(false)
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
        const loadedStories = await services.getStories()

        if (isCurrent) {
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

  async function createExampleStoryFromTemplate() {
    setIsCreatingExample(true)
    setErrorMessage(undefined)

    try {
      const exampleStory = await services.createExampleStory()

      setStories((currentStories) => [
        ...currentStories.filter((story) => story.id !== exampleStory.story.id),
        exampleStory.story,
      ])
      onReadStory(exampleStory.story.id)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsCreatingExample(false)
    }
  }

  return {
    canCreate,
    createExampleStoryFromTemplate,
    createStoryFromForm,
    description,
    errorMessage,
    isCreatingExample,
    isFormOpen,
    isLoading,
    setDescription,
    setIsFormOpen,
    setTitle,
    sortedStories,
    title,
  }
}
