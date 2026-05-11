import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stories/$storyId/edit')({
  component: StoryEditorRoute,
})

function StoryEditorRoute() {
  const { storyId } = Route.useParams()

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-stone-950">
      <section className="mx-auto max-w-3xl rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Story editor
        </p>
        <h1 className="mt-2 text-3xl font-bold">Editor workspace</h1>
        <p className="mt-4 text-sm leading-6 text-stone-600">
          Story {storyId} is ready for the editor flow.
        </p>
      </section>
    </main>
  )
}
