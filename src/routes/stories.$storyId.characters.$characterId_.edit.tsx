import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { CharacterEditor } from '@/components/features/CharacterEditor'

export const Route = createFileRoute(
  '/stories/$storyId/characters/$characterId_/edit',
)({
  component: CharacterEditorRoute,
})

function CharacterEditorRoute() {
  const { characterId, storyId } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <CharacterEditor
      characterId={characterId}
      onBackToCharacter={(selectedStoryId, selectedCharacterId) =>
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
