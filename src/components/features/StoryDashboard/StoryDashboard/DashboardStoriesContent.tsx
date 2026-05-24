import { Alert } from '@/components/ui/Alert'
import type { Story } from '@/services/types'

import { EmptyStoryLibrary } from './DashboardStoriesContent/EmptyStoryLibrary'
import { SavedStoryList } from './DashboardStoriesContent/SavedStoryList'

interface Props {
  readonly isCreatingExample: boolean
  readonly isLoading: boolean
  readonly onCreateExampleStory: () => Promise<unknown>
  readonly onOpenNewStoryForm: () => void
  readonly onOpenStory: (storyId: string) => void
  readonly stories: Story[]
}

export function DashboardStoriesContent({
  isCreatingExample,
  isLoading,
  onCreateExampleStory,
  onOpenNewStoryForm,
  onOpenStory,
  stories,
}: Props) {
  if (isLoading) {
    return <Alert>Loading stories...</Alert>
  }

  if (stories.length === 0) {
    return (
      <EmptyStoryLibrary
        isCreatingExample={isCreatingExample}
        onCreateExampleStory={onCreateExampleStory}
        onOpenNewStoryForm={onOpenNewStoryForm}
      />
    )
  }

  return <SavedStoryList onOpenStory={onOpenStory} stories={stories} />
}
