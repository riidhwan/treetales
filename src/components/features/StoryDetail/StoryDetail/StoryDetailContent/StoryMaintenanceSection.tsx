import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { commonCopy, storyDetailCopy } from '@/copy'

interface Props {
  readonly isDeleting: boolean
  readonly onDelete: () => void
}

export function StoryMaintenanceSection({ isDeleting, onDelete }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-action-destructive/25 bg-state-destructive-soft/25">
      <div className="px-4 py-4 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-action-destructive">
          {storyDetailCopy.maintenance.title}
        </p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted">
          {storyDetailCopy.maintenance.body}
        </p>
      </div>
      <div className="border-t border-action-destructive/20 bg-surface-paper/35 px-4 py-3 sm:px-5">
        <Button
          className="w-full border-0 bg-transparent text-sm shadow-none hover:bg-state-destructive-soft/60 sm:min-h-11"
          disabled={isDeleting}
          onClick={onDelete}
          variant="danger"
        >
          <Trash2 aria-hidden="true" size={16} />
          {isDeleting
            ? commonCopy.actions.deleting
            : storyDetailCopy.actions.deleteStory}
        </Button>
      </div>
    </section>
  )
}
