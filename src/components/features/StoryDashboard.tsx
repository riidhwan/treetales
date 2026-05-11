import { BookOpen, Edit3, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getChaptersByStoryId } from '@/services/chapterDb'
import { createExampleStory } from '@/services/exampleStory'
import {
  createStory,
  deleteStory,
  getStories,
} from '@/services/storyDb'
import type { CreateStoryInput, Story } from '@/services/types'

interface StorySummary extends Story {
  chapterCount: number
}

interface StoryDashboardServices {
  readonly createExampleStory: () => Promise<{
    readonly chapters: unknown[]
    readonly story: Story
  }>
  readonly createStory: (input: CreateStoryInput) => Promise<Story>
  readonly deleteStory: (id: string) => Promise<boolean>
  readonly getChaptersByStoryId: (storyId: string) => Promise<unknown[]>
  readonly getStories: () => Promise<Story[]>
}

const DEFAULT_SERVICES: StoryDashboardServices = {
  createExampleStory,
  createStory,
  deleteStory,
  getChaptersByStoryId,
  getStories,
}

interface Props {
  readonly onEditStory: (storyId: string) => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryDashboardServices
}

export function StoryDashboard({
  onEditStory,
  onReadStory,
  services = DEFAULT_SERVICES,
}: Props) {
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

  async function handleCreateStory(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

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

  async function handleCreateExampleStory() {
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

  async function handleDeleteStory(story: StorySummary) {
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

  let storiesContent: React.ReactNode

  if (isLoading) {
    storiesContent = (
      <p className="rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-600">
        Loading stories...
      </p>
    )
  } else if (sortedStories.length === 0) {
    storiesContent = (
      <section className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold">No stories yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
          Create a story with a title and description to start building a
          branching tale.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={isCreatingExample}
            onClick={() => void handleCreateExampleStory()}
            type="button"
          >
            <Sparkles aria-hidden="true" size={18} />
            Add Example Story
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
            onClick={() => setIsFormOpen(true)}
            type="button"
          >
            <Plus aria-hidden="true" size={18} />
            New Story
          </button>
        </div>
      </section>
    )
  } else {
    storiesContent = (
      <section aria-label="Saved stories" className="grid gap-4 md:grid-cols-2">
        {sortedStories.map((story) => (
          <article
            className="flex min-h-56 flex-col justify-between rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
            key={story.id}
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold">{story.title}</h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {story.chapterCount}{' '}
                  {story.chapterCount === 1 ? 'chapter' : 'chapters'}
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
                {story.description || 'No description yet.'}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
                onClick={() => onReadStory(story.id)}
                type="button"
              >
                <BookOpen aria-hidden="true" size={16} />
                Read
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
                onClick={() => onEditStory(story.id)}
                type="button"
              >
                <Edit3 aria-hidden="true" size={16} />
                Edit
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deletingStoryId === story.id}
                onClick={() => void handleDeleteStory(story)}
                type="button"
              >
                <Trash2 aria-hidden="true" size={16} />
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              TreeTales
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Story dashboard
            </h1>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <p className="max-w-xl text-sm leading-6 text-stone-600">
              Manage branching stories saved in this browser.
            </p>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
              onClick={() => setIsFormOpen(true)}
              type="button"
            >
              <Plus aria-hidden="true" size={18} />
              New Story
            </button>
          </div>
        </header>

        {isFormOpen ? (
          <form
            className="grid gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-end"
            onSubmit={(event) => {
              void handleCreateStory(event)
            }}
          >
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Title
              <input
                className="min-h-11 rounded-md border border-stone-300 px-3 text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Forest Gate"
                type="text"
                value={title}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Description
              <input
                className="min-h-11 rounded-md border border-stone-300 px-3 text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                name="description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A short premise for the story"
                type="text"
                value={description}
              />
            </label>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"
              disabled={!canCreate}
              type="submit"
            >
              <Plus aria-hidden="true" size={18} />
              Create Story
            </button>
          </form>
        ) : null}

        {errorMessage ? (
          <p
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        {storiesContent}
      </section>
    </main>
  )
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
