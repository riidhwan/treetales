import { storyDetailCopy } from '@/copy'
import type { CharacterGender } from '@/services/types'

export function formatGender(gender: CharacterGender): string {
  return gender === 'female'
    ? storyDetailCopy.character.gender.female
    : storyDetailCopy.character.gender.male
}
