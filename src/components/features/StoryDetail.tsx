import { BookOpen, Edit3, Home, Trash2 } from 'lucide-react'

import {
  type StoryDetailServices,
  useStoryDetail,
} from '@/hooks/useStoryDetail'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

interface Props {
  readonly onDeleted: () => void
  readonly onEditStory: (storyId: string) => void
  readonly onOpenDashboard: () => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryDetailServices
  readonly storyId: string
}

export function StoryDetail({
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

  let detailContent: React.ReactNode

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
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
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

        <article className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Story
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {story.title || 'Untitled story'}
          </h1>
          <p className="mt-4 text-sm leading-6 text-stone-600 sm:text-base">
            {story.description || 'No description yet.'}
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <Button onClick={() => onReadStory(story.id)} variant="primary">
              <BookOpen aria-hidden="true" size={18} />
              Read
            </Button>
            <Button onClick={() => onEditStory(story.id)}>
              <Edit3 aria-hidden="true" size={18} />
              Edit
            </Button>
            <Button
              disabled={isDeleting}
              onClick={() => void deleteStoryWithConfirmation()}
              variant="danger"
            >
              <Trash2 aria-hidden="true" size={18} />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </article>
      </>
    )
  } else {
    detailContent = null
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
        <nav
          aria-label="Story detail actions"
          className="flex flex-wrap justify-between gap-3"
        >
          <Button onClick={onOpenDashboard} size="sm">
            <Home aria-hidden="true" size={16} />
            Dashboard
          </Button>
        </nav>

        {detailContent}
      </section>
    </main>
  )
}
