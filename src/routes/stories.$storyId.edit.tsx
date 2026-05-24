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
      onOpenDashboard={() =>
        void navigate({
          to: '/',
        })
      }
      onOpenStory={(selectedStoryId) =>
        void navigate({
          to: '/stories/$storyId',
          params: { storyId: selectedStoryId },
        })
      }
      storyId={storyId}
    />
  )
}
