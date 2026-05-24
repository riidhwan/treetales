import type { CSSProperties } from 'react'

import { ReaderChapterDocument } from '@/components/features/StoryReader/ReaderChapterDocument'
import { ReaderErrorState } from '@/components/features/StoryReader/ReaderErrorState'
import { ReaderLoadingState } from '@/components/features/StoryReader/ReaderLoadingState'
import { ReaderMissingStoryState } from '@/components/features/StoryReader/ReaderMissingStoryState'
import { ReaderUnavailableChapterState } from '@/components/features/StoryReader/ReaderUnavailableChapterState'
import { useStoryReader } from '@/hooks/useStoryReader'
import type { Chapter, Story } from '@/services/types'

interface Props {
  readonly currentChapter?: Chapter
  readonly errorMessage?: string
  readonly nextChapters: Chapter[]
  readonly onCreateChildChapter: (parentChapterId: string) => void
  readonly onCreateIntroChapter: () => void
  readonly onOpenStoryDetails: () => void
  readonly onSelectNextChapter: (chapter: Chapter) => void
  readonly readerFontFamily: string
  readonly readerFontSizePt: number
  readonly status: ReturnType<typeof useStoryReader>['status']
  readonly story?: Story
}

export function ReaderContent({
  currentChapter,
  errorMessage,
  nextChapters,
  onCreateChildChapter,
  onCreateIntroChapter,
  onOpenStoryDetails,
  onSelectNextChapter,
  readerFontFamily,
  readerFontSizePt,
  status,
  story,
}: Props) {
  const readerDocumentStyle: CSSProperties = {
    fontFamily: `"${readerFontFamily}", Georgia, serif`,
    fontSize: `${readerFontSizePt}pt`,
  }

  if (status === 'loading') {
    return <ReaderLoadingState />
  }

  if (status === 'missing-story') {
    return <ReaderMissingStoryState />
  }

  if (status === 'error') {
    return <ReaderErrorState errorMessage={errorMessage} />
  }

  if (!currentChapter && story) {
    return (
      <ReaderUnavailableChapterState
        onCreateIntroChapter={onCreateIntroChapter}
        onOpenStoryDetails={onOpenStoryDetails}
        status={status}
        story={story}
      />
    )
  }

  if (story && currentChapter) {
    return (
      <ReaderChapterDocument
        currentChapter={currentChapter}
        nextChapters={nextChapters}
        onCreateChildChapter={onCreateChildChapter}
        onSelectNextChapter={onSelectNextChapter}
        readerDocumentStyle={readerDocumentStyle}
        story={story}
      />
    )
  }

  return null
}
