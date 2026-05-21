import { ChevronRight, Plus, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  type StoryDashboardServices,
  useStoryDashboard,
} from '@/hooks/useStoryDashboard'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'

const DASHBOARD_DISPLAY_FONT = '"NV Garamond", Georgia, serif'

interface Props {
  readonly onEditStory: (storyId: string) => void
  readonly onOpenStory: (storyId: string) => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryDashboardServices
}

export function StoryDashboard({
  onEditStory,
  onOpenStory,
  onReadStory,
  services,
}: Props) {
  const {
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
      <section className="rounded-3xl border border-dashed border-tt-line bg-tt-paper/70 p-7 text-center shadow-sm sm:p-8">
        <h2
          className="text-3xl font-bold leading-tight text-tt-ink"
          style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
        >
          No stories yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-tt-muted">
          Create a story with a title and description to start building a
          branching tale.
        </p>
        <div className="mx-auto mt-6 grid max-w-md gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,0.5fr)]">
          <Button
            className="min-h-12 rounded-xl"
            disabled={isCreatingExample}
            onClick={() => void createExampleStoryFromTemplate()}
            variant="primary"
          >
            <Sparkles aria-hidden="true" size={18} />
            Add Example Story
          </Button>
          <Button
            className="min-h-12 rounded-xl"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus aria-hidden="true" size={18} />
            New Story
          </Button>
        </div>
      </section>
    )
  } else {
    storiesContent = (
      <section aria-label="Saved stories" className="grid gap-3">
        {sortedStories.map((story) => (
          <button
            aria-label={`Open ${story.title}`}
            className="group grid h-24 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-tt-line bg-tt-paper/75 px-5 text-left shadow-sm transition hover:border-tt-gold hover:bg-tt-gold-soft/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-gold sm:px-6"
            key={story.id}
            onClick={() => onOpenStory(story.id)}
            type="button"
          >
            <span className="min-w-0">
              <span
                className="block truncate text-2xl font-bold leading-tight text-tt-ink"
                style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
              >
                {story.title}
              </span>
              <span className="mt-1 block truncate text-sm leading-6 text-tt-muted">
                {story.description || 'No description yet.'}
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              className="text-tt-muted/60 transition group-hover:text-tt-moss"
              size={20}
            />
          </button>
        ))}
      </section>
    )
  }

  return (
    <main className="min-h-screen bg-tt-parchment text-tt-ink">
      <header className="border-b border-tt-line/70 bg-tt-paper/35">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center gap-3 px-5 sm:px-8 lg:px-10">
          <img
            alt=""
            aria-hidden="true"
            className="size-9 rounded-lg"
            src="/logo192.png"
          />
          <p className="text-lg font-bold text-tt-moss">TreeTales</p>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 lg:px-10">
        <header className="border-b border-tt-line pb-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h1
                className="text-5xl font-bold leading-none sm:text-6xl"
                style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
              >
                Your stories
              </h1>
              <p className="mt-3 text-sm leading-6 text-tt-muted sm:text-base">
                Manage branching stories saved in this browser.
              </p>
            </div>
            {sortedStories.length > 0 ? (
              <Button
                className="min-h-12 w-full rounded-xl sm:w-auto"
                onClick={() => setIsFormOpen(true)}
                variant="primary"
              >
                <Plus aria-hidden="true" size={18} />
                New Story
              </Button>
            ) : null}
          </div>
        </header>

        {isFormOpen ? (
          <form
            aria-label="New story"
            className="grid gap-4 rounded-2xl border border-tt-line bg-tt-paper/65 p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-end sm:p-6"
            onSubmit={(event) => {
              event.preventDefault()
              void createStoryFromForm()
            }}
          >
            <label className="grid gap-2 text-sm font-medium text-tt-ink">
              Title
              <TextInput
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Forest Gate"
                value={title}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-tt-ink">
              Description
              <TextInput
                name="description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A short premise for the story"
                value={description}
              />
            </label>
            <Button
              className="min-h-12 w-full rounded-xl sm:w-auto"
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
