import { BookOpen, Edit3 } from 'lucide-react'

import { MANAGEMENT_DISPLAY_FONT } from '@/components/features/StoryDetail/constants'
import { Button } from '@/components/ui/Button'
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
    <header className="border-b border-border-subtle pb-9">
      <div className="flex flex-col gap-7">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-action-primary">
            Story
          </p>
          <h1
            className="mt-3 text-5xl font-bold leading-none sm:text-6xl"
            style={{ fontFamily: MANAGEMENT_DISPLAY_FONT }}
          >
            {story.title || 'Untitled story'}
          </h1>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(8.25rem,0.34fr)] gap-3">
          <Button
            className="min-h-14 w-full rounded-xl text-base shadow-md"
            onClick={() => onReadStory(story.id)}
            variant="primary"
          >
            <BookOpen aria-hidden="true" size={20} />
            Read
          </Button>
          <Button
            className="min-h-14 w-full rounded-xl bg-surface-paper text-base"
            onClick={() => onEditStory(story.id)}
          >
            <Edit3 aria-hidden="true" size={20} />
            Edit
          </Button>
        </div>
      </div>
    </header>
  )
}
