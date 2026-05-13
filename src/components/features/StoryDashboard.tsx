import { BookOpen, Edit3, Plus, Sparkles, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  type StoryDashboardServices,
  useStoryDashboard,
} from '@/hooks/useStoryDashboard'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'

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
    storiesContent = <Alert>Loading stories...</Alert>
  } else if (sortedStories.length === 0) {
    storiesContent = (
      <section className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold">No stories yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
          Create a story with a title and description to start building a
          branching tale.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button
            disabled={isCreatingExample}
            onClick={() => void createExampleStoryFromTemplate()}
            variant="primary"
          >
            <Sparkles aria-hidden="true" size={18} />
            Add Example Story
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus aria-hidden="true" size={18} />
            New Story
          </Button>
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
              <Button onClick={() => onReadStory(story.id)} size="sm">
                <BookOpen aria-hidden="true" size={16} />
                Read
              </Button>
              <Button onClick={() => onEditStory(story.id)} size="sm">
                <Edit3 aria-hidden="true" size={16} />
                Edit
              </Button>
              <Button
                disabled={deletingStoryId === story.id}
                onClick={() => void deleteStoryWithConfirmation(story)}
                size="sm"
                variant="danger"
              >
                <Trash2 aria-hidden="true" size={16} />
                Delete
              </Button>
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
            <Button onClick={() => setIsFormOpen(true)} variant="primary">
              <Plus aria-hidden="true" size={18} />
              New Story
            </Button>
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
              <TextInput
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Forest Gate"
                value={title}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Description
              <TextInput
                name="description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A short premise for the story"
                value={description}
              />
            </label>
            <Button
              disabled={!canCreate}
              type="submit"
              variant="primary"
            >
              <Plus aria-hidden="true" size={18} />
              Create Story
            </Button>
          </form>
        ) : null}

        {errorMessage ? (
          <Alert role="alert" variant="error">
            {errorMessage}
          </Alert>
        ) : null}

        {storiesContent}
      </section>
    </main>
  )
}
