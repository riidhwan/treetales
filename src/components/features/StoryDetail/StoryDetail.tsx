import { useId, useState } from 'react'

import { ManagementTopBar } from '@/components/features/shared/ManagementTopBar'
import {
  type StoryCharacterServices,
  useStoryCharacters,
} from '@/hooks/useStoryCharacters'
import {
  type StoryDetailServices,
  useStoryDetail,
} from '@/hooks/useStoryDetail'
import { commonCopy, storyDetailCopy } from '@/copy'

import { StoryDeleteDialog } from './StoryDetail/StoryDeleteDialog'
import { StoryDetailContent } from './StoryDetail/StoryDetailContent'
import { StoryDetailHeader } from './StoryDetail/StoryDetailHeader'

interface Props {
  readonly characterServices?: StoryCharacterServices
  readonly onDeleted: () => void
  readonly onEditStory: (storyId: string) => void
  readonly onOpenDashboard: () => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryDetailServices
  readonly storyId: string
}

export function StoryDetail({
  characterServices,
  onDeleted,
  onEditStory,
  onOpenDashboard,
  onReadStory,
  services,
  storyId,
}: Props) {
  const {
    deleteStory,
    errorMessage,
    isDeleting,
    status,
    story,
  } = useStoryDetail({ onDeleted, services, storyId })
  const characterTitleId = useId()
  const storyDeleteTitleId = useId()
  const [isStoryDeleteDialogOpen, setIsStoryDeleteDialogOpen] = useState(false)
  const characterDialog = useStoryCharacters({
    enabled: status === 'ready' && Boolean(story),
    services: characterServices,
    storyId,
  })

  return (
    <main className="min-h-screen bg-background-app text-text-primary">
      <ManagementTopBar
        label={storyDetailCopy.navigation.label}
        onBack={onOpenDashboard}
        previousLabel={commonCopy.actions.dashboard}
      />

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 py-8 sm:px-8">
        <StoryDetailHeader
          onEditStory={onEditStory}
          onReadStory={onReadStory}
          story={story}
        />

        <StoryDetailContent
          characterDialog={characterDialog}
          characterTitleId={characterTitleId}
          errorMessage={errorMessage}
          isDeleting={isDeleting}
          onEditStory={onEditStory}
          onOpenDashboard={onOpenDashboard}
          onOpenDeleteDialog={() => setIsStoryDeleteDialogOpen(true)}
          status={status}
          story={story}
        />
      </section>

      <StoryDeleteDialog
        isDeleting={isDeleting}
        isOpen={isStoryDeleteDialogOpen}
        onCancel={() => setIsStoryDeleteDialogOpen(false)}
        onConfirm={deleteStory}
        storyTitle={story?.title}
        titleId={storyDeleteTitleId}
      />
    </main>
  )
}
