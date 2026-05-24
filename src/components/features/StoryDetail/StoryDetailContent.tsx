import { CharacterSection } from '@/components/features/StoryDetail/CharacterSection'
import { MissingStoryDetail } from '@/components/features/StoryDetail/MissingStoryDetail'
import { StoryMaintenanceSection } from '@/components/features/StoryDetail/StoryMaintenanceSection'
import { StorySummary } from '@/components/features/StoryDetail/StorySummary'
import { Alert } from '@/components/ui/Alert'
import type { useStoryCharacters } from '@/hooks/useStoryCharacters'
import { useStoryDetail } from '@/hooks/useStoryDetail'
import type { Story } from '@/services/types'

interface Props {
  readonly characterDialog: ReturnType<typeof useStoryCharacters>
  readonly characterTitleId: string
  readonly errorMessage?: string
  readonly isDeleting: boolean
  readonly onEditStory: (storyId: string) => void
  readonly onOpenDashboard: () => void
  readonly onOpenDeleteDialog: () => void
  readonly status: ReturnType<typeof useStoryDetail>['status']
  readonly story?: Story
}

export function StoryDetailContent({
  characterDialog,
  characterTitleId,
  errorMessage,
  isDeleting,
  onEditStory,
  onOpenDashboard,
  onOpenDeleteDialog,
  status,
  story,
}: Props) {
  if (status === 'loading') {
    return <Alert className="shadow-sm">Loading story...</Alert>
  }

  if (status === 'error') {
    return (
      <Alert role="alert" variant="error">
        {errorMessage}
      </Alert>
    )
  }

  if (status === 'missing-story') {
    return <MissingStoryDetail onOpenDashboard={onOpenDashboard} />
  }

  if (!story) {
    return null
  }

  return (
    <>
      {errorMessage ? (
        <Alert role="alert" variant="error">
          {errorMessage}
        </Alert>
      ) : null}

      <StorySummary onEditStory={onEditStory} story={story} />

      <CharacterSection
        characterDialog={characterDialog}
        titleId={characterTitleId}
      />

      <StoryMaintenanceSection
        isDeleting={isDeleting}
        onDelete={onOpenDeleteDialog}
      />
    </>
  )
}
