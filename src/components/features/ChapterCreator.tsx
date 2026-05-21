import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Save } from 'lucide-react'

import {
  type ChapterCreatorServices,
  useChapterCreator,
} from '@/hooks/useChapterCreator'
import {
  ChapterWritingMissingState,
  ChapterWritingUnavailableLayout,
  ChapterWritingWorkflow,
} from '@/components/features/chapterWriting'
import { Alert } from '@/components/ui/Alert'

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
  const isIntroChapter = !parentChapterId
  const [hasTouchedTitle, setHasTouchedTitle] = useState(false)
  const hasDraftChanges = status === 'ready' && (title !== '' || content !== '')
  const titleError =
    title.trim().length === 0 && (hasTouchedTitle || title.length > 0)
      ? 'Chapter title is required.'
      : undefined

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

  return (
    <main className="min-h-screen bg-tt-parchment text-tt-ink">
      <CreatorContent
        canCreate={canCreate}
        content={content}
        errorMessage={errorMessage}
        hasDraftChanges={hasDraftChanges}
        introChapterTitle={introChapter?.title}
        isCreating={isCreating}
        isIntroChapter={isIntroChapter}
        onContentChange={setContent}
        onCreate={handleCreate}
        onGoBack={onGoBack}
        onOpenDashboard={onOpenDashboard}
        onTitleBlur={() => setHasTouchedTitle(true)}
        onTitleChange={setTitle}
        parentChapter={parentChapter}
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
  readonly errorMessage?: string
  readonly hasDraftChanges: boolean
  readonly introChapterTitle?: string
  readonly isCreating: boolean
  readonly isIntroChapter: boolean
  readonly onContentChange: (content: string) => void
  readonly onCreate: (event: SyntheticEvent<HTMLFormElement>) => void
  readonly onGoBack: () => void
  readonly onOpenDashboard: () => void
  readonly onTitleBlur: () => void
  readonly onTitleChange: (title: string) => void
  readonly parentChapter?: ReturnType<typeof useChapterCreator>['parentChapter']
  readonly status: ReturnType<typeof useChapterCreator>['status']
  readonly storyTitle?: string
  readonly title: string
  readonly titleError?: string
}

function CreatorContent({
  canCreate,
  content,
  errorMessage,
  hasDraftChanges,
  introChapterTitle,
  isCreating,
  isIntroChapter,
  onContentChange,
  onCreate,
  onGoBack,
  onOpenDashboard,
  onTitleBlur,
  onTitleChange,
  parentChapter,
  status,
  storyTitle,
  title,
  titleError,
}: CreatorContentProps) {
  if (status === 'ready') {
    return (
      <ChapterWritingWorkflow
        canSubmit={canCreate}
        content={content}
        errorMessage={errorMessage}
        hasNavigationWarning={hasDraftChanges}
        isSubmitting={isCreating}
        navigationWarningMessage="Discard this chapter draft?"
        onContentChange={onContentChange}
        onGoBack={onGoBack}
        onOpenDashboard={onOpenDashboard}
        onSubmit={onCreate}
        onTitleBlur={onTitleBlur}
        onTitleChange={onTitleChange}
        primaryActionIcon={<Save aria-hidden="true" size={16} />}
        primaryActionLabel="Save"
        promptBuilder={{
          parentChapter: parentChapter
            ? {
                content: parentChapter.content,
                title: parentChapter.title,
              }
            : undefined,
          storyTitle,
          templateKind: isIntroChapter ? 'intro' : 'branch',
        }}
        submittingActionLabel="Saving..."
        title={title}
        titleError={titleError}
        toolbarContext={getToolbarContext({
          isIntroChapter,
          parentChapterTitle: parentChapter?.title,
          storyTitle,
        })}
      />
    )
  }

  if (status === 'loading') {
    return (
      <ChapterWritingUnavailableLayout
        actionsLabel="Chapter creation actions"
        onOpenDashboard={onOpenDashboard}
        onOpenPrevious={onGoBack}
        previousLabel={isIntroChapter ? 'Story Editor' : 'Parent Chapter'}
      >
        <Alert className="shadow-sm">
          {isIntroChapter
            ? 'Loading story...'
            : 'Loading parent chapter...'}
        </Alert>
      </ChapterWritingUnavailableLayout>
    )
  }

  return (
    <ChapterWritingUnavailableLayout
      actionsLabel="Chapter creation actions"
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
    </ChapterWritingUnavailableLayout>
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
      <ChapterWritingMissingState
        description="This story may have been deleted or is unavailable in this browser."
        title="Story not found"
      />
    )
  }

  if (status === 'missing-parent-chapter') {
    return (
      <ChapterWritingMissingState
        description="This chapter is not part of the selected story."
        kicker={storyTitle}
        title="Parent chapter not found"
      />
    )
  }

  if (status === 'intro-chapter-exists') {
    return (
      <ChapterWritingMissingState
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

  return `${contextStoryTitle} - Branch from ${
    parentChapterTitle ?? 'selected chapter'
  }`
}
