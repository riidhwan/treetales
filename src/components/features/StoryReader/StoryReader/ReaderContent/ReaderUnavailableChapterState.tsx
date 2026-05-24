import { PlusCircle } from 'lucide-react'

import { ChapterDocumentShell } from '@/components/domain/ChapterDocumentShell'
import { Button } from '@/components/ui/Button'
import { storyReaderCopy } from '@/copy'
import { useStoryReader } from '@/hooks/useStoryReader'

interface Props {
  readonly onCreateIntroChapter: () => void
  readonly status: ReturnType<typeof useStoryReader>['status']
}

export function ReaderUnavailableChapterState({
  onCreateIntroChapter,
  status,
}: Props) {
  return (
    <ChapterDocumentShell>
      <h1 className="text-2xl font-bold">
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
        </div>
      )}
    </ChapterDocumentShell>
  )
}
