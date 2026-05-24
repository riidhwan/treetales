import { ChevronRight, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { storyReaderCopy } from '@/copy'
import type { Chapter } from '@/services/types'

interface Props {
  readonly nextChapters: Chapter[]
  readonly onCreateChildChapter: () => void
  readonly onSelectChapter: (chapter: Chapter) => void
}

export function NextChapterControls({
  nextChapters,
  onCreateChildChapter,
  onSelectChapter,
}: Props) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
        {storyReaderCopy.branch.heading}
      </h2>
      {nextChapters.length === 0 ? (
        <p className="mt-3 inline-flex min-h-10 items-center rounded-md bg-surface-paper-deep px-3 text-sm font-semibold text-text-muted">
          {storyReaderCopy.branch.terminal}
        </p>
      ) : (
        <div className="mt-3 grid gap-2">
          {nextChapters.map((nextChapter) => (
            <button
              className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-paper-deep/35 px-4 py-3 text-left text-sm font-semibold text-text-primary transition hover:border-focus-ring hover:bg-highlight-soft/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              key={nextChapter.id}
              onClick={() => onSelectChapter(nextChapter)}
              type="button"
            >
              <span>{nextChapter.title}</span>
              <ChevronRight
                aria-hidden="true"
                className="shrink-0 text-text-muted transition group-hover:text-action-primary"
                size={18}
              />
            </button>
          ))}
        </div>
      )}
      <Button
        className="mt-4"
        onClick={onCreateChildChapter}
        size="sm"
        variant="primary"
      >
        <PlusCircle aria-hidden="true" size={16} />
        {storyReaderCopy.actions.addBranch}
      </Button>
    </div>
  )
}
