import { useEffect, useMemo, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import { getChaptersByStoryId } from '@/services/chapterDb'
import {
  createExampleStory,
  type ExampleStory,
} from '@/services/exampleStory'
import {
  createStory,
  deleteStory,
  getStories,
} from '@/services/storyDb'
import type { Chapter, CreateStoryInput, Story } from '@/services/types'

export interface StorySummary extends Story {
  readonly chapterCount: number
}

export interface StoryDashboardServices {
  readonly createExampleStory: () => Promise<ExampleStory>
  readonly createStory: (input: CreateStoryInput) => Promise<Story>
  readonly deleteStory: (id: string) => Promise<boolean>
  readonly getChaptersByStoryId: (storyId: string) => Promise<Chapter[]>
  readonly getStories: () => Promise<Story[]>
}

export const DEFAULT_STORY_DASHBOARD_SERVICES: StoryDashboardServices = {
  createExampleStory,
  createStory,
  deleteStory,
  getChaptersByStoryId,
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
  const [stories, setStories] = useState<StorySummary[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isCreatingExample, setIsCreatingExample] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingStoryId, setDeletingStoryId] = useState<string | undefined>()
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
        const storySummaries = await Promise.all(
          loadedStories.map(async (story) => {
            const chapters = await services.getChaptersByStoryId(story.id)

            return {
              ...story,
              chapterCount: chapters.length,
            }
          }),
        )

        if (isCurrent) {
          setStories(storySummaries)
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
        {
          ...story,
          chapterCount: 0,
        },
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
        {
          ...exampleStory.story,
          chapterCount: exampleStory.chapters.length,
        },
      ])
      onReadStory(exampleStory.story.id)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsCreatingExample(false)
    }
  }

  async function deleteStoryWithConfirmation(story: StorySummary) {
    if (!window.confirm(`Delete "${story.title}"? This cannot be undone.`)) {
      return
    }

    setDeletingStoryId(story.id)
    setErrorMessage(undefined)

    try {
      const wasDeleted = await services.deleteStory(story.id)

      if (wasDeleted) {
        setStories((currentStories) =>
          currentStories.filter((currentStory) => currentStory.id !== story.id),
        )
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setDeletingStoryId(undefined)
    }
  }

  return {
    canCreate,
    createExampleStoryFromTemplate,
    createStoryFromForm,
    deletingStoryId,
    description,
    deleteStoryWithConfirmation,
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
