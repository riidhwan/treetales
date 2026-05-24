import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import { commonCopy, storyDetailCopy } from '@/copy'
import type { useStoryCharacters } from '@/hooks/useStoryCharacters'

type CharacterController = ReturnType<typeof useStoryCharacters>

interface Props {
  readonly characterDialog: CharacterController
  readonly titleId: string
}

export function CharacterConfirmationDialog({
  characterDialog,
  titleId,
}: Props) {
  if (characterDialog.confirmationState.mode === 'discard-changes') {
    return (
      <ConfirmationDialog
        confirmLabel={storyDetailCopy.actions.discardChanges}
        message={storyDetailCopy.character.discardDialog.message}
        onCancel={characterDialog.cancelConfirmation}
        onConfirm={characterDialog.confirmDiscardChanges}
        title={storyDetailCopy.character.discardDialog.title}
        titleId={titleId}
        variant="danger"
      />
    )
  }

  if (characterDialog.confirmationState.mode === 'delete-character') {
    return (
      <ConfirmationDialog
        confirmLabel={
          characterDialog.isDeleting
            ? commonCopy.actions.deleting
            : storyDetailCopy.actions.deleteCharacter
        }
        isConfirming={characterDialog.isDeleting}
        message={storyDetailCopy.character.deleteDialog.message(
          characterDialog.confirmationState.character.name,
        )}
        onCancel={characterDialog.cancelConfirmation}
        onConfirm={() => void characterDialog.confirmDeleteSelectedCharacter()}
        title={storyDetailCopy.character.deleteDialog.title}
        titleId={titleId}
        variant="danger"
      />
    )
  }

  return null
}
