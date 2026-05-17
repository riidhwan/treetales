import { useEffect, useState } from 'react'
import type { ReactNode, SyntheticEvent } from 'react'
import { ArrowLeft, BookOpen, Home, PlusCircle } from 'lucide-react'

import {
  type ChapterCreatorServices,
  useChapterCreator,
} from '@/hooks/useChapterCreator'
import {
  type ChapterWritingMode,
  ChapterWritingSurface,
} from '@/components/features/ChapterWritingSurface'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

interface Props {
  readonly onChapterCreated: (storyId: string, chapterId: string) => void
  readonly onGoBack: () => void
  readonly onOpenDashboard: () => void
  readonly onOpenParentChapter?: (storyId: string, chapterId: string) => void
  readonly onOpenStoryEditor: (storyId: string) => void
  readonly parentChapterId?: string
  readonly services?: ChapterCreatorServices
  readonly storyId: string
}

export function ChapterCreator({
  onChapterCreated,
  onGoBack,
  onOpenDashboard,
  onOpenParentChapter,
  onOpenStoryEditor,
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
  const isIntroChapter = !parentChapterId
  const [editorMode, setEditorMode] = useState<ChapterWritingMode>('write')
  const [hasTouchedTitle, setHasTouchedTitle] = useState(false)
  const hasDraftChanges = status === 'ready' && (title !== '' || content !== '')
  const titleError =
    title.trim().length === 0 && (hasTouchedTitle || title.length > 0)
      ? 'Chapter title is required.'
      : undefined
  const draftStatus = getDraftStatus({
    errorMessage,
    hasDraftChanges,
    isCreating,
  })

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
        draftStatus={draftStatus}
        editorMode={editorMode}
        errorMessage={errorMessage}
        introChapterTitle={introChapter?.title}
        isCreating={isCreating}
        isIntroChapter={isIntroChapter}
        onContentChange={setContent}
        onCreate={handleCreate}
        onGoBack={() => confirmNavigation(onGoBack)}
        onOpenDashboard={() => confirmNavigation(onOpenDashboard)}
        onOpenParentChapter={
          parentChapterId && onOpenParentChapter
            ? () =>
                confirmNavigation(() =>
                  onOpenParentChapter(storyId, parentChapterId),
                )
            : undefined
        }
        onOpenStoryEditor={() =>
          confirmNavigation(() => onOpenStoryEditor(storyId))
        }
        onSelectMode={setEditorMode}
        onTitleBlur={() => setHasTouchedTitle(true)}
        onTitleChange={setTitle}
        parentChapterTitle={parentChapter?.title}
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
  readonly draftStatus: string
  readonly editorMode: ChapterWritingMode
  readonly errorMessage?: string
  readonly introChapterTitle?: string
  readonly isCreating: boolean
  readonly isIntroChapter: boolean
  readonly onContentChange: (content: string) => void
  readonly onCreate: (event: SyntheticEvent<HTMLFormElement>) => void
  readonly onGoBack: () => void
  readonly onOpenDashboard: () => void
  readonly onOpenParentChapter?: () => void
  readonly onOpenStoryEditor: () => void
  readonly onSelectMode: (mode: ChapterWritingMode) => void
  readonly onTitleBlur: () => void
  readonly onTitleChange: (title: string) => void
  readonly parentChapterTitle?: string
  readonly status: ReturnType<typeof useChapterCreator>['status']
  readonly storyTitle?: string
  readonly title: string
  readonly titleError?: string
}

function CreatorContent({
  canCreate,
  content,
  draftStatus,
  editorMode,
  errorMessage,
  introChapterTitle,
  isCreating,
  isIntroChapter,
  onContentChange,
  onCreate,
  onGoBack,
  onOpenDashboard,
  onOpenParentChapter,
  onOpenStoryEditor,
  onSelectMode,
  onTitleBlur,
  onTitleChange,
  parentChapterTitle,
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
            <Button onClick={onGoBack} size="sm">
              <ArrowLeft aria-hidden="true" size={16} />
              Back
            </Button>
          }
          onContentChange={onContentChange}
          onModeChange={onSelectMode}
          onSubmit={onCreate}
          onTitleBlur={onTitleBlur}
          onTitleChange={onTitleChange}
          primaryActionIcon={<PlusCircle aria-hidden="true" size={16} />}
          primaryActionLabel="Create Chapter"
          secondaryActions={
            <>
              {onOpenParentChapter ? (
                <Button onClick={onOpenParentChapter} size="sm">
                  <ArrowLeft aria-hidden="true" size={16} />
                  Parent Chapter
                </Button>
              ) : null}

              <Button onClick={onOpenStoryEditor} size="sm">
                <BookOpen aria-hidden="true" size={16} />
                Story Editor
              </Button>

              <Button onClick={onOpenDashboard} size="sm">
                <Home aria-hidden="true" size={16} />
                Dashboard
              </Button>
            </>
          }
          statusText={draftStatus}
          submittingActionLabel="Creating..."
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
        <Button onClick={onOpenDashboard} size="sm">
          <Home aria-hidden="true" size={16} />
          Dashboard
        </Button>
      </nav>

      {children}
    </section>
  )
}

interface DraftStatusOptions {
  readonly errorMessage?: string
  readonly hasDraftChanges: boolean
  readonly isCreating: boolean
}

function getDraftStatus({
  errorMessage,
  hasDraftChanges,
  isCreating,
}: DraftStatusOptions) {
  if (isCreating) {
    return 'Creating...'
  }

  if (errorMessage) {
    return 'Could not create'
  }

  if (hasDraftChanges) {
    return 'Draft not created'
  }

  return 'Draft empty'
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
