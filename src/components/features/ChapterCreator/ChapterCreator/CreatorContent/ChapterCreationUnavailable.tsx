import { ChapterWritingMissingState } from '@/components/features/shared/ChapterWriting'
import { Alert } from '@/components/ui/Alert'
import { useChapterCreator } from '@/hooks/useChapterCreator'

interface Props {
  readonly errorMessage?: string
  readonly introChapterTitle?: string
  readonly status: ReturnType<typeof useChapterCreator>['status']
  readonly storyTitle?: string
}

export function ChapterCreationUnavailable({
  errorMessage,
  introChapterTitle,
  status,
  storyTitle,
}: Props) {
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
