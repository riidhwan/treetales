import { Save } from 'lucide-react'
import type { SyntheticEvent } from 'react'

import {
  ChapterWritingUnavailableLayout,
  ChapterWritingWorkflow,
} from '@/components/features/shared/ChapterWriting'
import { Alert } from '@/components/ui/Alert'
import { chapterWritingCopy, commonCopy } from '@/copy'
import { useChapterCreator } from '@/hooks/useChapterCreator'

import { ChapterCreationUnavailable } from './CreatorContent/ChapterCreationUnavailable'
import { getToolbarContext } from './CreatorContent/creatorToolbarContext'

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
        navigationWarningMessage={chapterWritingCopy.creation.navigationWarning}
        onContentChange={onContentChange}
        onGoBack={onGoBack}
        onOpenDashboard={onOpenDashboard}
        onSubmit={onCreate}
        onTitleBlur={onTitleBlur}
        onTitleChange={onTitleChange}
        primaryActionIcon={<Save aria-hidden="true" size={16} />}
        primaryActionLabel={commonCopy.actions.save}
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
        submittingActionLabel={commonCopy.actions.saving}
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
        actionsLabel={chapterWritingCopy.creation.actionsLabel}
        onOpenDashboard={onOpenDashboard}
        onOpenPrevious={onGoBack}
        previousLabel={
          isIntroChapter
            ? chapterWritingCopy.actions.storyReader
            : chapterWritingCopy.actions.parentChapter
        }
      >
        <Alert className="shadow-sm">
          {isIntroChapter
            ? commonCopy.messages.loadingStory
            : chapterWritingCopy.creation.loadingParentChapter}
        </Alert>
      </ChapterWritingUnavailableLayout>
    )
  }

  return (
    <ChapterWritingUnavailableLayout
      actionsLabel={chapterWritingCopy.creation.actionsLabel}
      onOpenDashboard={onOpenDashboard}
      onOpenPrevious={onGoBack}
      previousLabel={
        isIntroChapter
          ? chapterWritingCopy.actions.storyReader
          : chapterWritingCopy.actions.parentChapter
      }
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
