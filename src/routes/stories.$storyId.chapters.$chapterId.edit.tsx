import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Home } from 'lucide-react'

import { Button } from '@/components/ui/Button'

export const Route = createFileRoute(
  '/stories/$storyId/chapters/$chapterId/edit',
)({
  component: ChapterEditorPlaceholderRoute,
})

function ChapterEditorPlaceholderRoute() {
  const { chapterId, storyId } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
        <nav
          aria-label="Chapter editor actions"
          className="flex flex-wrap justify-between gap-3"
        >
          <Button
            onClick={() =>
              void navigate({
                to: '/stories/$storyId/edit',
                params: { storyId },
              })
            }
            size="sm"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Story Editor
          </Button>
          <Button
            onClick={() =>
              void navigate({
                to: '/',
              })
            }
            size="sm"
          >
            <Home aria-hidden="true" size={16} />
            Dashboard
          </Button>
        </nav>

        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Chapter editor
          </p>
          <h1 className="mt-2 text-2xl font-bold">
            Chapter editing is coming next
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Chapter {chapterId} is ready to edit once title and content tools
            are added.
          </p>
        </section>
      </section>
    </main>
  )
}
