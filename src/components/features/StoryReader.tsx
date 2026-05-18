import {
  BookOpen,
  CornerUpLeft,
  Edit3,
  Home,
  Minus,
  Plus,
  PlusCircle,
  RotateCcw,
  Type,
} from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'

import { READER_FONT_OPTIONS, type ReaderFontId } from '@/config'
import {
  type StoryReaderServices,
  useStoryReader,
} from '@/hooks/useStoryReader'
import { useReaderAppearance } from '@/hooks/useReaderAppearance'
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
    <main className="min-h-screen bg-stone-100 text-stone-950">
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
        <div className="relative">
          <Button
            aria-controls="reader-appearance-panel"
            aria-expanded={isAppearancePanelOpen}
            aria-label="Reader Appearance"
            className="px-3"
            onClick={() =>
              setIsAppearancePanelOpen(
                (currentPanelState) => !currentPanelState,
              )
            }
            size="sm"
            title="Reader Appearance"
          >
            <Type aria-hidden="true" size={16} />
          </Button>
          {isAppearancePanelOpen ? (
            <ReaderAppearancePanel
              canDecreaseFontSize={canDecreaseFontSize}
              canIncreaseFontSize={canIncreaseFontSize}
              onDecreaseFontSize={onDecreaseFontSize}
              onIncreaseFontSize={onIncreaseFontSize}
              onResetReaderAppearance={onResetReaderAppearance}
              onSelectReaderFont={onSelectReaderFont}
              readerAppearance={readerAppearance}
            />
          ) : null}
        </div>
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

interface ReaderAppearancePanelProps {
  readonly canDecreaseFontSize: boolean
  readonly canIncreaseFontSize: boolean
  readonly onDecreaseFontSize: () => void
  readonly onIncreaseFontSize: () => void
  readonly onResetReaderAppearance: () => void
  readonly onSelectReaderFont: (fontId: ReaderFontId) => void
  readonly readerAppearance: ReturnType<typeof useReaderAppearance>['readerAppearance']
}

function ReaderAppearancePanel({
  canDecreaseFontSize,
  canIncreaseFontSize,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onResetReaderAppearance,
  onSelectReaderFont,
  readerAppearance,
}: ReaderAppearancePanelProps) {
  return (
    <div
      className="fixed left-3 right-3 top-14 z-30 rounded-md border border-stone-200 bg-white p-3 text-stone-950 shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[22rem]"
      id="reader-appearance-panel"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Reader Appearance</h2>
        <Button
          aria-label="Reset Reader Appearance"
          className="min-h-8 px-2"
          onClick={onResetReaderAppearance}
          size="sm"
          title="Reset Reader Appearance"
        >
          <RotateCcw aria-hidden="true" size={14} />
        </Button>
      </div>

      <section className="mt-3" aria-labelledby="reader-font-options-label">
        <h3
          className="text-xs font-semibold uppercase text-stone-500"
          id="reader-font-options-label"
        >
          Font
        </h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {READER_FONT_OPTIONS.map((fontOption) => (
            <button
              aria-pressed={readerAppearance.fontId === fontOption.id}
              className="min-h-11 rounded-md border border-stone-200 px-3 text-left text-sm transition hover:bg-stone-50 aria-pressed:border-emerald-700 aria-pressed:bg-emerald-50 aria-pressed:text-emerald-900"
              key={fontOption.id}
              onClick={() => onSelectReaderFont(fontOption.id)}
              style={{
                fontFamily: `"${fontOption.cssFamily}", Georgia, serif`,
              }}
              type="button"
            >
              {fontOption.displayName}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4" aria-labelledby="reader-font-size-label">
        <div className="flex items-center justify-between gap-3">
          <h3
            className="text-xs font-semibold uppercase text-stone-500"
            id="reader-font-size-label"
          >
            Font Size
          </h3>
          <p className="min-w-12 text-right text-sm font-semibold text-stone-700">
            {readerAppearance.fontSizePt} pt
          </p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button
            aria-label="Decrease Font Size"
            className="flex-1"
            disabled={!canDecreaseFontSize}
            onClick={onDecreaseFontSize}
            size="sm"
          >
            <Minus aria-hidden="true" size={16} />
          </Button>
          <Button
            aria-label="Increase Font Size"
            className="flex-1"
            disabled={!canIncreaseFontSize}
            onClick={onIncreaseFontSize}
            size="sm"
          >
            <Plus aria-hidden="true" size={16} />
          </Button>
        </div>
      </section>
    </div>
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
