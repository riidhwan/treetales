import type { ReaderFontId } from '@/config'
import { useReaderAppearance } from '@/hooks/useReaderAppearance'
import type { Chapter, Story } from '@/services/types'

import { ReaderToolbar } from './ReaderToolbarSlot/ReaderToolbar'

interface Props {
  readonly canDecreaseFontSize: boolean
  readonly canIncreaseFontSize: boolean
  readonly currentChapter?: Chapter
  readonly isReadingChapter: boolean
  readonly onDecreaseFontSize: () => void
  readonly onEditChapter: (chapterId: string) => void
  readonly onIncreaseFontSize: () => void
  readonly onOpenDashboard: () => void
  readonly onOpenStoryDetails: () => void
  readonly onResetReaderAppearance: () => void
  readonly onSelectParentChapter: () => void
  readonly onSelectReaderFont: (fontId: ReaderFontId) => void
  readonly parentChapter?: Chapter
  readonly readerAppearance: ReturnType<typeof useReaderAppearance>['readerAppearance']
  readonly story?: Story
}

export function ReaderToolbarSlot({
  canDecreaseFontSize,
  canIncreaseFontSize,
  currentChapter,
  isReadingChapter,
  onDecreaseFontSize,
  onEditChapter,
  onIncreaseFontSize,
  onOpenDashboard,
  onOpenStoryDetails,
  onResetReaderAppearance,
  onSelectParentChapter,
  onSelectReaderFont,
  parentChapter,
  readerAppearance,
  story,
}: Props) {
  if (!isReadingChapter || !story || !currentChapter) {
    return null
  }

  return (
    <ReaderToolbar
      canDecreaseFontSize={canDecreaseFontSize}
      canIncreaseFontSize={canIncreaseFontSize}
      onDecreaseFontSize={onDecreaseFontSize}
      onEditChapter={() => onEditChapter(currentChapter.id)}
      onIncreaseFontSize={onIncreaseFontSize}
      onOpenDashboard={onOpenDashboard}
      onOpenStoryDetails={onOpenStoryDetails}
      onResetReaderAppearance={onResetReaderAppearance}
      onSelectParentChapter={onSelectParentChapter}
      onSelectReaderFont={onSelectReaderFont}
      parentChapter={parentChapter}
      readerAppearance={readerAppearance}
    />
  )
}
