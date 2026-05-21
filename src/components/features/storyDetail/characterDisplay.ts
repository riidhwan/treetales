import type { CharacterDialogState } from '@/hooks/useStoryCharacters'
import type { CharacterGender } from '@/services/types'

export function formatGender(gender: CharacterGender): string {
  return gender === 'female' ? 'Female' : 'Male'
}

export function getCharacterDialogTitle(
  dialogState: Exclude<CharacterDialogState, { mode: 'closed' }>,
): string {
  if (dialogState.mode === 'create') {
    return 'Add Character'
  }

  if (dialogState.mode === 'edit') {
    return `Edit ${dialogState.character.name}`
  }

  return dialogState.character.name
}
