import { ChapterWritingMissingState } from '@/components/features/shared/ChapterWriting'
import { Alert } from '@/components/ui/Alert'
import { chapterWritingCopy, commonCopy } from '@/copy'
import { useChapterEditor } from '@/hooks/useChapterEditor'

interface Props {
  readonly errorMessage?: string
  readonly status: ReturnType<typeof useChapterEditor>['status']
  readonly storyTitle?: string
}

export function ChapterEditorUnavailableState({
  errorMessage,
  status,
  storyTitle,
}: Props) {
  if (status === 'loading') {
    return (
      <Alert className="shadow-sm">
        {chapterWritingCopy.editor.loadingChapter}
      </Alert>
    )
  }

  if (status === 'missing-story') {
    return (
      <ChapterWritingMissingState
        description={commonCopy.messages.storyNotFound.body}
        title={commonCopy.messages.storyNotFound.title}
      />
    )
  }

  if (status === 'missing-chapter') {
    return (
      <ChapterWritingMissingState
        description={chapterWritingCopy.editor.missingChapter.body}
        kicker={storyTitle}
        title={chapterWritingCopy.editor.missingChapter.title}
      />
    )
  }

  return (
    <Alert role="alert" variant="error">
      {errorMessage}
    </Alert>
  )
}
