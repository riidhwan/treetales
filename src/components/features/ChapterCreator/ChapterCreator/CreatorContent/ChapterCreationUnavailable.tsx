import { ChapterWritingMissingState } from '@/components/features/shared/ChapterWriting'
import { Alert } from '@/components/ui/Alert'
import { chapterWritingCopy, commonCopy } from '@/copy'
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
        description={commonCopy.messages.storyNotFound.body}
        title={commonCopy.messages.storyNotFound.title}
      />
    )
  }

  if (status === 'missing-parent-chapter') {
    return (
      <ChapterWritingMissingState
        description={chapterWritingCopy.creation.missingParentChapter.body}
        kicker={storyTitle}
        title={chapterWritingCopy.creation.missingParentChapter.title}
      />
    )
  }

  if (status === 'intro-chapter-exists') {
    return (
      <ChapterWritingMissingState
        description={chapterWritingCopy.existingIntroChapter.body}
        kicker={storyTitle}
        title={
          introChapterTitle ??
          chapterWritingCopy.existingIntroChapter.fallbackTitle
        }
      />
    )
  }

  return errorMessage ? (
    <Alert role="alert" variant="error">
      {errorMessage}
    </Alert>
  ) : null
}
