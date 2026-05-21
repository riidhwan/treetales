import { Edit3, Save, Trash2, X } from 'lucide-react'

import { CharacterDetails } from '@/components/features/storyDetail/CharacterDetails'
import { CharacterForm } from '@/components/features/storyDetail/CharacterForm'
import { getCharacterDialogTitle } from '@/components/features/storyDetail/characterDisplay'
import type {
  CharacterDialogState,
  CharacterFormDraft,
} from '@/hooks/useStoryCharacters'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import type { Character, CharacterGender } from '@/services/types'

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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-tt-ink/45 px-4 py-6">
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-tt-line bg-tt-paper p-5 shadow-xl sm:p-6"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
              Character
            </p>
            <h2 className="mt-1 text-2xl font-bold" id={titleId}>
              {title}
            </h2>
          </div>
          <Button aria-label="Close character dialog" onClick={onClose} size="sm">
            <X aria-hidden="true" size={16} />
          </Button>
        </div>

        {errorMessage ? (
          <Alert className="mt-5" role="alert" variant="error">
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

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {dialogState.mode === 'view' ? (
            <>
              <Button onClick={() => onEdit(dialogState.character)}>
                <Edit3 aria-hidden="true" size={18} />
                Edit
              </Button>
              <Button disabled={isDeleting} onClick={onDelete} variant="danger">
                <Trash2 aria-hidden="true" size={18} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          ) : null}
          {isForm ? (
            <>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                disabled={draft.name.trim().length === 0 || isSaving}
                onClick={onSave}
                variant="primary"
              >
                <Save aria-hidden="true" size={18} />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}
