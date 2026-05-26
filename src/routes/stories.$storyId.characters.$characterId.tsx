import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { CharacterDetail } from '@/components/features/CharacterDetail'

export const Route = createFileRoute('/stories/$storyId/characters/$characterId')({
  component: CharacterDetailRoute,
})

function CharacterDetailRoute() {
  const { characterId, storyId } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <CharacterDetail
      characterId={characterId}
      onBackToStory={(selectedStoryId) =>
        void navigate({
          to: '/stories/$storyId',
          params: { storyId: selectedStoryId },
        })
      }
      storyId={storyId}
    />
  )
}
