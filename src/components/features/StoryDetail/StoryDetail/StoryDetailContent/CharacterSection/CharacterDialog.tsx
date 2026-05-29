import { Edit3, Save, Trash2 } from 'lucide-react'

import { CharacterForm } from '@/components/features/shared/CharacterForm'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { commonCopy, storyDetailCopy } from '@/copy'
import type {
  CharacterDialogState,
  CharacterFormDraft,
} from '@/hooks/useStoryCharacters'
import type { Character, CharacterGender } from '@/services/types'

import { CharacterDetails } from './CharacterDetails'
import { getCharacterDialogTitle } from './characterDisplay'

interface Props {
  readonly dialogState: Exclude<CharacterDialogState, { mode: 'closed' }>
  readonly draft: CharacterFormDraft
  readonly errorMessage?: string
  readonly isDeleting: boolean
  readonly isSaving: boolean
  readonly onAddProperty: () => void
  readonly onClose: () => void
  readonly onDelete: () => void
  readonly onEdit: (character: Character) => void
  readonly onGenderChange: (gender: CharacterGender) => void
  readonly onMoveProperty: (propertyId: string, direction: -1 | 1) => void
  readonly onNameChange: (name: string) => void
  readonly onPropertyChange: (
    propertyId: string,
    input: Partial<{ key: string; value: string }>,
  ) => void
  readonly onRemoveProperty: (propertyId: string) => void
  readonly onSave: () => void
  readonly titleId: string
}

export function CharacterDialog({
  dialogState,
  draft,
  errorMessage,
  isDeleting,
  isSaving,
  onAddProperty,
  onClose,
  onDelete,
  onEdit,
  onGenderChange,
  onMoveProperty,
  onNameChange,
  onPropertyChange,
  onRemoveProperty,
  onSave,
  titleId,
}: Props) {
  const isForm = dialogState.mode === 'create' || dialogState.mode === 'edit'
  const title = getCharacterDialogTitle(dialogState)

  const footer = (
    <>
      {dialogState.mode === 'view' ? (
        <>
          <Button onClick={() => onEdit(dialogState.character)}>
            <Edit3 aria-hidden="true" size={18} />
            {commonCopy.actions.edit}
          </Button>
          <Button disabled={isDeleting} onClick={onDelete} variant="danger">
            <Trash2 aria-hidden="true" size={18} />
            {isDeleting ? commonCopy.actions.deleting : commonCopy.actions.delete}
          </Button>
        </>
      ) : null}
      {isForm ? (
        <>
          <Button onClick={onClose}>{commonCopy.actions.cancel}</Button>
          <Button
            disabled={draft.name.trim().length === 0 || isSaving}
            onClick={onSave}
            variant="primary"
          >
            <Save aria-hidden="true" size={18} />
            {isSaving ? commonCopy.actions.saving : commonCopy.actions.save}
          </Button>
        </>
      ) : null}
    </>
  )

  return (
    <Dialog
      closeLabel={storyDetailCopy.character.closeDialog}
      eyebrow={storyDetailCopy.character.eyebrow}
      footer={footer}
      onClose={onClose}
      title={title}
      titleId={titleId}
    >
      {errorMessage ? (
        <Alert className="mb-5" role="alert" variant="error">
          {errorMessage}
        </Alert>
      ) : null}

      {isForm ? (
        <CharacterForm
          draft={draft}
          isSaving={isSaving}
          onAddProperty={onAddProperty}
          onGenderChange={onGenderChange}
          onMoveProperty={onMoveProperty}
          onNameChange={onNameChange}
          onPropertyChange={onPropertyChange}
          onRemoveProperty={onRemoveProperty}
          onSave={onSave}
        />
      ) : (
        <CharacterDetails character={dialogState.character} />
      )}
    </Dialog>
  )
}
