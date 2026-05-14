import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'

import { ChapterEditor } from '@/components/features/ChapterEditor'

export const Route = createFileRoute(
  '/stories/$storyId/chapters/$chapterId/edit',
)({
  component: ChapterEditorRoute,
})

function ChapterEditorRoute() {
  const { chapterId, storyId } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })
  const router = useRouter()

  return (
    <ChapterEditor
      chapterId={chapterId}
      onGoBack={() => router.history.back()}
      onOpenDashboard={() =>
        void navigate({
          to: '/',
        })
      }
      storyId={storyId}
    />
  )
}
