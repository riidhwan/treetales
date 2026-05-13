import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { StoryEditor } from '@/components/features/StoryEditor'

export const Route = createFileRoute('/stories/$storyId/edit')({
  component: StoryEditorRoute,
})

function StoryEditorRoute() {
  const { storyId } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <StoryEditor
      onEditChapter={(selectedStoryId, selectedChapterId) =>
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
      onReadStory={(selectedStoryId) =>
        void navigate({
          to: '/stories/$storyId/read',
          params: { storyId: selectedStoryId },
          search: { chapterId: undefined },
        })
      }
      storyId={storyId}
    />
  )
}
