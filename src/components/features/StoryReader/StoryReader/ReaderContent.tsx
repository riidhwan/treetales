import type { CSSProperties } from 'react'

import { useStoryReader } from '@/hooks/useStoryReader'
import type { Chapter, Story } from '@/services/types'

import { ReaderChapterDocument } from './ReaderContent/ReaderChapterDocument'
import { ReaderErrorState } from './ReaderContent/ReaderErrorState'
import { ReaderLoadingState } from './ReaderContent/ReaderLoadingState'
import { ReaderMissingStoryState } from './ReaderContent/ReaderMissingStoryState'
import { ReaderUnavailableChapterState } from './ReaderContent/ReaderUnavailableChapterState'

interface Props {
  readonly currentChapter?: Chapter
  readonly errorMessage?: string
  readonly nextChapters: Chapter[]
  readonly onCreateChildChapter: (parentChapterId: string) => void
  readonly onCreateIntroChapter: () => void
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
        status={status}
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
