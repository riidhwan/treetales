import { Plus } from 'lucide-react'

import {
  DASHBOARD_DISPLAY_FONT,
  DASHBOARD_ITALIC_FONT,
} from './dashboardDisplay'
import { storyDashboardCopy } from '@/copy'
import { cn } from '@/lib/utils'

interface Props {
  readonly isExpanded: boolean
  readonly isVisible: boolean
  readonly onToggle: () => void
}

export function NewStoryCallToAction({
  isExpanded,
  isVisible,
  onToggle,
}: Props) {
  if (!isVisible) {
    return null
  }

  return (
    <button
      aria-expanded={isExpanded}
      className="group relative z-10 grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-action-primary-hover bg-action-primary px-5 py-4 text-left text-surface-paper shadow-md transition hover:bg-action-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:rounded-xl"
      onClick={onToggle}
      type="button"
    >
      <span className="grid size-11 place-items-center rounded-lg bg-surface-paper/15 text-surface-paper">
        <Plus
          aria-hidden="true"
          className={cn(
            'transition-transform duration-150 motion-reduce:transition-none',
            isExpanded && 'rotate-45',
          )}
          size={22}
        />
      </span>
      <span className="min-w-0">
        <span
          className="block text-xl font-bold leading-tight"
          style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
        >
          {storyDashboardCopy.newStoryCta.title}
        </span>
        <span
          className="mt-1 block text-sm italic leading-5 text-surface-paper/75"
          style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
        >
          {storyDashboardCopy.newStoryCta.subtitle}
        </span>
      </span>
    </button>
  )
}
