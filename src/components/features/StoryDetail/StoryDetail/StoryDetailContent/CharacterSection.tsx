import { Plus } from 'lucide-react'

import type { useStoryCharacters } from '@/hooks/useStoryCharacters'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { storyDetailCopy } from '@/copy'

import { CharacterListContent } from './CharacterSection/CharacterListContent'

type CharacterController = ReturnType<typeof useStoryCharacters>

interface Props {
  readonly characterDialog: CharacterController
  readonly onAddCharacter: () => void
  readonly onOpenCharacter: (characterId: string) => void
}

export function CharacterSection({
  characterDialog,
  onAddCharacter,
  onOpenCharacter,
}: Props) {
  return (
    <section className="border-b border-border-subtle pb-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-action-primary">
            {storyDetailCopy.character.heading}
          </p>
        </div>
        <Button
          aria-label={storyDetailCopy.actions.addCharacter}
          className="rounded-full px-4"
          onClick={onAddCharacter}
          variant="primary"
        >
          <Plus aria-hidden="true" size={16} />
          {storyDetailCopy.storySummary.add}
        </Button>
      </div>

      {characterDialog.errorMessage ? (
        <Alert className="mt-5" role="alert" variant="error">
          {characterDialog.errorMessage}
        </Alert>
      ) : null}

      <CharacterListContent
        characterDialog={characterDialog}
        onOpenCharacter={onOpenCharacter}
      />
    </section>
  )
}
