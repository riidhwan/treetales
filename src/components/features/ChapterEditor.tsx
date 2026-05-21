import type { ReactNode, SyntheticEvent } from 'react'
import { Save } from 'lucide-react'

import {
  type ChapterEditorServices,
  useChapterEditor,
} from '@/hooks/useChapterEditor'
import {
  ChapterWritingMissingState,
  ChapterWritingUnavailableLayout,
  ChapterWritingWorkflow,
} from '@/components/features/chapterWriting'
import { Alert } from '@/components/ui/Alert'

interface Props {
  readonly chapterId: string
  readonly onGoBack: () => void
  readonly onOpenDashboard: () => void
  readonly services?: ChapterEditorServices
  readonly storyId: string
}

export function ChapterEditor({
  chapterId,
  onGoBack,
  onOpenDashboard,
  services,
  storyId,
}: Props) {
  const {
    canSave,
    chapter,
    content,
    errorMessage,
    hasUnsavedChanges,
    isSaving,
    parentChapter,
    parentChapterUnavailable,
    saveChapter,
    setContent,
    setTitle,
    status,
    story,
    title,
  } = useChapterEditor({ chapterId, services, storyId })
  function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    saveChapter().catch(() => undefined)
  }

  let editorContent: ReactNode

  if (status === 'loading') {
    editorContent = (
      <Alert className="shadow-sm">Loading chapter...</Alert>
    )
  } else if (status === 'missing-story') {
    editorContent = (
      <ChapterWritingMissingState
        description="This story may have been deleted or is unavailable in this browser."
        title="Story not found"
      />
    )
  } else if (status === 'missing-chapter') {
    editorContent = (
      <ChapterWritingMissingState
        description="This chapter is not part of the selected story."
        kicker={story?.title}
        title="Chapter not found"
      />
    )
  } else if (status === 'error') {
    editorContent = (
      <Alert role="alert" variant="error">
        {errorMessage}
      </Alert>
    )
  } else {
    editorContent = (
      <ChapterWritingWorkflow
        canSubmit={canSave}
        content={content}
        errorMessage={errorMessage}
        hasNavigationWarning={hasUnsavedChanges}
        isSubmitting={isSaving}
        navigationWarningMessage="Discard unsaved chapter changes?"
        onContentChange={setContent}
        onGoBack={onGoBack}
        onOpenDashboard={onOpenDashboard}
        onSubmit={handleSave}
        onSubmitShortcut={() => {
          saveChapter().catch(() => undefined)
        }}
        onTitleChange={setTitle}
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
          storyTitle: story?.title,
          templateKind: chapter?.parentChapterId ? 'branch' : 'intro',
        }}
        submittingActionLabel="Saving..."
        title={title}
        titleError={
          title.trim().length === 0
            ? 'Chapter title is required.'
            : undefined
        }
        toolbarContext={story?.title ?? 'Story'}
      />
    )
  }

  return (
    <main className="min-h-screen bg-tt-parchment text-tt-ink">
      {status === 'ready' ? (
        editorContent
      ) : (
        <ChapterWritingUnavailableLayout
          actionsLabel="Chapter editor actions"
          onOpenDashboard={onOpenDashboard}
          onOpenPrevious={onGoBack}
          previousLabel="Back"
        >
          {editorContent}
        </ChapterWritingUnavailableLayout>
      )}
    </main>
  )
}
