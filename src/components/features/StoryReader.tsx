import { BookOpen, CornerUpLeft, Edit3, Home, PlusCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  type StoryReaderServices,
  useStoryReader,
} from '@/hooks/useStoryReader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import type { Chapter, Story } from '@/services/types'

interface Props {
  readonly chapterId?: string
  readonly onCreateChildChapter: (storyId: string, parentChapterId: string) => void
  readonly onEditChapter: (storyId: string, chapterId: string) => void
  readonly onOpenDashboard: () => void
  readonly onOpenStoryDetails: (storyId: string) => void
  readonly onSelectChapter: (chapterId: string) => void
  readonly services?: StoryReaderServices
  readonly storyId: string
}

export function StoryReader({
  chapterId,
  onCreateChildChapter,
  onEditChapter,
  onOpenDashboard,
  onOpenStoryDetails,
  onSelectChapter,
  services,
  storyId,
}: Props) {
  const {
    currentChapter,
    errorMessage,
    nextChapters,
    parentChapter,
    selectParentChapter,
    selectNextChapter,
    status,
    story,
  } = useStoryReader({ chapterId, onSelectChapter, services, storyId })
  const isReadingChapter = Boolean(story && currentChapter)

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      {isReadingChapter && story && currentChapter ? (
        <ReaderToolbar
          onEditChapter={() => onEditChapter(storyId, currentChapter.id)}
          onOpenDashboard={onOpenDashboard}
          onOpenStoryDetails={() => onOpenStoryDetails(storyId)}
          onSelectParentChapter={selectParentChapter}
          parentChapter={parentChapter}
        />
      ) : null}

      <section className="mx-auto w-full max-w-5xl px-0 py-0 sm:px-6 sm:py-6 lg:py-10">
        <ReaderContent
          currentChapter={currentChapter}
          errorMessage={errorMessage}
          nextChapters={nextChapters}
          onCreateChildChapter={(parentChapterId) =>
            onCreateChildChapter(storyId, parentChapterId)
          }
          onSelectNextChapter={selectNextChapter}
          status={status}
          story={story}
        />
      </section>
    </main>
  )
}

interface ReaderToolbarProps {
  readonly onEditChapter: () => void
  readonly onOpenDashboard: () => void
  readonly onOpenStoryDetails: () => void
  readonly onSelectParentChapter: () => void
  readonly parentChapter?: Chapter
}

function ReaderToolbar({
  onEditChapter,
  onOpenDashboard,
  onOpenStoryDetails,
  onSelectParentChapter,
  parentChapter,
}: ReaderToolbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur">
      <nav
        aria-label="Reader actions"
        className="mx-auto flex w-full max-w-6xl items-center gap-2 px-3 py-2 sm:px-5"
      >
        {parentChapter ? (
          <Button
            aria-label="Parent Chapter"
            className="px-3"
            onClick={onSelectParentChapter}
            size="sm"
            title="Parent Chapter"
          >
            <CornerUpLeft aria-hidden="true" size={16} />
          </Button>
        ) : null}

        <div className="flex-1" />

        <Button
          aria-label="Story Details"
          className="px-3"
          onClick={onOpenStoryDetails}
          size="sm"
          title="Story Details"
        >
          <BookOpen aria-hidden="true" size={16} />
        </Button>
        <Button
          aria-label="Edit Chapter"
          className="px-3"
          onClick={onEditChapter}
          size="sm"
          title="Edit Chapter"
        >
          <Edit3 aria-hidden="true" size={16} />
        </Button>
        <Button
          aria-label="Dashboard"
          className="px-3"
          onClick={onOpenDashboard}
          size="sm"
          title="Dashboard"
        >
          <Home aria-hidden="true" size={16} />
        </Button>
      </nav>
    </header>
  )
}

interface ReaderContentProps {
  readonly currentChapter?: Chapter
  readonly errorMessage?: string
  readonly nextChapters: Chapter[]
  readonly onCreateChildChapter: (parentChapterId: string) => void
  readonly onSelectNextChapter: (chapter: Chapter) => void
  readonly status: ReturnType<typeof useStoryReader>['status']
  readonly story?: Story
}

function ReaderContent({
  currentChapter,
  errorMessage,
  nextChapters,
  onCreateChildChapter,
  onSelectNextChapter,
  status,
  story,
}: ReaderContentProps) {
  let readerContent: ReactNode

  if (status === 'loading') {
    readerContent = (
      <Alert className="shadow-sm">Loading story...</Alert>
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
      <Alert role="alert" variant="error">
        {errorMessage}
      </Alert>
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
      <article
        aria-label="Chapter document"
        className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-[52rem] border-stone-200 bg-white px-4 py-6 shadow-sm sm:min-h-[calc(100vh-10rem)] sm:border sm:px-8 sm:py-8 lg:px-8"
      >
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            {story.title}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            {currentChapter.title}
          </h1>
        </header>

        <MarkdownContent
          className="space-y-5 py-8"
          content={currentChapter.content}
          emptyFallback="This chapter is blank."
        />

        <footer className="border-t border-stone-200 pt-5">
          <NextChapterControls
            nextChapters={nextChapters}
            onCreateChildChapter={() =>
              onCreateChildChapter(currentChapter.id)
            }
            onSelectChapter={onSelectNextChapter}
          />
        </footer>
      </article>
    )
  } else {
    readerContent = null
  }

  return readerContent
}

interface NextChapterControlsProps {
  readonly nextChapters: Chapter[]
  readonly onCreateChildChapter: () => void
  readonly onSelectChapter: (chapter: Chapter) => void
}

function NextChapterControls({
  nextChapters,
  onCreateChildChapter,
  onSelectChapter,
}: NextChapterControlsProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
        What happens next?
      </h2>
      {nextChapters.length === 0 ? (
        <p className="mt-3 inline-flex min-h-10 items-center rounded-md bg-stone-100 px-3 text-sm font-semibold text-stone-700">
          The End
        </p>
      ) : (
        <div className="mt-3 grid gap-2">
          {nextChapters.map((nextChapter) => (
            <Button
              className="justify-start px-4 text-left"
              key={nextChapter.id}
              onClick={() => onSelectChapter(nextChapter)}
            >
              {nextChapter.title}
            </Button>
          ))}
        </div>
      )}
      <Button
        className="mt-4"
        onClick={onCreateChildChapter}
        size="sm"
        variant="primary"
      >
        <PlusCircle aria-hidden="true" size={16} />
        Add Branch
      </Button>
    </div>
  )
}
