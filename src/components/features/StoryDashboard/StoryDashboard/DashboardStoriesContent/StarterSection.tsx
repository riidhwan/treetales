import { BookOpen } from 'lucide-react'

import {
  DASHBOARD_DISPLAY_FONT,
  DASHBOARD_ITALIC_FONT,
  getStoryRowAccentClass,
} from '@/components/features/StoryDashboard/StoryDashboard/dashboardDisplay'
import { Alert } from '@/components/ui/Alert'
import { storyDashboardCopy } from '@/copy'
import { cn } from '@/lib/utils'
import type { BuiltInExampleStorySummary } from '@/services/builtInExampleStories'

interface Props {
  readonly creatingStarterId?: string
  readonly isProminent: boolean
  readonly onOpenStarterStory: (
    builtInExampleStoryId: string,
  ) => Promise<unknown>
  readonly starterStories: BuiltInExampleStorySummary[]
  readonly unavailableStarterId?: string
}

export function StarterSection({
  creatingStarterId,
  isProminent,
  onOpenStarterStory,
  starterStories,
  unavailableStarterId,
}: Props) {
  return (
    <section
      aria-labelledby="starter-stories-heading"
      className={cn('grid', isProminent ? 'gap-5' : 'gap-4 pt-2')}
    >
      <div className="grid gap-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
          <span className="h-px bg-border-subtle" />
          <h2
            className="text-sm italic leading-none text-text-muted"
            id="starter-stories-heading"
            style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
          >
            {storyDashboardCopy.starterSection.heading}
          </h2>
          <span className="h-px bg-border-subtle" />
        </div>
        <p className="mx-auto max-w-2xl text-center text-sm leading-5 text-text-muted">
          {isProminent
            ? storyDashboardCopy.starterSection.primaryIntro
            : storyDashboardCopy.starterSection.secondaryIntro}
        </p>
      </div>

      {unavailableStarterId ? (
        <Alert role="status" variant="neutral">
          {storyDashboardCopy.starterSection.unavailable}
        </Alert>
      ) : null}

      <div className="grid gap-3">
        {starterStories.map((starterStory, index) => {
          const isCreating = creatingStarterId === starterStory.id

          return (
            <button
              aria-label={storyDashboardCopy.actions.openStarterStory(
                starterStory.title,
              )}
              className="group relative grid min-h-28 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 overflow-hidden rounded-2xl border border-border-subtle/70 bg-surface-paper/85 px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-focus-ring hover:bg-surface-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-24 sm:rounded-xl"
              disabled={Boolean(creatingStarterId)}
              key={starterStory.id}
              onClick={() => void onOpenStarterStory(starterStory.id)}
              type="button"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-0 top-5 h-16 w-1 rounded-r-full',
                  getStoryRowAccentClass(index),
                )}
              />
              <span className="min-w-0 pl-1">
                <span
                  className="block truncate text-xl font-bold leading-tight text-text-primary"
                  style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
                >
                  {starterStory.title}
                </span>
                <span
                  className="mt-1 block truncate text-sm italic leading-5 text-text-muted"
                  style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
                >
                  {starterStory.description}
                </span>
                <span className="mt-2 block truncate text-xs font-semibold text-action-primary-hover">
                  {storyDashboardCopy.starterSection.sourcePrefix}:{' '}
                  {starterStory.storyProvenance.displayText}
                </span>
              </span>
              <span className="grid justify-items-center gap-1 text-text-muted/70 transition group-hover:translate-x-1 group-hover:text-action-primary">
                <BookOpen aria-hidden="true" size={20} />
                {isCreating ? (
                  <span className="text-xs font-semibold">
                    {storyDashboardCopy.starterSection.loadingAction}
                  </span>
                ) : null}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
