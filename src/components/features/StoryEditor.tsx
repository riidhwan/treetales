import { BookOpen, Edit3, Home, PlusCircle, Save } from 'lucide-react'

import {
  type StoryEditorServices,
  useStoryEditor,
} from '@/hooks/useStoryEditor'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'
import { TextInput } from '@/components/ui/TextInput'
import type { Chapter } from '@/services/types'

interface Props {
  readonly onCreateIntroChapter: (storyId: string) => void
  readonly onEditChapter: (storyId: string, chapterId: string) => void
  readonly onOpenDashboard: () => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryEditorServices
  readonly storyId: string
}

export function StoryEditor({
  onCreateIntroChapter,
  onEditChapter,
  onOpenDashboard,
  onReadStory,
  services,
  storyId,
}: Props) {
  const {
    canSave,
    description,
    errorMessage,
    isSaving,
    saveStory,
    setDescription,
    setTitle,
    introChapter,
    status,
    story,
    successMessage,
    title,
  } = useStoryEditor({ services, storyId })

  function handleSave(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    saveStory().catch(() => undefined)
  }

  let editorContent: React.ReactNode

  if (status === 'loading') {
    editorContent = (
      <Alert className="shadow-sm">Loading story...</Alert>
    )
  } else if (status === 'missing-story') {
    editorContent = (
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          This story may have been deleted or is unavailable in this browser.
        </p>
        <Button
          className="mt-5"
          onClick={onOpenDashboard}
          size="sm"
        >
          <Home aria-hidden="true" size={16} />
          Dashboard
        </Button>
      </section>
    )
  } else {
    editorContent = (
      <>
        {errorMessage ? (
          <Alert role="alert" variant="error">
            {errorMessage}
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert role="status" variant="success">
            {successMessage}
          </Alert>
        ) : null}

        <form
          className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          onSubmit={handleSave}
        >
          <div className="border-b border-stone-200 pb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Story editor
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {story?.title || 'Untitled story'}
            </h1>
          </div>

          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Title
              <TextInput
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Description
              <TextArea
                name="description"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              disabled={!canSave}
              type="submit"
              variant="primary"
            >
              <Save aria-hidden="true" size={18} />
              {isSaving ? 'Saving...' : 'Save Story'}
            </Button>
          </div>
        </form>

        <ChapterSection
          onCreateIntroChapter={() => onCreateIntroChapter(storyId)}
          onEditChapter={(chapterId) => onEditChapter(storyId, chapterId)}
          introChapter={introChapter}
        />
      </>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
        <nav
          aria-label="Editor actions"
          className="flex flex-wrap justify-between gap-3"
        >
          <Button onClick={onOpenDashboard} size="sm">
            <Home aria-hidden="true" size={16} />
            Dashboard
          </Button>
          <Button
            className="disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === 'missing-story'}
            onClick={() => onReadStory(storyId)}
            size="sm"
          >
            <BookOpen aria-hidden="true" size={16} />
            Read
          </Button>
        </nav>

        {editorContent}
      </section>
    </main>
  )
}

interface ChapterSectionProps {
  readonly onCreateIntroChapter: () => void
  readonly onEditChapter: (chapterId: string) => void
  readonly introChapter?: Chapter
}

function ChapterSection({
  onCreateIntroChapter,
  onEditChapter,
  introChapter,
}: ChapterSectionProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold">Intro Chapter</h2>
          <p className="mt-1 text-sm text-stone-600">
            The story starts here. Add branches from chapter pages.
          </p>
        </div>
      </div>

      {introChapter ? (
        <IntroChapterCard
          introChapter={introChapter}
          onEditChapter={onEditChapter}
        />
      ) : (
        <IntroChapterEmptyState onCreateIntroChapter={onCreateIntroChapter} />
      )}
    </section>
  )
}

interface IntroChapterEmptyStateProps {
  readonly onCreateIntroChapter: () => void
}

function IntroChapterEmptyState({
  onCreateIntroChapter,
}: IntroChapterEmptyStateProps) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5">
      <h3 className="text-base font-semibold">Start with an intro chapter</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Every story begins with one top-level chapter. Later chapters are added
        from the chapter they follow.
      </p>
      <Button
        className="mt-5"
        onClick={onCreateIntroChapter}
        variant="primary"
      >
        <PlusCircle aria-hidden="true" size={18} />
        Add Intro Chapter
      </Button>
    </div>
  )
}

interface IntroChapterCardProps {
  readonly introChapter: Chapter
  readonly onEditChapter: (chapterId: string) => void
}

function IntroChapterCard({
  introChapter,
  onEditChapter,
}: IntroChapterCardProps) {
  return (
    <article className="mt-5 rounded-md border border-stone-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">{introChapter.title}</h3>
          <p className="mt-1 text-sm text-stone-600">Intro chapter</p>
        </div>
        <Button onClick={() => onEditChapter(introChapter.id)} size="sm">
          <Edit3 aria-hidden="true" size={16} />
          Edit
        </Button>
      </div>
    </article>
  )
}
