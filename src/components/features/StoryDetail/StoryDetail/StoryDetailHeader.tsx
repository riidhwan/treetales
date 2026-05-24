import { BookOpen, Edit3 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { commonCopy, storyDetailCopy } from '@/copy'

import { MANAGEMENT_DISPLAY_FONT } from './constants'
import type { Story } from '@/services/types'

interface Props {
  readonly onEditStory: (storyId: string) => void
  readonly onReadStory: (storyId: string) => void
  readonly story?: Story
}

export function StoryDetailHeader({
  onEditStory,
  onReadStory,
  story,
}: Props) {
  if (!story) {
    return null
  }

  return (
    <header className="border-b border-border-subtle pb-7">
      <div className="flex flex-col gap-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-action-primary">
            {commonCopy.actions.story}
          </p>
          <h1
            className="mt-2 text-4xl font-bold leading-none sm:text-5xl"
            style={{ fontFamily: MANAGEMENT_DISPLAY_FONT }}
          >
            {story.title || storyDetailCopy.actions.untitledStory}
          </h1>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(8.25rem,0.34fr)] gap-3">
          <Button
            className="min-h-12 w-full rounded-lg text-sm shadow-md"
            onClick={() => onReadStory(story.id)}
            variant="primary"
          >
            <BookOpen aria-hidden="true" size={18} />
            {storyDetailCopy.actions.read}
          </Button>
          <Button
            className="min-h-12 w-full rounded-lg bg-surface-paper text-sm"
            onClick={() => onEditStory(story.id)}
          >
            <Edit3 aria-hidden="true" size={18} />
            {commonCopy.actions.edit}
          </Button>
        </div>
      </div>
    </header>
  )
}
