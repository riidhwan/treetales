import {
  BookOpen,
  ChevronRight,
  CornerUpLeft,
  Edit3,
  Home,
  PlusCircle,
} from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'

import type { ReaderFontId } from '@/config'
import { ReaderAppearanceControl } from '@/components/domain/ReaderAppearanceControl'
import {
  type StoryReaderServices,
  useStoryReader,
} from '@/hooks/useStoryReader'
import { useReaderAppearance } from '@/hooks/useReaderAppearance'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { Toolbar } from '@/components/ui/Toolbar'
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
    canDecreaseFontSize,
    canIncreaseFontSize,
    decreaseFontSize,
    increaseFontSize,
    readerAppearance,
    resetReaderAppearance,
    selectedFontFamily,
    setReaderFont,
  } = useReaderAppearance()
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
    <main className="min-h-screen bg-tt-parchment text-tt-ink">
      {isReadingChapter && story && currentChapter ? (
        <ReaderToolbar
          onEditChapter={() => onEditChapter(storyId, currentChapter.id)}
          onOpenDashboard={onOpenDashboard}
          onOpenStoryDetails={() => onOpenStoryDetails(storyId)}
          onSelectParentChapter={selectParentChapter}
          parentChapter={parentChapter}
          readerAppearance={readerAppearance}
          onDecreaseFontSize={decreaseFontSize}
          onIncreaseFontSize={increaseFontSize}
          onResetReaderAppearance={resetReaderAppearance}
          onSelectReaderFont={setReaderFont}
          canDecreaseFontSize={canDecreaseFontSize}
          canIncreaseFontSize={canIncreaseFontSize}
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
          readerFontFamily={selectedFontFamily}
          readerFontSizePt={readerAppearance.fontSizePt}
          status={status}
          story={story}
        />
      </section>
    </main>
  )
}

interface ReaderToolbarProps {
  readonly canDecreaseFontSize: boolean
  readonly canIncreaseFontSize: boolean
  readonly onDecreaseFontSize: () => void
  readonly onEditChapter: () => void
  readonly onIncreaseFontSize: () => void
  readonly onOpenDashboard: () => void
  readonly onOpenStoryDetails: () => void
  readonly onResetReaderAppearance: () => void
  readonly onSelectParentChapter: () => void
  readonly onSelectReaderFont: (fontId: ReaderFontId) => void
  readonly parentChapter?: Chapter
  readonly readerAppearance: ReturnType<typeof useReaderAppearance>['readerAppearance']
}

function ReaderToolbar({
  canDecreaseFontSize,
  canIncreaseFontSize,
  onDecreaseFontSize,
  onEditChapter,
  onIncreaseFontSize,
  onOpenDashboard,
  onOpenStoryDetails,
  onResetReaderAppearance,
  onSelectParentChapter,
  onSelectReaderFont,
  parentChapter,
  readerAppearance,
}: ReaderToolbarProps) {
  const [isAppearancePanelOpen, setIsAppearancePanelOpen] = useState(false)

  return (
    <Toolbar
      label="Reader actions"
      leading={
        parentChapter ? (
          <IconButton
            label="Parent Chapter"
            onClick={onSelectParentChapter}
            size="sm"
          >
            <CornerUpLeft aria-hidden="true" size={16} />
          </IconButton>
        ) : null
      }
      trailing={
        <>
          <IconButton
            label="Story Details"
            onClick={onOpenStoryDetails}
            size="sm"
          >
            <BookOpen aria-hidden="true" size={16} />
          </IconButton>
          <ReaderAppearanceControl
            canDecreaseFontSize={canDecreaseFontSize}
            canIncreaseFontSize={canIncreaseFontSize}
            isPanelOpen={isAppearancePanelOpen}
            onDecreaseFontSize={onDecreaseFontSize}
            onIncreaseFontSize={onIncreaseFontSize}
            onOpenChange={setIsAppearancePanelOpen}
            onResetReaderAppearance={onResetReaderAppearance}
            onSelectReaderFont={onSelectReaderFont}
            readerAppearance={readerAppearance}
          />
          <IconButton label="Edit Chapter" onClick={onEditChapter} size="sm">
            <Edit3 aria-hidden="true" size={16} />
          </IconButton>
          <IconButton label="Dashboard" onClick={onOpenDashboard} size="sm">
            <Home aria-hidden="true" size={16} />
          </IconButton>
        </>
      }
    />
  )
}

