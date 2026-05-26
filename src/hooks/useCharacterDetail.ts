import { useEffect, useMemo, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import {
  deleteCharacter,
  getCharacterById,
  updateCharacter,
} from '@/services/characterService'
import { getStoryById } from '@/services/storyService'
import type {
  Character,
  CharacterGender,
  CharacterProperty,
  Story,
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

type CharacterDetailStatus =
  | 'error'
  | 'loading'
  | 'missing-character'
  | 'missing-story'
  | 'ready'

type CharacterDetailConfirmationState =
  | { readonly mode: 'closed' }
  | { readonly mode: 'delete-character' }
  | { readonly mode: 'discard-changes' }

export interface CharacterDetailServices {
  readonly deleteCharacter: (id: string) => Promise<boolean>
  readonly getCharacterById: (id: string) => Promise<Character | undefined>
  readonly getStoryById: (id: string) => Promise<Story | undefined>
  readonly updateCharacter: (
    id: string,
    input: UpdateCharacterInput,
  ) => Promise<Character | undefined>
}

export const DEFAULT_CHARACTER_DETAIL_SERVICES: CharacterDetailServices = {
  deleteCharacter,
  getCharacterById,
  getStoryById,
  updateCharacter,
}

interface UseCharacterDetailOptions {
  readonly characterId: string
  readonly onDeleted: () => void
  readonly services?: CharacterDetailServices
  readonly storyId: string
}

export function useCharacterDetail({
  characterId,
  onDeleted,
  services = DEFAULT_CHARACTER_DETAIL_SERVICES,
  storyId,
}: UseCharacterDetailOptions) {
  const [status, setStatus] = useState<CharacterDetailStatus>('loading')
  const [story, setStory] = useState<Story | undefined>()
  const [character, setCharacter] = useState<Character | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmationState, setConfirmationState] =
    useState<CharacterDetailConfirmationState>({ mode: 'closed' })
  const [draft, setDraft] = useState<CharacterFormDraft>(createEmptyDraft())
  const [savedDraft, setSavedDraft] = useState<CharacterFormDraft>(
    createEmptyDraft(),
  )

  const hasUnsavedChanges = useMemo(
    () => isEditing && serializeDraft(draft) !== serializeDraft(savedDraft),
    [draft, isEditing, savedDraft],
  )

  useEffect(() => {
    let isCurrent = true

    async function loadCharacterDetail() {
      setStatus('loading')
      setErrorMessage(undefined)
      setStory(undefined)
      setCharacter(undefined)
      setIsEditing(false)
      setConfirmationState({ mode: 'closed' })

      try {
        const loadedStory = await services.getStoryById(storyId)

        if (!isCurrent) {
          return
        }

        if (!loadedStory) {
          setStatus('missing-story')
          return
        }

        const loadedCharacter = await services.getCharacterById(characterId)

        if (!isCurrent) {
          return
        }

        if (!loadedCharacter || loadedCharacter.storyId !== storyId) {
          setStory(loadedStory)
          setStatus('missing-character')
          return
        }

        const nextDraft = createDraftFromCharacter(loadedCharacter)
        setStory(loadedStory)
        setCharacter(loadedCharacter)
        setDraft(nextDraft)
        setSavedDraft(nextDraft)
        setStatus('ready')
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error))
          setStatus('error')
        }
      }
    }

    void loadCharacterDetail()

    return () => {
      isCurrent = false
    }
  }, [characterId, services, storyId])

  function beginEdit() {
    if (!character) {
      return
    }

    const nextDraft = createDraftFromCharacter(character)
    setDraft(nextDraft)
    setSavedDraft(nextDraft)
    setErrorMessage(undefined)
    setIsEditing(true)
  }

  function requestCancelEdit() {
    if (hasUnsavedChanges) {
      setConfirmationState({ mode: 'discard-changes' })
      return
    }

    cancelEditWithoutConfirmation()
  }

  function cancelEditWithoutConfirmation() {
    if (character) {
      const nextDraft = createDraftFromCharacter(character)
      setDraft(nextDraft)
      setSavedDraft(nextDraft)
    }

    setConfirmationState({ mode: 'closed' })
    setIsEditing(false)
  }

  function cancelConfirmation() {
    setConfirmationState({ mode: 'closed' })
  }

  function confirmDiscardChanges() {
    cancelEditWithoutConfirmation()
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
    if (!isEditing || !character || !canSaveDraft(draft)) {
      return
    }

    setIsSaving(true)
    setErrorMessage(undefined)

    try {
      const updatedCharacter = await services.updateCharacter(
        character.id,
        createCharacterInput(draft),
      )

      if (!updatedCharacter || updatedCharacter.storyId !== storyId) {
        setStatus('missing-character')
        return
      }

      const nextDraft = createDraftFromCharacter(updatedCharacter)
      setCharacter(updatedCharacter)
      setDraft(nextDraft)
      setSavedDraft(nextDraft)
      setIsEditing(false)
      setStatus('ready')
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  function requestDeleteCharacter() {
    if (character) {
      setConfirmationState({ mode: 'delete-character' })
    }
  }

  async function confirmDeleteCharacter() {
    if (!character || confirmationState.mode !== 'delete-character') {
      return
    }

    setIsDeleting(true)
    setErrorMessage(undefined)

    try {
      const wasDeleted = await services.deleteCharacter(character.id)

      if (!wasDeleted) {
        setStatus('missing-character')
        setConfirmationState({ mode: 'closed' })
        return
      }

      onDeleted()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    addProperty,
    beginEdit,
    cancelConfirmation,
    character,
    confirmDeleteCharacter,
    confirmDiscardChanges,
    confirmationState,
    draft,
    errorMessage,
    hasUnsavedChanges,
    isDeleting,
    isEditing,
    isSaving,
    moveProperty,
    removeProperty,
    requestCancelEdit,
    requestDeleteCharacter,
    saveCharacter,
    setGender,
    setName,
    status,
    story,
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
  draft: CharacterFormDraft,
): UpdateCharacterInput {
  return {
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
