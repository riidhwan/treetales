import { BookOpen, PlusCircle } from 'lucide-react'

import { ChapterDocumentShell } from '@/components/domain/ChapterDocumentShell'
import { Button } from '@/components/ui/Button'
import { storyReaderCopy } from '@/copy'
import { useStoryReader } from '@/hooks/useStoryReader'
import type { Story } from '@/services/types'

interface Props {
  readonly onCreateIntroChapter: () => void
  readonly onOpenStoryDetails: () => void
  readonly status: ReturnType<typeof useStoryReader>['status']
  readonly story: Story
}

export function ReaderUnavailableChapterState({
  onCreateIntroChapter,
  onOpenStoryDetails,
  status,
  story,
}: Props) {
  return (
    <ChapterDocumentShell>
      <p className="text-sm font-semibold uppercase tracking-wide text-action-primary">
        {story.title}
      </p>
      <h1 className="mt-2 text-2xl font-bold">
        {status === 'missing-chapter'
          ? storyReaderCopy.missingChapter.title
          : storyReaderCopy.noIntroChapter.title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-text-muted">
        {status === 'missing-chapter'
          ? storyReaderCopy.missingChapter.body
          : storyReaderCopy.noIntroChapter.body}
      </p>
      {status === 'missing-chapter' ? null : (
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={onCreateIntroChapter} variant="primary">
            <PlusCircle aria-hidden="true" size={16} />
            {storyReaderCopy.actions.addIntroChapter}
          </Button>
          <Button onClick={onOpenStoryDetails}>
            <BookOpen aria-hidden="true" size={16} />
            {storyReaderCopy.actions.storyDetails}
          </Button>
        </div>
      )}
    </ChapterDocumentShell>
  )
}
