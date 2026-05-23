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
          to: '/stories/$storyId/read',
          params: {
            storyId: selectedStoryId,
          },
          search: { chapterId: selectedChapterId },
        })
      }
      onGoBack={() =>
        void navigate({
          to: '/stories/$storyId/read',
          params: { storyId },
          search: { chapterId: undefined },
        })
      }
      onOpenDashboard={() =>
        void navigate({
          to: '/',
        })
      }
      storyId={storyId}
    />
  )
}
