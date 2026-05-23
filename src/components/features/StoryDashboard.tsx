import { ArrowRight, ChevronRight, Plus, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  type StoryDashboardServices,
  useStoryDashboard,
} from '@/hooks/useStoryDashboard'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { TextInput } from '@/components/ui/TextInput'

const DASHBOARD_DISPLAY_FONT = '"NV Garamond", Georgia, serif'
const DASHBOARD_ITALIC_FONT =
  '"NV Garamond", "NV Palatium", Georgia, serif'

const STORY_ROW_ACCENT_CLASSES = [
  'bg-tt-moss',
  'bg-tt-gold',
  'bg-tt-oxblood',
] as const

function getStoryRowAccentClass(index: number) {
  return STORY_ROW_ACCENT_CLASSES[index % STORY_ROW_ACCENT_CLASSES.length]
}

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
      <section className="rounded-[2rem] border border-dashed border-tt-line bg-tt-paper/80 p-7 text-center shadow-[0_18px_50px_rgba(34,27,22,0.08)] sm:p-8">
        <h2
          className="text-4xl font-bold leading-tight text-tt-ink"
          style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
        >
          No stories yet
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-tt-muted">
          Start with an example or open a blank page for a branching tale of
          your own.
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
      <section aria-labelledby="saved-stories-heading" className="grid gap-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
          <span className="h-px bg-tt-line" />
          <h2
            className="text-base italic leading-none text-tt-muted"
            id="saved-stories-heading"
            style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
          >
            Saved stories
          </h2>
          <span className="h-px bg-tt-line" />
        </div>
        <div className="grid gap-4">
          {sortedStories.map((story, index) => (
            <button
              aria-label={`Open ${story.title}`}
              className="group relative grid min-h-28 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-[1.75rem] border border-tt-line/70 bg-tt-paper/85 px-6 py-5 text-left shadow-[0_14px_36px_rgba(34,27,22,0.08)] transition hover:-translate-y-0.5 hover:border-tt-gold hover:bg-tt-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-gold sm:px-8"
              key={story.id}
              onClick={() => onOpenStory(story.id)}
              type="button"
            >
              <span
                aria-hidden="true"
                className={`${getStoryRowAccentClass(index)} absolute left-0 top-6 h-16 w-1 rounded-r-full`}
              />
              <span className="min-w-0 pl-1">
                <span
                  className="block truncate text-2xl font-bold leading-tight text-tt-ink sm:text-3xl"
                  style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
                >
                  {story.title}
                </span>
                <span
                  className="mt-1 block truncate text-base italic leading-6 text-tt-muted"
                  style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
                >
                  {story.description || 'No description yet.'}
                </span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className="text-tt-muted/70 transition group-hover:translate-x-1 group-hover:text-tt-moss"
                size={24}
              />
            </button>
          ))}
        </div>
      </section>
    )
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf0_0%,#f3ecd9_38%,#f8efd9_100%)] text-tt-ink">
      <header>
        <div className="mx-auto flex min-h-28 w-full max-w-4xl items-center gap-4 px-5 sm:px-8 lg:px-10">
          <img
            alt=""
            aria-hidden="true"
            className="size-14 rounded-2xl shadow-[0_12px_28px_rgba(34,27,22,0.16)]"
            src="/logo192.png"
          />
          <p
            className="text-3xl font-bold text-tt-moss"
            style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
          >
            TreeTales
          </p>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 pb-14 pt-8 sm:px-8 lg:px-10">
        <header className="grid gap-7">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5">
            <p className="text-sm font-semibold uppercase leading-none text-tt-gold">
              Your Library
            </p>
            <span className="h-px bg-tt-line" />
          </div>
          <div className="max-w-2xl">
            <h1
              aria-label="Your stories"
              className="grid text-5xl font-bold leading-[0.95] text-tt-ink sm:text-7xl"
              style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
            >
              <span>Your</span>
              <span
                className="font-bold italic text-tt-moss"
                style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
              >
                stories
              </span>
            </h1>
            <p
              className="mt-4 max-w-xl text-lg italic leading-7 text-tt-muted sm:text-xl sm:leading-8"
              style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
            >
              Every branch, every choice, all your worlds right here.
            </p>
          </div>
        </header>

        {sortedStories.length > 0 ? (
          <button
            aria-expanded={isFormOpen}
            className="group relative grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-5 rounded-[1.75rem] border border-tt-moss-dark bg-tt-moss px-6 py-6 pr-14 text-left text-tt-paper shadow-[0_20px_50px_rgba(46,69,51,0.24)] transition hover:bg-tt-moss-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-gold sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-8 sm:pr-8"
            onClick={() => setIsFormOpen(true)}
            type="button"
          >
            <span className="grid size-14 place-items-center rounded-xl bg-tt-paper/15 text-tt-paper">
              <Plus aria-hidden="true" size={30} />
            </span>
            <span className="min-w-0">
              <span
                className="block text-2xl font-bold leading-tight sm:text-3xl"
                style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
              >
                Begin a new story
              </span>
              <span
                className="mt-1 block text-base italic leading-6 text-tt-paper/75 sm:text-lg"
                style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
              >
                Branch it, shape it, make it yours
              </span>
            </span>
            <ArrowRight
              aria-hidden="true"
              className="absolute right-6 text-tt-paper/70 transition group-hover:translate-x-1 group-hover:text-tt-paper sm:static"
              size={24}
            />
          </button>
        ) : null}

        {isFormOpen ? (
          <form
            aria-label="New story"
            className="grid gap-4 rounded-[1.5rem] border border-tt-line bg-tt-paper/75 p-5 shadow-[0_14px_36px_rgba(34,27,22,0.08)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-end sm:p-6"
            onSubmit={(event) => {
              event.preventDefault()
              void createStoryFromForm()
            }}
          >
            <Field label="Title">
              <TextInput
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Forest Gate"
                value={title}
              />
            </Field>
            <Field label="Description">
              <TextInput
                name="description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A short premise for the story"
                value={description}
              />
            </Field>
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
