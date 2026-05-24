import { Plus, Sparkles } from 'lucide-react'

import {
  DASHBOARD_DISPLAY_FONT,
} from '@/components/features/StoryDashboard/StoryDashboard/dashboardDisplay'
import { Button } from '@/components/ui/Button'
import { storyDashboardCopy } from '@/copy'

interface Props {
  readonly isCreatingExample: boolean
  readonly onCreateExampleStory: () => Promise<unknown>
  readonly onOpenNewStoryForm: () => void
}

export function EmptyStoryLibrary({
  isCreatingExample,
  onCreateExampleStory,
  onOpenNewStoryForm,
}: Props) {
  return (
    <section className="rounded-[2rem] border border-dashed border-border-subtle bg-surface-paper/80 p-7 text-center shadow-sm sm:p-8">
      <h2
        className="text-4xl font-bold leading-tight text-text-primary"
        style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
      >
        {storyDashboardCopy.empty.title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-base leading-7 text-text-muted">
        {storyDashboardCopy.empty.body}
      </p>
      <div className="mx-auto mt-6 grid max-w-md gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,0.5fr)]">
        <Button
          className="min-h-12 rounded-xl"
          disabled={isCreatingExample}
          onClick={() => void onCreateExampleStory()}
          variant="primary"
        >
          <Sparkles aria-hidden="true" size={18} />
          {storyDashboardCopy.actions.addExampleStory}
        </Button>
        <Button className="min-h-12 rounded-xl" onClick={onOpenNewStoryForm}>
          <Plus aria-hidden="true" size={18} />
          {storyDashboardCopy.actions.newStory}
        </Button>
      </div>
    </section>
  )
}
