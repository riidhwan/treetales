import { BookOpen, ChevronLeft, Edit3, Home, Plus, Trash2 } from 'lucide-react'
import { useId } from 'react'

import { CharacterSection } from '@/components/features/storyDetail/CharacterSection'
import { MANAGEMENT_DISPLAY_FONT } from '@/components/features/storyDetail/constants'
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

        <article className="border-b border-tt-line pb-9">
          <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
            Story summary
          </p>
          {story.description ? (
            <p className="mt-4 text-sm leading-6 text-tt-muted sm:text-base">
              {story.description}
            </p>
          ) : (
            <button
              className="mt-5 flex min-h-20 w-full items-center justify-between gap-4 rounded-2xl border border-dashed border-tt-line bg-tt-paper/45 px-5 py-4 text-left text-sm text-tt-muted transition hover:border-tt-gold hover:bg-tt-gold-soft/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-gold sm:text-base"
              onClick={() => onEditStory(story.id)}
              type="button"
            >
              <span className="italic text-tt-muted/70">
                No description yet - tap to add one.
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-tt-moss">
                <Plus aria-hidden="true" size={18} />
                Add
              </span>
            </button>
          )}
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
      <header className="border-b border-tt-line/70 bg-tt-paper/35">
        <nav
          aria-label="Story detail navigation"
          className="mx-auto flex min-h-16 w-full max-w-3xl items-center justify-between px-5 sm:px-8"
        >
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-md text-base font-medium text-tt-moss transition hover:text-tt-moss-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-gold"
            onClick={onOpenDashboard}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={22} />
            Dashboard
          </button>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-9 px-5 py-10 sm:px-8">
        {story ? (
          <header className="border-b border-tt-line pb-9">
            <div className="flex flex-col gap-7">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
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
                  className="min-h-14 w-full rounded-xl bg-tt-paper text-base"
                  onClick={() => onEditStory(story.id)}
                >
                  <Edit3 aria-hidden="true" size={20} />
                  Edit
                </Button>
              </div>
            </div>
          </header>
        ) : null}

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
    <section className="overflow-hidden rounded-3xl border border-tt-oxblood/25 bg-tt-oxblood-soft/25">
      <div className="px-5 py-5 sm:px-7">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-tt-oxblood">
          Danger Zone
        </p>
        <p className="mt-3 max-w-xl text-sm leading-6 text-tt-muted sm:text-base">
          Deleting this Story will permanently remove all Chapters and
          Characters. This cannot be undone.
        </p>
      </div>
      <div className="border-t border-tt-oxblood/20 bg-tt-paper/35 px-5 py-4 sm:px-7">
        <Button
          className="w-full border-0 bg-transparent text-base shadow-none hover:bg-tt-oxblood-soft/60 sm:min-h-12"
          disabled={isDeleting}
          onClick={onDelete}
          variant="danger"
        >
          <Trash2 aria-hidden="true" size={16} />
          {isDeleting ? 'Deleting...' : 'Delete Story'}
        </Button>
      </div>
    </section>
  )
}
