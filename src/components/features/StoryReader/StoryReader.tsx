import { ReaderContent } from '@/components/features/StoryReader/ReaderContent'
import { ReaderToolbarSlot } from '@/components/features/StoryReader/ReaderToolbarSlot'
import {
  type StoryReaderServices,
  useStoryReader,
} from '@/hooks/useStoryReader'
import { useReaderAppearance } from '@/hooks/useReaderAppearance'

interface Props {
  readonly chapterId?: string
  readonly onCreateChildChapter: (storyId: string, parentChapterId: string) => void
  readonly onCreateIntroChapter: (storyId: string) => void
  readonly onEditChapter: (storyId: string, chapterId: string) => void
  readonly onOpenDashboard: () => void
  readonly onOpenStoryDetails: (storyId: string) => void
  readonly onSelectChapter: (chapterId: string) => void
  readonly services?: StoryReaderServices
  readonly storyId: string
}

export function StoryReader({
  chapterId,
  onCreateChildChapter,
  onCreateIntroChapter,
  onEditChapter,
  onOpenDashboard,
  onOpenStoryDetails,
  onSelectChapter,
  services,
  storyId,
}: Props) {
  const {
    canDecreaseFontSize,
    canIncreaseFontSize,
    decreaseFontSize,
    increaseFontSize,
    readerAppearance,
    resetReaderAppearance,
    selectedFontFamily,
    setReaderFont,
  } = useReaderAppearance()
  const {
    currentChapter,
    errorMessage,
    nextChapters,
    parentChapter,
    selectParentChapter,
    selectNextChapter,
    status,
    story,
  } = useStoryReader({ chapterId, onSelectChapter, services, storyId })
  const isReadingChapter = Boolean(story && currentChapter)

  return (
    <main className="min-h-screen bg-background-app text-text-primary">
      <ReaderToolbarSlot
        canDecreaseFontSize={canDecreaseFontSize}
        canIncreaseFontSize={canIncreaseFontSize}
        currentChapter={currentChapter}
        isReadingChapter={isReadingChapter}
        onDecreaseFontSize={decreaseFontSize}
        onEditChapter={(selectedChapterId) =>
          onEditChapter(storyId, selectedChapterId)
        }
        onIncreaseFontSize={increaseFontSize}
        onOpenDashboard={onOpenDashboard}
        onOpenStoryDetails={() => onOpenStoryDetails(storyId)}
        onResetReaderAppearance={resetReaderAppearance}
        onSelectParentChapter={selectParentChapter}
        onSelectReaderFont={setReaderFont}
        parentChapter={parentChapter}
        readerAppearance={readerAppearance}
        story={story}
      />

      <section className="mx-auto w-full max-w-5xl px-0 py-0 sm:px-6 sm:py-6 lg:py-10">
        <ReaderContent
          currentChapter={currentChapter}
          errorMessage={errorMessage}
          nextChapters={nextChapters}
          onCreateChildChapter={(parentChapterId) =>
            onCreateChildChapter(storyId, parentChapterId)
          }
          onCreateIntroChapter={() => onCreateIntroChapter(storyId)}
          onOpenStoryDetails={() => onOpenStoryDetails(storyId)}
          onSelectNextChapter={selectNextChapter}
          readerFontFamily={selectedFontFamily}
          readerFontSizePt={readerAppearance.fontSizePt}
          status={status}
          story={story}
        />
      </section>
    </main>
  )
}
