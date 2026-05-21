import { BookOpen, Edit3, Home, Trash2 } from 'lucide-react'
import { useId } from 'react'

import { CharacterSection } from '@/components/features/storyDetail/CharacterSection'
import {
  type StoryCharacterServices,
  useStoryCharacters,
} from '@/hooks/useStoryCharacters'
import {
  type StoryDetailServices,
  useStoryDetail,
} from '@/hooks/useStoryDetail'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

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
    deleteStoryWithConfirmation,
    errorMessage,
    isDeleting,
    status,
    story,
  } = useStoryDetail({ onDeleted, services, storyId })
  const characterTitleId = useId()
  const characterDialog = useStoryCharacters({
    enabled: status === 'ready' && Boolean(story),
    services: characterServices,
    storyId,
  })

  let detailContent: React.ReactNode = null

  if (status === 'loading') {
    detailContent = <Alert className="shadow-sm">Loading story...</Alert>
  } else if (status === 'error') {
    detailContent = (
      <Alert role="alert" variant="error">
        {errorMessage}
      </Alert>
    )
  } else if (status === 'missing-story') {
    detailContent = (
      <section className="rounded-lg border border-tt-line bg-tt-paper p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <p className="mt-3 text-sm leading-6 text-tt-muted">
          This story may have been deleted or is unavailable in this browser.
        </p>
        <Button className="mt-5" onClick={onOpenDashboard} size="sm">
          <Home aria-hidden="true" size={16} />
          Dashboard
        </Button>
      </section>
    )
  } else if (story) {
    detailContent = (
      <>
        {errorMessage ? (
          <Alert role="alert" variant="error">
            {errorMessage}
          </Alert>
        ) : null}

        <article className="border-b border-tt-line pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
            Story summary
          </p>
          <p className="mt-4 text-sm leading-6 text-tt-muted sm:text-base">
            {story.description || 'No description yet.'}
          </p>
        </article>

        <CharacterSection
          characterDialog={characterDialog}
          titleId={characterTitleId}
        />

        <StoryMaintenanceSection
          isDeleting={isDeleting}
          onDelete={() => void deleteStoryWithConfirmation()}
        />
      </>
    )
  }

  return (
    <main className="min-h-screen bg-tt-parchment text-tt-ink">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
        {story ? (
          <header className="border-b border-tt-line pb-6">
            <nav aria-label="Story detail navigation">
              <Button onClick={onOpenDashboard} size="sm">
                <Home aria-hidden="true" size={16} />
                Dashboard
              </Button>
            </nav>
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
                  Story
                </p>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                  {story.title || 'Untitled story'}
                </h1>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => onReadStory(story.id)}
                  variant="primary"
                >
                  <BookOpen aria-hidden="true" size={18} />
                  Read
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => onEditStory(story.id)}
                >
                  <Edit3 aria-hidden="true" size={18} />
                  Edit
                </Button>
              </div>
            </div>
          </header>
        ) : (
          <nav
            aria-label="Story detail navigation"
            className="flex flex-wrap justify-between gap-3"
          >
            <Button onClick={onOpenDashboard} size="sm">
              <Home aria-hidden="true" size={16} />
              Dashboard
            </Button>
          </nav>
        )}

        {detailContent}
      </section>
    </main>
  )
}

interface StoryMaintenanceSectionProps {
  readonly isDeleting: boolean
  readonly onDelete: () => void
}

function StoryMaintenanceSection({
  isDeleting,
  onDelete,
}: StoryMaintenanceSectionProps) {
  return (
    <section className="border-t border-tt-line pt-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-tt-muted">
        Story maintenance
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-6 text-tt-muted">
          Delete this Story and all of its Chapters and Characters.
        </p>
        <Button
          className="w-full sm:w-auto"
          disabled={isDeleting}
          onClick={onDelete}
          size="sm"
          variant="danger"
        >
          <Trash2 aria-hidden="true" size={16} />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </section>
  )
}