interface ReaderContentProps {
  readonly currentChapter?: Chapter
  readonly errorMessage?: string
  readonly nextChapters: Chapter[]
  readonly onCreateChildChapter: (parentChapterId: string) => void
  readonly onSelectNextChapter: (chapter: Chapter) => void
  readonly readerFontFamily: string
  readonly readerFontSizePt: number
  readonly status: ReturnType<typeof useStoryReader>['status']
  readonly story?: Story
}

function ReaderContent({
  currentChapter,
  errorMessage,
  nextChapters,
  onCreateChildChapter,
  onSelectNextChapter,
  readerFontFamily,
  readerFontSizePt,
  status,
  story,
}: ReaderContentProps) {
  let readerContent: ReactNode
  const readerDocumentStyle: CSSProperties = {
    fontFamily: `"${readerFontFamily}", Georgia, serif`,
    fontSize: `${readerFontSizePt}pt`,
  }

  if (status === 'loading') {
    readerContent = (
      <Alert className="shadow-sm">Loading story...</Alert>
    )
  } else if (status === 'missing-story') {
    readerContent = (
      <section className="rounded-lg border border-tt-line bg-tt-paper p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <p className="mt-3 text-sm leading-6 text-tt-muted">
          This story may have been deleted or is unavailable in this browser.
        </p>
      </section>
    )
  } else if (status === 'error') {
    readerContent = (
      <Alert role="alert" variant="error">
        {errorMessage}
      </Alert>
    )
  } else if (!currentChapter && story) {
    readerContent = (
      <section className="rounded-lg border border-tt-line bg-tt-paper p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
          {story.title}
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          {status === 'missing-chapter'
            ? 'Chapter not found'
            : 'No chapters yet'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-tt-muted">
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
        className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-[52rem] border-tt-line bg-tt-paper px-4 py-6 shadow-sm sm:min-h-[calc(100vh-10rem)] sm:border sm:px-8 sm:py-8 lg:px-8"
      >
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
            {story.title}
          </p>
          <div style={readerDocumentStyle}>
            <h1 className="mt-2 text-[1.875em] font-bold leading-tight sm:text-[2.25em]">
              {currentChapter.title}
            </h1>
          </div>
        </header>

        <MarkdownContent
          className="space-y-5 py-8"
          content={currentChapter.content}
          emptyFallback="This chapter is blank."
          style={readerDocumentStyle}
        />

        <footer className="border-t border-tt-line pt-5">
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
      <h2 className="text-sm font-semibold uppercase tracking-wide text-tt-muted">
        What happens next?
      </h2>
      {nextChapters.length === 0 ? (
        <p className="mt-3 inline-flex min-h-10 items-center rounded-md bg-tt-paper-deep px-3 text-sm font-semibold text-tt-muted">
          The End
        </p>
      ) : (
        <div className="mt-3 grid gap-2">
          {nextChapters.map((nextChapter) => (
            <button
              className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-md border border-tt-line bg-tt-paper-deep/35 px-4 py-3 text-left text-sm font-semibold text-tt-ink transition hover:border-tt-gold hover:bg-tt-gold-soft/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-gold"
              key={nextChapter.id}
              onClick={() => onSelectChapter(nextChapter)}
              type="button"
            >
              <span>{nextChapter.title}</span>
              <ChevronRight
                aria-hidden="true"
                className="shrink-0 text-tt-muted transition group-hover:text-tt-moss"
                size={18}
              />
            </button>
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
