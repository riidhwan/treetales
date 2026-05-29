import { useMemo, useState } from 'react'

import type {
  Character,
  CharacterGender,
  CharacterProperty,
  CreateCharacterInput,
  UpdateCharacterInput,
} from '@/services/types'

export interface CharacterPropertyDraft {
  readonly id: string
  readonly key: string
  readonly value: string
}

export interface CharacterFormDraft {
  readonly gender: CharacterGender
  readonly name: string
  readonly properties: CharacterPropertyDraft[]
}

interface UseCharacterFormOptions {
  readonly isActive: boolean
}

export function useCharacterForm({ isActive }: UseCharacterFormOptions) {
  const [draft, setDraft] = useState<CharacterFormDraft>(
    createEmptyCharacterDraft(),
  )
  const [savedDraft, setSavedDraft] = useState<CharacterFormDraft>(
    createEmptyCharacterDraft(),
  )

  const hasUnsavedChanges = useMemo(
    () =>
      isActive &&
      serializeCharacterDraft(draft) !== serializeCharacterDraft(savedDraft),
    [draft, isActive, savedDraft],
  )

  const canSave = canSaveCharacterDraft(draft)

  function resetDraft(nextDraft: CharacterFormDraft) {
    setDraft(nextDraft)
    setSavedDraft(nextDraft)
  }

  function setName(name: string) {
    setDraft((currentDraft) => ({ ...currentDraft, name }))
  }

  function setGender(gender: CharacterGender) {
    setDraft((currentDraft) => ({ ...currentDraft, gender }))
  }

  function addProperty() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      properties: [
        ...currentDraft.properties,
        createCharacterPropertyDraft({ key: '', value: '' }),
      ],
    }))
  }

  function updateProperty(
    propertyId: string,
    input: Partial<Pick<CharacterPropertyDraft, 'key' | 'value'>>,
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      properties: currentDraft.properties.map((property) =>
        property.id === propertyId ? { ...property, ...input } : property,
      ),
    }))
  }

  function removeProperty(propertyId: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      properties: currentDraft.properties.filter(
        (property) => property.id !== propertyId,
      ),
    }))
  }

  function moveProperty(propertyId: string, direction: -1 | 1) {
    setDraft((currentDraft) => {
      const currentIndex = currentDraft.properties.findIndex(
        (property) => property.id === propertyId,
      )
      const nextIndex = currentIndex + direction

      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= currentDraft.properties.length
      ) {
        return currentDraft
      }

      const nextProperties = [...currentDraft.properties]
      const [property] = nextProperties.splice(currentIndex, 1)
      nextProperties.splice(nextIndex, 0, property)

      return {
        ...currentDraft,
        properties: nextProperties,
      }
    })
  }

  return {
    addProperty,
    canSave,
    draft,
    hasUnsavedChanges,
    moveProperty,
    removeProperty,
    resetDraft,
    setGender,
    setName,
    updateProperty,
  }
}

export function createEmptyCharacterDraft(): CharacterFormDraft {
  return {
    gender: 'female',
    name: '',
    properties: [],
  }
}

export function createCharacterDraftFromCharacter(
  character: Character,
): CharacterFormDraft {
  return {
    gender: character.gender,
    name: character.name,
    properties: character.properties.map((property) =>
      createCharacterPropertyDraft(property),
    ),
  }
}

export function createCharacterCreateInput(
  storyId: string,
  draft: CharacterFormDraft,
): CreateCharacterInput {
  return {
    storyId,
    name: draft.name.trim(),
    gender: draft.gender,
    properties: normalizeCharacterDraftProperties(draft.properties),
  }
}

export function createCharacterUpdateInput(
  draft: CharacterFormDraft,
): UpdateCharacterInput {
  return {
    name: draft.name.trim(),
    gender: draft.gender,
    properties: normalizeCharacterDraftProperties(draft.properties),
  }
}

export function canSaveCharacterDraft(draft: CharacterFormDraft): boolean {
  return draft.name.trim().length > 0
}

function createCharacterPropertyDraft(
  property: CharacterProperty,
): CharacterPropertyDraft {
  return {
    id: crypto.randomUUID(),
    key: property.key,
    value: property.value,
  }
}

function normalizeCharacterDraftProperties(
  properties: readonly CharacterPropertyDraft[],
): CharacterProperty[] {
  return properties
    .map((property) => ({
      key: property.key.trim(),
      value: property.value.trim(),
    }))
    .filter((property) => property.key.length > 0)
}

function serializeCharacterDraft(draft: CharacterFormDraft): string {
  return JSON.stringify({
    gender: draft.gender,
    name: draft.name,
    properties: draft.properties.map((property) => ({
      key: property.key,
      value: property.value,
    })),
  })
}
