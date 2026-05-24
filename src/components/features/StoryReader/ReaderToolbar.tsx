import { BookOpen, CornerUpLeft, Edit3, Home } from 'lucide-react'
import { useState } from 'react'

import type { ReaderFontId } from '@/config'
import { ReaderAppearanceControl } from '@/components/domain/ReaderAppearanceControl'
import { IconButton } from '@/components/ui/IconButton'
import { Toolbar } from '@/components/ui/Toolbar'
import { useReaderAppearance } from '@/hooks/useReaderAppearance'
import type { Chapter } from '@/services/types'

interface Props {
  readonly canDecreaseFontSize: boolean
  readonly canIncreaseFontSize: boolean
  readonly onDecreaseFontSize: () => void
  readonly onEditChapter: () => void
  readonly onIncreaseFontSize: () => void
  readonly onOpenDashboard: () => void
  readonly onOpenStoryDetails: () => void
  readonly onResetReaderAppearance: () => void
  readonly onSelectParentChapter: () => void
  readonly onSelectReaderFont: (fontId: ReaderFontId) => void
  readonly parentChapter?: Chapter
  readonly readerAppearance: ReturnType<typeof useReaderAppearance>['readerAppearance']
}

export function ReaderToolbar({
  canDecreaseFontSize,
  canIncreaseFontSize,
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
}: Props) {
  const [isAppearancePanelOpen, setIsAppearancePanelOpen] = useState(false)

  return (
    <Toolbar
      label="Reader actions"
      leading={
        parentChapter ? (
          <IconButton
            label="Parent Chapter"
            onClick={onSelectParentChapter}
            size="sm"
          >
            <CornerUpLeft aria-hidden="true" size={16} />
          </IconButton>
        ) : null
      }
      trailing={
        <>
          <IconButton
            label="Story Details"
            onClick={onOpenStoryDetails}
            size="sm"
          >
            <BookOpen aria-hidden="true" size={16} />
          </IconButton>
          <ReaderAppearanceControl
            canDecreaseFontSize={canDecreaseFontSize}
            canIncreaseFontSize={canIncreaseFontSize}
            isPanelOpen={isAppearancePanelOpen}
            onDecreaseFontSize={onDecreaseFontSize}
            onIncreaseFontSize={onIncreaseFontSize}
            onOpenChange={setIsAppearancePanelOpen}
            onResetReaderAppearance={onResetReaderAppearance}
            onSelectReaderFont={onSelectReaderFont}
            readerAppearance={readerAppearance}
          />
          <IconButton label="Edit Chapter" onClick={onEditChapter} size="sm">
            <Edit3 aria-hidden="true" size={16} />
          </IconButton>
          <IconButton label="Dashboard" onClick={onOpenDashboard} size="sm">
            <Home aria-hidden="true" size={16} />
          </IconButton>
        </>
      }
    />
  )
}
