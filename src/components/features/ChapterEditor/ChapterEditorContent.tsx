import { Save } from 'lucide-react'
import type { SyntheticEvent } from 'react'

import {
  ChapterWritingUnavailableLayout,
  ChapterWritingWorkflow,
} from '@/components/features/shared/ChapterWriting'
import { useChapterEditor } from '@/hooks/useChapterEditor'

import { ChapterEditorUnavailableState } from '@/components/features/ChapterEditor/ChapterEditorUnavailableState'

interface Props {
  readonly canSave: boolean
  readonly chapter: ReturnType<typeof useChapterEditor>['chapter']
  readonly content: string
  readonly errorMessage?: string
  readonly hasUnsavedChanges: boolean
  readonly isSaving: boolean
  readonly onContentChange: (content: string) => void
  readonly onGoBack: () => void
  readonly onOpenDashboard: () => void
  readonly onSave: (event: SyntheticEvent<HTMLFormElement>) => void
  readonly onSaveShortcut: () => void
  readonly onTitleChange: (title: string) => void
  readonly parentChapter: ReturnType<typeof useChapterEditor>['parentChapter']
  readonly parentChapterUnavailable: boolean
  readonly status: ReturnType<typeof useChapterEditor>['status']
  readonly storyTitle?: string
  readonly title: string
}

export function ChapterEditorContent({
  canSave,
  chapter,
  content,
  errorMessage,
  hasUnsavedChanges,
  isSaving,
  onContentChange,
  onGoBack,
  onOpenDashboard,
  onSave,
  onSaveShortcut,
  onTitleChange,
  parentChapter,
  parentChapterUnavailable,
  status,
  storyTitle,
  title,
}: Props) {
  if (status === 'ready') {
    return (
      <ChapterWritingWorkflow
        canSubmit={canSave}
        content={content}
        errorMessage={errorMessage}
        hasNavigationWarning={hasUnsavedChanges}
        isSubmitting={isSaving}
        navigationWarningMessage="Discard unsaved chapter changes?"
        onContentChange={onContentChange}
        onGoBack={onGoBack}
        onOpenDashboard={onOpenDashboard}
        onSubmit={onSave}
        onSubmitShortcut={onSaveShortcut}
        onTitleChange={onTitleChange}
        primaryActionIcon={<Save aria-hidden="true" size={16} />}
        primaryActionLabel="Save"
        promptBuilder={{
          isDisabled: parentChapterUnavailable,
          parentChapter: parentChapter
            ? {
                content: parentChapter.content,
                title: parentChapter.title,
              }
            : undefined,
          promptBuilderDisabledReason: 'Parent Chapter unavailable',
          storyTitle,
          templateKind: chapter?.parentChapterId ? 'branch' : 'intro',
        }}
        submittingActionLabel="Saving..."
        title={title}
        titleError={
          title.trim().length === 0
            ? 'Chapter title is required.'
            : undefined
        }
        toolbarContext={storyTitle ?? 'Story'}
      />
    )
  }

  return (
    <ChapterWritingUnavailableLayout
      actionsLabel="Chapter editor actions"
      onOpenDashboard={onOpenDashboard}
      onOpenPrevious={onGoBack}
      previousLabel="Back"
    >
      <ChapterEditorUnavailableState
        errorMessage={errorMessage}
        status={status}
        storyTitle={storyTitle}
      />
    </ChapterWritingUnavailableLayout>
  )
}
