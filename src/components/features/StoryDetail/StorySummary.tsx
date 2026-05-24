import { Plus } from 'lucide-react'

import type { Story } from '@/services/types'

interface Props {
  readonly onEditStory: (storyId: string) => void
  readonly story: Story
}

export function StorySummary({ onEditStory, story }: Props) {
  return (
    <article className="border-b border-border-subtle pb-9">
      <p className="text-sm font-semibold uppercase tracking-wide text-action-primary">
        Story summary
      </p>
      {story.description ? (
        <p className="mt-4 text-sm leading-6 text-text-muted sm:text-base">
          {story.description}
        </p>
      ) : (
        <button
          className="mt-5 flex min-h-20 w-full items-center justify-between gap-4 rounded-2xl border border-dashed border-border-subtle bg-surface-paper/45 px-5 py-4 text-left text-sm text-text-muted transition hover:border-focus-ring hover:bg-highlight-soft/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:text-base"
          onClick={() => onEditStory(story.id)}
          type="button"
        >
          <span className="italic text-text-muted/70">
            No description yet - tap to add one.
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-action-primary">
            <Plus aria-hidden="true" size={18} />
            Add
          </span>
        </button>
      )}
    </article>
  )
}
