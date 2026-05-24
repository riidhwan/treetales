import { Save } from 'lucide-react'
import type { SyntheticEvent } from 'react'

import { ChapterCreationUnavailable } from '@/components/features/ChapterCreator/ChapterCreationUnavailable'
import { getToolbarContext } from '@/components/features/ChapterCreator/creatorToolbarContext'
import {
  ChapterWritingUnavailableLayout,
  ChapterWritingWorkflow,
} from '@/components/features/shared/ChapterWriting'
import { Alert } from '@/components/ui/Alert'
import { useChapterCreator } from '@/hooks/useChapterCreator'

interface Props {
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

export function CreatorContent({
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
}: Props) {
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
        previousLabel={isIntroChapter ? 'Story Reader' : 'Parent Chapter'}
      >
        <Alert className="shadow-sm">
          {isIntroChapter ? 'Loading story...' : 'Loading parent chapter...'}
        </Alert>
      </ChapterWritingUnavailableLayout>
    )
  }

  return (
    <ChapterWritingUnavailableLayout
      actionsLabel="Chapter creation actions"
      onOpenDashboard={onOpenDashboard}
      onOpenPrevious={onGoBack}
      previousLabel={isIntroChapter ? 'Story Reader' : 'Parent Chapter'}
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
