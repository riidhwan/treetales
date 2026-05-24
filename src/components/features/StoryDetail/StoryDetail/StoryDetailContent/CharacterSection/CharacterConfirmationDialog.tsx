import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
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
        confirmLabel="Discard Changes"
        message="Discard unsaved character changes?"
        onCancel={characterDialog.cancelConfirmation}
        onConfirm={characterDialog.confirmDiscardChanges}
        title="Discard Character Changes?"
        titleId={titleId}
        variant="danger"
      />
    )
  }

  if (characterDialog.confirmationState.mode === 'delete-character') {
    return (
      <ConfirmationDialog
        confirmLabel={
          characterDialog.isDeleting ? 'Deleting...' : 'Delete Character'
        }
        isConfirming={characterDialog.isDeleting}
        message={`Delete "${characterDialog.confirmationState.character.name}"? This cannot be undone.`}
        onCancel={characterDialog.cancelConfirmation}
        onConfirm={() => void characterDialog.confirmDeleteSelectedCharacter()}
        title="Delete Character?"
        titleId={titleId}
        variant="danger"
      />
    )
  }

  return null
}
