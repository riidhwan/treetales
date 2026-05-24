import { ChapterWritingMissingState } from '@/components/features/shared/ChapterWriting'
import { Alert } from '@/components/ui/Alert'
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
    return <Alert className="shadow-sm">Loading chapter...</Alert>
  }

  if (status === 'missing-story') {
    return (
      <ChapterWritingMissingState
        description="This story may have been deleted or is unavailable in this browser."
        title="Story not found"
      />
    )
  }

  if (status === 'missing-chapter') {
    return (
      <ChapterWritingMissingState
        description="This chapter is not part of the selected story."
        kicker={storyTitle}
        title="Chapter not found"
      />
    )
  }

  return (
    <Alert role="alert" variant="error">
      {errorMessage}
    </Alert>
  )
}
