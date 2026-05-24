import { Alert } from '@/components/ui/Alert'
import { storyDashboardCopy } from '@/copy'
import type { BuiltInExampleStorySummary } from '@/services/builtInExampleStories'
import type { Story } from '@/services/types'

import { EmptyStoryLibrary } from './DashboardStoriesContent/EmptyStoryLibrary'
import { SavedStoryList } from './DashboardStoriesContent/SavedStoryList'
import { StarterSection } from './DashboardStoriesContent/StarterSection'

interface Props {
  readonly creatingStarterId?: string
  readonly isLoading: boolean
  readonly onOpenNewStoryForm: () => void
  readonly onOpenStory: (storyId: string) => void
  readonly onOpenStarterStory: (
    builtInExampleStoryId: string,
  ) => Promise<unknown>
  readonly starterStories: BuiltInExampleStorySummary[]
  readonly stories: Story[]
  readonly unavailableStarterId?: string
}

export function DashboardStoriesContent({
  creatingStarterId,
  isLoading,
  onOpenNewStoryForm,
  onOpenStory,
  onOpenStarterStory,
  starterStories,
  stories,
  unavailableStarterId,
}: Props) {
  if (isLoading) {
    return <Alert>{storyDashboardCopy.loading}</Alert>
  }

  if (stories.length === 0) {
    return (
      <div className="grid gap-6">
        <StarterSection
          creatingStarterId={creatingStarterId}
          isProminent
          onOpenStarterStory={onOpenStarterStory}
          starterStories={starterStories}
          unavailableStarterId={unavailableStarterId}
        />
        <EmptyStoryLibrary onOpenNewStoryForm={onOpenNewStoryForm} />
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <SavedStoryList onOpenStory={onOpenStory} stories={stories} />
      <StarterSection
        creatingStarterId={creatingStarterId}
        isProminent={false}
        onOpenStarterStory={onOpenStarterStory}
        starterStories={starterStories}
        unavailableStarterId={unavailableStarterId}
      />
    </div>
  )
}
