import { ArrowLeft, BookOpen, Edit3, Home } from 'lucide-react'

import {
  type StoryReaderServices,
  useStoryReader,
} from '@/hooks/useStoryReader'
import type { Chapter } from '@/services/types'

interface Props {
  readonly chapterId?: string
  readonly onEditStory: (storyId: string) => void
  readonly onOpenDashboard: () => void
  readonly onSelectChapter: (chapterId: string) => void
  readonly services?: StoryReaderServices
  readonly storyId: string
}

export function StoryReader({
  chapterId,
  onEditStory,
  onOpenDashboard,
  onSelectChapter,
  services,
  storyId,
}: Props) {
  const {
    currentChapter,
    errorMessage,
    nextChapters,
    previousChapter,
    selectNextChapter,
    selectPreviousChapter,
    status,
    story,
  } = useStoryReader({ chapterId, onSelectChapter, services, storyId })

  let readerContent: React.ReactNode

  if (status === 'loading') {
    readerContent = (
      <p className="rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-600 shadow-sm">
        Loading story...
      </p>
    )
  } else if (status === 'missing-story') {
    readerContent = (
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          This story may have been deleted or is unavailable in this browser.
        </p>
      </section>
    )
  } else if (errorMessage) {
    readerContent = (
      <p
        className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        role="alert"
      >
        {errorMessage}
      </p>
    )
  } else if (!currentChapter && story) {
    readerContent = (
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {story.title}
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          {status === 'missing-chapter'
            ? 'Chapter not found'
            : 'No chapters yet'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          {status === 'missing-chapter'
            ? 'This chapter is not part of the selected story.'
            : 'This story does not have any chapters to read yet.'}
        </p>
      </section>
    )
  } else if (story && currentChapter) {
    readerContent = (
      <article className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="border-b border-stone-200 pb-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {previousChapter ? (
              <button
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
                onClick={selectPreviousChapter}
                type="button"
              >
                <ArrowLeft aria-hidden="true" size={16} />
                Back
              </button>
            ) : null}
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            {story.title}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{currentChapter.title}</h1>
        </header>

        <div className="whitespace-pre-wrap py-8 text-base leading-8 text-stone-800">
          {currentChapter.content || 'This chapter is blank.'}
        </div>

        <footer className="border-t border-stone-200 pt-5">
          <NextChapterControls
            nextChapters={nextChapters}
            onSelectChapter={selectNextChapter}
          />
        </footer>
      </article>
    )
  } else {
    readerContent = null
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
        <nav
          aria-label="Reader actions"
          className="flex flex-wrap justify-between gap-3"
        >
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
            onClick={onOpenDashboard}
            type="button"
          >
            <Home aria-hidden="true" size={16} />
            Dashboard
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
            onClick={() => onEditStory(storyId)}
            type="button"
          >
            <Edit3 aria-hidden="true" size={16} />
            Edit
          </button>
        </nav>

        {readerContent}
      </section>
    </main>
  )
}

interface NextChapterControlsProps {
  readonly nextChapters: Chapter[]
  readonly onSelectChapter: (chapter: Chapter) => void
}

function NextChapterControls({
  nextChapters,
  onSelectChapter,
}: NextChapterControlsProps) {
  if (nextChapters.length === 0) {
    return (
      <p className="inline-flex min-h-10 items-center rounded-md bg-stone-100 px-3 text-sm font-semibold text-stone-700">
        The End
      </p>
    )
  }

  if (nextChapters.length === 1) {
    const [nextChapter] = nextChapters

    return (
      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
        onClick={() => onSelectChapter(nextChapter)}
        type="button"
      >
        <BookOpen aria-hidden="true" size={16} />
        Continue
      </button>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
        Choose your path
      </h2>
      <div className="mt-3 grid gap-2">
        {nextChapters.map((nextChapter) => (
          <button
            className="min-h-11 rounded-md border border-stone-300 px-4 text-left text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
            key={nextChapter.id}
            onClick={() => onSelectChapter(nextChapter)}
            type="button"
          >
            {nextChapter.title}
          </button>
        ))}
      </div>
    </div>
  )
}
