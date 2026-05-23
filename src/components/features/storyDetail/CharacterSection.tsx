import { Plus } from 'lucide-react'

import { CharacterCard } from '@/components/features/storyDetail/CharacterCard'
import { CharacterDialog } from '@/components/features/storyDetail/CharacterDialog'
import type { useStoryCharacters } from '@/hooks/useStoryCharacters'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

type CharacterController = ReturnType<typeof useStoryCharacters>

interface Props {
  readonly characterDialog: CharacterController
  readonly titleId: string
}

export function CharacterSection({ characterDialog, titleId }: Props) {
  let charactersContent: React.ReactNode

  if (characterDialog.isLoading) {
    charactersContent = <Alert className="mt-5">Loading characters...</Alert>
  } else if (characterDialog.characters.length === 0) {
    charactersContent = (
      <div className="mt-5 rounded-lg border border-dashed border-border-subtle bg-surface-paper-deep/40 p-6 text-center">
        <h3 className="text-lg font-semibold">No characters yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
          Add character cards for the people in this story.
        </p>
      </div>
    )
  } else {
    charactersContent = (
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

  return (
    <>
      <section className="border-b border-border-subtle pb-9">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-action-primary">
              Characters
            </p>
          </div>
          <Button
            aria-label="Add Character"
            className="rounded-full px-5"
            onClick={characterDialog.openCreateDialog}
            variant="primary"
          >
            <Plus aria-hidden="true" size={18} />
            Add
          </Button>
        </div>

        {characterDialog.errorMessage &&
        characterDialog.dialogState.mode === 'closed' ? (
          <Alert className="mt-5" role="alert" variant="error">
            {characterDialog.errorMessage}
          </Alert>
        ) : null}

        {charactersContent}
      </section>

      {characterDialog.dialogState.mode !== 'closed' ? (
        <CharacterDialog
          dialogState={characterDialog.dialogState}
          draft={characterDialog.draft}
          errorMessage={characterDialog.errorMessage}
          isDeleting={characterDialog.isDeleting}
          isSaving={characterDialog.isSaving}
          onAddProperty={characterDialog.addProperty}
          onClose={characterDialog.requestCloseDialog}
          onDelete={() => void characterDialog.deleteSelectedCharacter()}
          onEdit={characterDialog.openEditDialog}
          onGenderChange={characterDialog.setGender}
          onMoveProperty={characterDialog.moveProperty}
          onNameChange={characterDialog.setName}
          onPropertyChange={characterDialog.updateProperty}
          onRemoveProperty={characterDialog.removeProperty}
          onSave={() => void characterDialog.saveCharacter()}
          titleId={titleId}
        />
      ) : null}
    </>
  )
}
