import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { commonCopy, storyDetailCopy } from '@/copy'

interface Props {
  readonly isDeleting: boolean
  readonly onDelete: () => void
}

export function StoryMaintenanceSection({ isDeleting, onDelete }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-action-destructive/25 bg-state-destructive-soft/25">
      <div className="px-5 py-5 sm:px-7">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-action-destructive">
          {storyDetailCopy.maintenance.title}
        </p>
        <p className="mt-3 max-w-xl text-sm leading-6 text-text-muted sm:text-base">
          {storyDetailCopy.maintenance.body}
        </p>
      </div>
      <div className="border-t border-action-destructive/20 bg-surface-paper/35 px-5 py-4 sm:px-7">
        <Button
          className="w-full border-0 bg-transparent text-base shadow-none hover:bg-state-destructive-soft/60 sm:min-h-12"
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
