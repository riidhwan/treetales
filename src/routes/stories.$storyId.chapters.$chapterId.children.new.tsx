import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'

import { ChapterCreator } from '@/components/features/ChapterCreator'

export const Route = createFileRoute(
  '/stories/$storyId/chapters/$chapterId/children/new',
)({
  component: ChapterCreatorRoute,
})

function ChapterCreatorRoute() {
  const { chapterId, storyId } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })
  const router = useRouter()

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
      onGoBack={() => router.history.back()}
      onOpenDashboard={() =>
        void navigate({
          to: '/',
        })
      }
      parentChapterId={chapterId}
      storyId={storyId}
    />
  )
}
