import { Plus } from 'lucide-react'

import {
  DASHBOARD_DISPLAY_FONT,
} from '@/components/features/StoryDashboard/StoryDashboard/dashboardDisplay'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { storyDashboardCopy } from '@/copy'

interface Props {
  readonly onOpenNewStoryForm: () => void
}

export function EmptyStoryLibrary({
  onOpenNewStoryForm,
}: Props) {
  return (
    <EmptyState
      actions={(
        <div className="mx-auto mt-5 grid max-w-xs gap-3">
          <Button className="min-h-11 rounded-lg" onClick={onOpenNewStoryForm}>
            <Plus aria-hidden="true" size={18} />
            {storyDashboardCopy.actions.newStory}
          </Button>
        </div>
      )}
      className="rounded-2xl border border-dashed border-border-subtle bg-surface-paper/80 p-6 text-center shadow-sm sm:rounded-2xl"
      description={storyDashboardCopy.empty.body}
      descriptionClassName="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted"
      title={storyDashboardCopy.empty.title}
      titleClassName="text-2xl font-bold leading-tight text-text-primary sm:text-3xl"
      titleStyle={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
      variant="unstyled"
    />
  )
}
