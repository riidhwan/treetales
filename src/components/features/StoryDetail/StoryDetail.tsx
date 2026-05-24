import { ChevronLeft } from 'lucide-react'
import { useId, useState } from 'react'

import {
  type StoryCharacterServices,
  useStoryCharacters,
} from '@/hooks/useStoryCharacters'
import {
  type StoryDetailServices,
  useStoryDetail,
} from '@/hooks/useStoryDetail'

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
      <header className="border-b border-border-subtle/70 bg-surface-paper/35">
        <nav
          aria-label="Story detail navigation"
          className="mx-auto flex min-h-16 w-full max-w-3xl items-center justify-between px-5 sm:px-8"
        >
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-md text-base font-medium text-action-primary transition hover:text-action-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            onClick={onOpenDashboard}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={22} />
            Dashboard
          </button>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-9 px-5 py-10 sm:px-8">
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
