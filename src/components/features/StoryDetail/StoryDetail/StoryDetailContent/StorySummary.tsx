import { Plus } from 'lucide-react'

import { storyDetailCopy } from '@/copy'
import type { Story } from '@/services/types'

interface Props {
  readonly onEditStory: (storyId: string) => void
  readonly story: Story
}

export function StorySummary({ onEditStory, story }: Props) {
  return (
    <article className="border-b border-border-subtle pb-7">
      <p className="text-xs font-semibold uppercase tracking-wide text-action-primary">
        {storyDetailCopy.storySummary.title}
      </p>
      {story.description ? (
        <p className="mt-3 text-sm leading-6 text-text-muted">
          {story.description}
        </p>
      ) : (
        <button
          className="mt-4 flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border border-dashed border-border-subtle bg-surface-paper/45 px-4 py-3 text-left text-sm text-text-muted transition hover:border-focus-ring hover:bg-highlight-soft/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          onClick={() => onEditStory(story.id)}
          type="button"
        >
          <span className="italic text-text-muted/70">
            {storyDetailCopy.storySummary.empty}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-action-primary">
            <Plus aria-hidden="true" size={16} />
            {storyDetailCopy.storySummary.add}
          </span>
        </button>
      )}
    </article>
  )
}
