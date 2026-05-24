import { Alert } from '@/components/ui/Alert'
import { storyDetailCopy } from '@/copy'
import type { useStoryCharacters } from '@/hooks/useStoryCharacters'

import { CharacterCard } from './CharacterCard'

type CharacterController = ReturnType<typeof useStoryCharacters>

interface Props {
  readonly characterDialog: CharacterController
}

export function CharacterListContent({ characterDialog }: Props) {
  if (characterDialog.isLoading) {
    return <Alert className="mt-5">{storyDetailCopy.character.loading}</Alert>
  }

  if (characterDialog.characters.length === 0) {
    return (
      <div className="mt-5 rounded-lg border border-dashed border-border-subtle bg-surface-paper-deep/40 p-6 text-center">
        <h3 className="text-lg font-semibold">
          {storyDetailCopy.character.empty.title}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
          {storyDetailCopy.character.empty.body}
        </p>
      </div>
    )
  }

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
