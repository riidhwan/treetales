import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { StoryDetail } from '@/components/features/StoryDetail'

export const Route = createFileRoute('/stories/$storyId/')({
  component: StoryDetailRoute,
})

function StoryDetailRoute() {
  const { storyId } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <StoryDetail
      onDeleted={() =>
        void navigate({
          to: '/',
        })
      }
      onEditStory={(selectedStoryId) =>
        void navigate({
          to: '/stories/$storyId/edit',
          params: { storyId: selectedStoryId },
        })
      }
      onAddCharacter={(selectedStoryId) =>
        void navigate({
          to: '/stories/$storyId/characters/new',
          params: { storyId: selectedStoryId },
        })
      }
      onOpenCharacter={(selectedStoryId, selectedCharacterId) =>
        void navigate({
          to: '/stories/$storyId/characters/$characterId',
          params: {
            characterId: selectedCharacterId,
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
