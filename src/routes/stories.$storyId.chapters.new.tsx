import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { ChapterCreator } from '@/components/features/ChapterCreator'

export const Route = createFileRoute('/stories/$storyId/chapters/new')({
  component: IntroChapterCreatorRoute,
})

function IntroChapterCreatorRoute() {
  const { storyId } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <ChapterCreator
      onChapterCreated={(selectedStoryId, selectedChapterId) =>
        void navigate({
          to: '/stories/$storyId/chapters/$chapterId/edit',
          params: {
            chapterId: selectedChapterId,
            storyId: selectedStoryId,
          },
        })
      }
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
