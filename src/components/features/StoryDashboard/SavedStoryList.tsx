import { ChevronRight } from 'lucide-react'

import {
  DASHBOARD_DISPLAY_FONT,
  DASHBOARD_ITALIC_FONT,
  getStoryRowAccentClass,
} from '@/components/features/StoryDashboard/dashboardDisplay'
import type { Story } from '@/services/types'

interface Props {
  readonly onOpenStory: (storyId: string) => void
  readonly stories: Story[]
}

export function SavedStoryList({ onOpenStory, stories }: Props) {
  return (
    <section aria-labelledby="saved-stories-heading" className="grid gap-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
        <span className="h-px bg-border-subtle" />
        <h2
          className="text-base italic leading-none text-text-muted"
          id="saved-stories-heading"
          style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
        >
          Saved stories
        </h2>
        <span className="h-px bg-border-subtle" />
      </div>
      <div className="grid gap-4">
        {stories.map((story, index) => (
          <button
            aria-label={`Open ${story.title}`}
            className="group relative grid min-h-28 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-[1.75rem] border border-border-subtle/70 bg-surface-paper/85 px-6 py-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-focus-ring hover:bg-surface-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:px-8"
            key={story.id}
            onClick={() => onOpenStory(story.id)}
            type="button"
          >
            <span
              aria-hidden="true"
              className={`${getStoryRowAccentClass(index)} absolute left-0 top-6 h-16 w-1 rounded-r-full`}
            />
            <span className="min-w-0 pl-1">
              <span
                className="block truncate text-2xl font-bold leading-tight text-text-primary sm:text-3xl"
                style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
              >
                {story.title}
              </span>
              <span
                className="mt-1 block truncate text-base italic leading-6 text-text-muted"
                style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
              >
                {story.description || 'No description yet.'}
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              className="text-text-muted/70 transition group-hover:translate-x-1 group-hover:text-action-primary"
              size={24}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
