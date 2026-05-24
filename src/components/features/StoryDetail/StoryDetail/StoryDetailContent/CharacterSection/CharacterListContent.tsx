import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import { storyDetailCopy } from '@/copy'
import type { useStoryCharacters } from '@/hooks/useStoryCharacters'

import { CharacterCard } from './CharacterCard'

type CharacterController = ReturnType<typeof useStoryCharacters>

interface Props {
  readonly characterDialog: CharacterController
}

export function CharacterListContent({ characterDialog }: Props) {
  if (characterDialog.isLoading) {
    return <Alert className="mt-4">{storyDetailCopy.character.loading}</Alert>
  }

  if (characterDialog.characters.length === 0) {
    return (
      <EmptyState
        as="div"
        className="mt-4"
        description={storyDetailCopy.character.empty.body}
        descriptionClassName="mx-auto mt-2 max-w-md"
        headingLevel={3}
        title={storyDetailCopy.character.empty.title}
        variant="dashed"
      />
    )
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {characterDialog.characters.map((character) => (
        <CharacterCard
          character={character}
          key={character.id}
          onOpen={characterDialog.openViewDialog}
        />
      ))}
    </div>
  )
}
