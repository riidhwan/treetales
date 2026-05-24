import type { SyntheticEvent } from 'react'

import {
  type ChapterEditorServices,
  useChapterEditor,
} from '@/hooks/useChapterEditor'
import { ChapterEditorContent } from '@/components/features/ChapterEditor/ChapterEditorContent'

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
    void saveChapter()
  }

  return (
    <main className="min-h-screen bg-tt-parchment text-tt-ink">
      <ChapterEditorContent
        canSave={canSave}
        chapter={chapter}
        content={content}
        errorMessage={errorMessage}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onContentChange={setContent}
        onGoBack={onGoBack}
        onOpenDashboard={onOpenDashboard}
        onSave={handleSave}
        onSaveShortcut={() => {
          void saveChapter()
        }}
        onTitleChange={setTitle}
        parentChapter={parentChapter}
        parentChapterUnavailable={parentChapterUnavailable}
        status={status}
        storyTitle={story?.title}
        title={title}
      />
    </main>
  )
}
