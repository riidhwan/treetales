import { useEffect, useState } from 'react'
import type { ReactNode, SyntheticEvent } from 'react'
import { ArrowLeft, Home, Save } from 'lucide-react'

import {
  type ChapterCreatorServices,
  useChapterCreator,
} from '@/hooks/useChapterCreator'
import {
  type ChapterWritingMode,
  ChapterWritingSurface,
} from '@/components/features/ChapterWritingSurface'
import { ReaderAppearanceControl } from '@/components/domain/ReaderAppearanceControl'
import { useReaderAppearance } from '@/hooks/useReaderAppearance'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

interface Props {
  readonly onChapterCreated: (storyId: string, chapterId: string) => void
  readonly onGoBack: () => void
  readonly onOpenDashboard: () => void
  readonly parentChapterId?: string
  readonly services?: ChapterCreatorServices
  readonly storyId: string
}

export function ChapterCreator({
  onChapterCreated,
  onGoBack,
  onOpenDashboard,
  parentChapterId,
  services,
  storyId,
}: Props) {
  const {
    canCreate,
    content,
    createChapterFromForm,
    errorMessage,
    introChapter,
    isCreating,
    parentChapter,
    setContent,
    setTitle,
    status,
    story,
    title,
  } = useChapterCreator({ parentChapterId, services, storyId })
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
  const isIntroChapter = !parentChapterId
  const [editorMode, setEditorMode] = useState<ChapterWritingMode>('write')
  const [isAppearancePanelOpen, setIsAppearancePanelOpen] = useState(false)
  const [hasTouchedTitle, setHasTouchedTitle] = useState(false)
  const hasDraftChanges = status === 'ready' && (title !== '' || content !== '')
  const titleError =
    title.trim().length === 0 && (hasTouchedTitle || title.length > 0)
      ? 'Chapter title is required.'
      : undefined

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasDraftChanges) {
        return
      }

      event.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasDraftChanges])

  function handleCreate(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setHasTouchedTitle(true)
    createChapterFromForm()
      .then((chapter) => {
        if (chapter) {
          onChapterCreated(storyId, chapter.id)
        }
      })
      .catch(() => undefined)
  }

  function confirmNavigation(navigate: () => void) {
    if (
      !hasDraftChanges ||
      window.confirm('Discard this chapter draft?')
    ) {
      navigate()
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <CreatorContent
        canCreate={canCreate}
        content={content}
        editorMode={editorMode}
        errorMessage={errorMessage}
        introChapterTitle={introChapter?.title}
        isCreating={isCreating}
        isIntroChapter={isIntroChapter}
        onContentChange={setContent}
        onCreate={handleCreate}
        onGoBack={() => confirmNavigation(onGoBack)}
        onOpenDashboard={() => confirmNavigation(onOpenDashboard)}
        onSelectMode={setEditorMode}
        onTitleBlur={() => setHasTouchedTitle(true)}
        onTitleChange={setTitle}
        parentChapterTitle={parentChapter?.title}
        readerAppearanceControl={
          <ReaderAppearanceControl
            canDecreaseFontSize={canDecreaseFontSize}
            canIncreaseFontSize={canIncreaseFontSize}
            isPanelOpen={isAppearancePanelOpen}
            onDecreaseFontSize={decreaseFontSize}
            onIncreaseFontSize={increaseFontSize}
            onOpenChange={setIsAppearancePanelOpen}
            onResetReaderAppearance={resetReaderAppearance}
            onSelectReaderFont={setReaderFont}
            readerAppearance={readerAppearance}
          />
        }
        readerFontFamily={selectedFontFamily}
        readerFontSizePt={readerAppearance.fontSizePt}
        status={status}
        storyTitle={story?.title}
        title={title}
        titleError={titleError}
      />
    </main>
  )
}

interface CreatorContentProps {
  readonly canCreate: boolean
  readonly content: string
  readonly editorMode: ChapterWritingMode
  readonly errorMessage?: string
  readonly introChapterTitle?: string
  readonly isCreating: boolean
  readonly isIntroChapter: boolean
  readonly onContentChange: (content: string) => void
  readonly onCreate: (event: SyntheticEvent<HTMLFormElement>) => void
  readonly onGoBack: () => void
  readonly onOpenDashboard: () => void
  readonly onSelectMode: (mode: ChapterWritingMode) => void
  readonly onTitleBlur: () => void
  readonly onTitleChange: (title: string) => void
  readonly parentChapterTitle?: string
  readonly readerAppearanceControl: ReactNode
  readonly readerFontFamily: string
  readonly readerFontSizePt: number
  readonly status: ReturnType<typeof useChapterCreator>['status']
  readonly storyTitle?: string
  readonly title: string
  readonly titleError?: string
}

