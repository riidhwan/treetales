import { ArrowRight, Plus } from 'lucide-react'

import {
  DASHBOARD_DISPLAY_FONT,
  DASHBOARD_ITALIC_FONT,
} from './dashboardDisplay'

interface Props {
  readonly isExpanded: boolean
  readonly isVisible: boolean
  readonly onOpen: () => void
}

export function NewStoryCallToAction({
  isExpanded,
  isVisible,
  onOpen,
}: Props) {
  if (!isVisible) {
    return null
  }

  return (
    <button
      aria-expanded={isExpanded}
      className="group relative grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-5 rounded-[1.75rem] border border-action-primary-hover bg-action-primary px-6 py-6 pr-14 text-left text-surface-paper shadow-md transition hover:bg-action-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-8 sm:pr-8"
      onClick={onOpen}
      type="button"
    >
      <span className="grid size-14 place-items-center rounded-xl bg-surface-paper/15 text-surface-paper">
        <Plus aria-hidden="true" size={30} />
      </span>
      <span className="min-w-0">
        <span
          className="block text-2xl font-bold leading-tight sm:text-3xl"
          style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
        >
          Begin a new story
        </span>
        <span
          className="mt-1 block text-base italic leading-6 text-surface-paper/75 sm:text-lg"
          style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
        >
          Branch it, shape it, make it yours
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="absolute right-6 text-surface-paper/70 transition group-hover:translate-x-1 group-hover:text-surface-paper sm:static"
        size={24}
      />
    </button>
  )
}
