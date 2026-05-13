import { BookOpen, Edit3, Plus, Sparkles, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  type StoryDashboardServices,
  useStoryDashboard,
} from '@/hooks/useStoryDashboard'

interface Props {
  readonly onEditStory: (storyId: string) => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryDashboardServices
}

export function StoryDashboard({
  onEditStory,
  onReadStory,
  services,
}: Props) {
  const {
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
  } = useStoryDashboard({
    onEditStory,
    onReadStory,
    services,
  })

  let storiesContent: ReactNode

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
            onClick={() => void createExampleStoryFromTemplate()}
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
                onClick={() => void deleteStoryWithConfirmation(story)}
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
              event.preventDefault()
              void createStoryFromForm()
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
