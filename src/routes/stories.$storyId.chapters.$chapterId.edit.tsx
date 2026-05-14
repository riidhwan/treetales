import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { ChapterEditor } from '@/components/features/ChapterEditor'

export const Route = createFileRoute(
  '/stories/$storyId/chapters/$chapterId/edit',
)({
  component: ChapterEditorRoute,
})

function ChapterEditorRoute() {
  const { chapterId, storyId } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <ChapterEditor
      chapterId={chapterId}
      onOpenDashboard={() =>
        void navigate({
          to: '/',
        })
      }
      onOpenStoryEditor={(selectedStoryId) =>
        void navigate({
          to: '/stories/$storyId/edit',
          params: { storyId: selectedStoryId },
        })
      }
      storyId={storyId}
    />
  )
}
