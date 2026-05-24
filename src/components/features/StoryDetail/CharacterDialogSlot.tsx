import { CharacterDialog } from '@/components/features/StoryDetail/CharacterDialog'
import type { useStoryCharacters } from '@/hooks/useStoryCharacters'

type CharacterController = ReturnType<typeof useStoryCharacters>

interface Props {
  readonly characterDialog: CharacterController
  readonly titleId: string
}

export function CharacterDialogSlot({ characterDialog, titleId }: Props) {
  if (characterDialog.dialogState.mode === 'closed') {
    return null
  }

  return (
    <CharacterDialog
      dialogState={characterDialog.dialogState}
      draft={characterDialog.draft}
      errorMessage={characterDialog.errorMessage}
      isDeleting={characterDialog.isDeleting}
      isSaving={characterDialog.isSaving}
      onAddProperty={characterDialog.addProperty}
      onClose={characterDialog.requestCloseDialog}
      onDelete={characterDialog.requestDeleteSelectedCharacter}
      onEdit={characterDialog.openEditDialog}
      onGenderChange={characterDialog.setGender}
      onMoveProperty={characterDialog.moveProperty}
      onNameChange={characterDialog.setName}
      onPropertyChange={characterDialog.updateProperty}
      onRemoveProperty={characterDialog.removeProperty}
      onSave={() => void characterDialog.saveCharacter()}
      titleId={titleId}
    />
  )
}