function CreatorContent({
  canCreate,
  content,
  editorMode,
  errorMessage,
  introChapterTitle,
  isCreating,
  isIntroChapter,
  onContentChange,
  onCreate,
  onGoBack,
  onOpenDashboard,
  onSelectMode,
  onTitleBlur,
  onTitleChange,
  parentChapterTitle,
  readerAppearanceControl,
  readerFontFamily,
  readerFontSizePt,
  status,
  storyTitle,
  title,
  titleError,
}: CreatorContentProps) {
  if (status === 'ready') {
    return (
      <>
        {errorMessage ? (
          <div className="mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6">
            <Alert role="alert" variant="error">
              {errorMessage}
            </Alert>
          </div>
        ) : null}

        <ChapterWritingSurface
          canSubmit={canCreate}
          content={content}
          contentPlaceholder="Write this chapter in markdown..."
          isSubmitting={isCreating}
          mode={editorMode}
          navigationActions={
            <Button
              aria-label="Back"
              className="px-3"
              onClick={onGoBack}
              size="sm"
            >
              <ArrowLeft aria-hidden="true" size={16} />
            </Button>
          }
          onContentChange={onContentChange}
          onModeChange={onSelectMode}
          onSubmit={onCreate}
          onTitleBlur={onTitleBlur}
          onTitleChange={onTitleChange}
          primaryActionIcon={<Save aria-hidden="true" size={16} />}
          primaryActionLabel="Save"
          readerFontFamily={readerFontFamily}
          readerFontSizePt={readerFontSizePt}
          secondaryActions={
            <>
              {readerAppearanceControl}
              <Button
                aria-label="Dashboard"
                className="px-3"
                onClick={onOpenDashboard}
                size="sm"
              >
                <Home aria-hidden="true" size={16} />
              </Button>
            </>
          }
          submittingActionLabel="Saving..."
          title={title}
          titleError={titleError}
          titlePlaceholder="Untitled chapter"
          toolbarContext={getToolbarContext({
            isIntroChapter,
            parentChapterTitle,
            storyTitle,
          })}
        />
      </>
    )
  }

  if (status === 'loading') {
    return (
      <UnavailableLayout
        onOpenDashboard={onOpenDashboard}
        onOpenPrevious={onGoBack}
        previousLabel={isIntroChapter ? 'Story Editor' : 'Parent Chapter'}
      >
        <Alert className="shadow-sm">
          {isIntroChapter
            ? 'Loading story...'
            : 'Loading parent chapter...'}
        </Alert>
      </UnavailableLayout>
    )
  }

  return (
    <UnavailableLayout
      onOpenDashboard={onOpenDashboard}
      onOpenPrevious={onGoBack}
      previousLabel={isIntroChapter ? 'Story Editor' : 'Parent Chapter'}
    >
      <ChapterCreationUnavailable
        errorMessage={errorMessage}
        introChapterTitle={introChapterTitle}
        status={status}
        storyTitle={storyTitle}
      />
    </UnavailableLayout>
  )
}

interface ChapterCreationUnavailableProps {
  readonly errorMessage?: string
  readonly introChapterTitle?: string
  readonly status: ReturnType<typeof useChapterCreator>['status']
  readonly storyTitle?: string
}

function ChapterCreationUnavailable({
  errorMessage,
  introChapterTitle,
  status,
  storyTitle,
}: ChapterCreationUnavailableProps) {
  if (status === 'missing-story') {
    return (
      <MissingState
        description="This story may have been deleted or is unavailable in this browser."
        title="Story not found"
      />
    )
  }

  if (status === 'missing-parent-chapter') {
    return (
      <MissingState
        description="This chapter is not part of the selected story."
        kicker={storyTitle}
        title="Parent chapter not found"
      />
    )
  }

  if (status === 'intro-chapter-exists') {
    return (
      <MissingState
        description="This story already has an intro chapter."
        kicker={storyTitle}
        title={introChapterTitle ?? 'Intro chapter exists'}
      />
    )
  }

  return errorMessage ? (
    <Alert role="alert" variant="error">
      {errorMessage}
    </Alert>
  ) : null
}

interface MissingStateProps {
  readonly description: string
  readonly kicker?: string
  readonly title: string
}

function MissingState({ description, kicker, title }: MissingStateProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      {kicker ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {kicker}
        </p>
      ) : null}
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        {description}
      </p>
    </section>
  )
}

interface UnavailableLayoutProps {
  readonly children: ReactNode
  readonly onOpenDashboard: () => void
  readonly onOpenPrevious: () => void
  readonly previousLabel: string
}

function UnavailableLayout({
  children,
  onOpenDashboard,
  onOpenPrevious,
  previousLabel,
}: UnavailableLayoutProps) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
      <nav
        aria-label="Chapter creation actions"
        className="flex flex-wrap justify-between gap-3"
      >
        <Button onClick={onOpenPrevious} size="sm">
          <ArrowLeft aria-hidden="true" size={16} />
          {previousLabel}
        </Button>
        <Button
          aria-label="Dashboard"
          className="px-3"
          onClick={onOpenDashboard}
          size="sm"
        >
          <Home aria-hidden="true" size={16} />
        </Button>
      </nav>

      {children}
    </section>
  )
}

interface ToolbarContextOptions {
  readonly isIntroChapter: boolean
  readonly parentChapterTitle?: string
  readonly storyTitle?: string
}

function getToolbarContext({
  isIntroChapter,
  parentChapterTitle,
  storyTitle,
}: ToolbarContextOptions) {
  const contextStoryTitle = storyTitle ?? 'Story'

  if (isIntroChapter) {
    return `${contextStoryTitle} - Intro Chapter`
  }

  return `${contextStoryTitle} - Child of ${
    parentChapterTitle ?? 'selected chapter'
  }`
}
