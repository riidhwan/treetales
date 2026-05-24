import type { CharacterDialogState } from '@/hooks/useStoryCharacters'
import { commonCopy, storyDetailCopy } from '@/copy'
import type { CharacterGender } from '@/services/types'

export function formatGender(gender: CharacterGender): string {
  return gender === 'female'
    ? storyDetailCopy.character.gender.female
    : storyDetailCopy.character.gender.male
}

export function getCharacterDialogTitle(
  dialogState: Exclude<CharacterDialogState, { mode: 'closed' }>,
): string {
  if (dialogState.mode === 'create') {
    return storyDetailCopy.actions.addCharacter
  }

  if (dialogState.mode === 'edit') {
    return `${commonCopy.actions.edit} ${dialogState.character.name}`
  }

  return dialogState.character.name
}
