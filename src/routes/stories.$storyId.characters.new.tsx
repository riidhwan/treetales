import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { CharacterCreator } from '@/components/features/CharacterCreator'

export const Route = createFileRoute('/stories/$storyId/characters/new')({
  component: CharacterCreatorRoute,
})

function CharacterCreatorRoute() {
  const { storyId } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <CharacterCreator
      onBackToStory={(selectedStoryId) =>
        void navigate({
          to: '/stories/$storyId',
          params: { storyId: selectedStoryId },
        })
      }
      onCreated={(selectedStoryId, selectedCharacterId) =>
        void navigate({
          to: '/stories/$storyId/characters/$characterId',
          params: {
            characterId: selectedCharacterId,
            storyId: selectedStoryId,
          },
        })
      }
      storyId={storyId}
    />
  )
}
