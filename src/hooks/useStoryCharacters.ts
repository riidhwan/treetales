import { useEffect, useMemo, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import {
  createCharacter,
  deleteCharacter,
  getCharactersByStoryId,
  updateCharacter,
} from '@/services/characterService'
import type {
  Character,
  CharacterGender,
  CharacterProperty,
  CreateCharacterInput,
  UpdateCharacterInput,
} from '@/services/types'

interface CharacterPropertyDraft {
  readonly id: string
  readonly key: string
  readonly value: string
}

export interface CharacterFormDraft {
  readonly gender: CharacterGender
  readonly name: string
  readonly properties: CharacterPropertyDraft[]
}

export type CharacterDialogState =
  | { readonly mode: 'closed' }
  | { readonly character: Character; readonly mode: 'view' }
  | { readonly mode: 'create' }
  | { readonly character: Character; readonly mode: 'edit' }

export type CharacterConfirmationState =
  | { readonly mode: 'closed' }
  | { readonly mode: 'discard-changes' }
  | { readonly character: Character; readonly mode: 'delete-character' }

export interface StoryCharacterServices {
  readonly createCharacter: (input: CreateCharacterInput) => Promise<Character>
  readonly deleteCharacter: (id: string) => Promise<boolean>
  readonly getCharactersByStoryId: (storyId: string) => Promise<Character[]>
  readonly updateCharacter: (
    id: string,
    input: UpdateCharacterInput,
  ) => Promise<Character | undefined>
}

export const DEFAULT_STORY_CHARACTER_SERVICES: StoryCharacterServices = {
  createCharacter,
  deleteCharacter,
  getCharactersByStoryId,
  updateCharacter,
}

interface UseStoryCharactersOptions {
  readonly enabled: boolean
  readonly services?: StoryCharacterServices
  readonly storyId: string
}

export function useStoryCharacters({
  enabled,
  services = DEFAULT_STORY_CHARACTER_SERVICES,
  storyId,
}: UseStoryCharactersOptions) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [dialogState, setDialogState] = useState<CharacterDialogState>({
    mode: 'closed',
  })
  const [confirmationState, setConfirmationState] =
    useState<CharacterConfirmationState>({
      mode: 'closed',
    })
  const [draft, setDraft] = useState<CharacterFormDraft>(createEmptyDraft())
  const [savedDraft, setSavedDraft] = useState<CharacterFormDraft>(
    createEmptyDraft(),
  )

  const isEditing =
    dialogState.mode === 'create' || dialogState.mode === 'edit'
  const hasUnsavedChanges = useMemo(
    () => isEditing && serializeDraft(draft) !== serializeDraft(savedDraft),
    [draft, isEditing, savedDraft],
  )

  useEffect(() => {
    if (!enabled) {
      setCharacters([])
      setIsLoading(false)
      setErrorMessage(undefined)
      closeDialogWithoutConfirmation()
      return
    }

    let isCurrent = true

    async function loadCharacters() {
      setIsLoading(true)
      setErrorMessage(undefined)

      try {
        const loadedCharacters = await services.getCharactersByStoryId(storyId)

        if (isCurrent) {
          setCharacters(loadedCharacters)
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error))
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadCharacters()

    return () => {
      isCurrent = false
    }
  }, [enabled, services, storyId])

  function openCreateDialog() {
    const nextDraft = createEmptyDraft()
    setDraft(nextDraft)
    setSavedDraft(nextDraft)
    setErrorMessage(undefined)
    setDialogState({ mode: 'create' })
  }

  function openViewDialog(character: Character) {
    setErrorMessage(undefined)
    setDialogState({ character, mode: 'view' })
  }

  function openEditDialog(character: Character) {
    const nextDraft = createDraftFromCharacter(character)
    setDraft(nextDraft)
    setSavedDraft(nextDraft)
    setErrorMessage(undefined)
    setDialogState({ character, mode: 'edit' })
  }

  function requestCloseDialog() {
    if (hasUnsavedChanges) {
      setConfirmationState({ mode: 'discard-changes' })
      return
    }

    closeDialogWithoutConfirmation()
  }

  function closeDialogWithoutConfirmation() {
    setConfirmationState({ mode: 'closed' })
    setDialogState({ mode: 'closed' })
  }

  function cancelConfirmation() {
    setConfirmationState({ mode: 'closed' })
  }

  function confirmDiscardChanges() {
    closeDialogWithoutConfirmation()
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
        createPropertyDraft({ key: '', value: '' }),
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

  async function saveCharacter() {
    if (!isEditing || !canSaveDraft(draft)) {
      return
    }

    setIsSaving(true)
    setErrorMessage(undefined)

    try {
      const input = createCharacterInput(storyId, draft)

      if (dialogState.mode === 'create') {
        const createdCharacter = await services.createCharacter(input)
        setCharacters((currentCharacters) => [
          ...currentCharacters,
          createdCharacter,
        ])
        setDialogState({ character: createdCharacter, mode: 'view' })
        return
      }

      const updatedCharacter = await services.updateCharacter(
        dialogState.character.id,
        input,
      )

      if (!updatedCharacter) {
        setErrorMessage('Character could not be found.')
        return
      }

      setCharacters((currentCharacters) =>
        currentCharacters.map((character) =>
          character.id === updatedCharacter.id ? updatedCharacter : character,
        ),
      )
      setDialogState({ character: updatedCharacter, mode: 'view' })
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  function requestDeleteSelectedCharacter() {
    if (dialogState.mode === 'closed' || dialogState.mode === 'create') {
      return
    }

    setConfirmationState({
      character: dialogState.character,
      mode: 'delete-character',
    })
  }

  async function confirmDeleteSelectedCharacter() {
    if (
      confirmationState.mode !== 'delete-character' ||
      dialogState.mode === 'create'
    ) {
      return
    }

    const characterToDelete = confirmationState.character

    setIsDeleting(true)
    setErrorMessage(undefined)

    try {
      const wasDeleted = await services.deleteCharacter(characterToDelete.id)

      if (!wasDeleted) {
        setErrorMessage('Character could not be found.')
        setConfirmationState({ mode: 'closed' })
        return
      }

      setCharacters((currentCharacters) =>
        currentCharacters.filter(
          (character) => character.id !== characterToDelete.id,
        ),
      )
      setConfirmationState({ mode: 'closed' })
      setDialogState({ mode: 'closed' })
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    addProperty,
    cancelConfirmation,
    characters,
    confirmDeleteSelectedCharacter,
    confirmDiscardChanges,
    confirmationState,
    dialogState,
    draft,
    errorMessage,
    hasUnsavedChanges,
    isDeleting,
    isLoading,
    isSaving,
    moveProperty,
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    requestDeleteSelectedCharacter,
    removeProperty,
    requestCloseDialog,
    saveCharacter,
    setGender,
    setName,
    updateProperty,
  }
}

function createEmptyDraft(): CharacterFormDraft {
  return {
    gender: 'female',
    name: '',
    properties: [],
  }
}

function createDraftFromCharacter(character: Character): CharacterFormDraft {
  return {
    gender: character.gender,
    name: character.name,
    properties: character.properties.map((property) =>
      createPropertyDraft(property),
    ),
  }
}

function createPropertyDraft(
  property: CharacterProperty,
): CharacterPropertyDraft {
  return {
    id: crypto.randomUUID(),
    key: property.key,
    value: property.value,
  }
}

function createCharacterInput(
  storyId: string,
  draft: CharacterFormDraft,
): CreateCharacterInput {
  return {
    storyId,
    name: draft.name.trim(),
    gender: draft.gender,
    properties: normalizeDraftProperties(draft.properties),
  }
}

function normalizeDraftProperties(
  properties: readonly CharacterPropertyDraft[],
): CharacterProperty[] {
  return properties
    .map((property) => ({
      key: property.key.trim(),
      value: property.value.trim(),
    }))
    .filter((property) => property.key.length > 0)
}

function canSaveDraft(draft: CharacterFormDraft): boolean {
  return draft.name.trim().length > 0
}

function serializeDraft(draft: CharacterFormDraft): string {
  return JSON.stringify({
    gender: draft.gender,
    name: draft.name,
    properties: draft.properties.map((property) => ({
      key: property.key,
      value: property.value,
    })),
  })
}
