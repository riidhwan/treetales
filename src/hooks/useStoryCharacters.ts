import { useEffect, useState } from 'react'

import { storyDetailCopy } from '@/copy'
import {
  createCharacterCreateInput,
  createCharacterDraftFromCharacter,
  createEmptyCharacterDraft,
  useCharacterForm,
} from '@/hooks/useCharacterForm'
import { getErrorMessage } from '@/lib/errors'
import {
  createCharacter,
  deleteCharacter,
  getCharactersByStoryId,
  updateCharacter,
} from '@/services/characterService'
import type {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
} from '@/services/types'

export type { CharacterFormDraft } from '@/hooks/useCharacterForm'

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

  const isEditing =
    dialogState.mode === 'create' || dialogState.mode === 'edit'
  const characterForm = useCharacterForm({ isActive: isEditing })

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
    const nextDraft = createEmptyCharacterDraft()
    characterForm.resetDraft(nextDraft)
    setErrorMessage(undefined)
    setDialogState({ mode: 'create' })
  }

  function openViewDialog(character: Character) {
    setErrorMessage(undefined)
    setDialogState({ character, mode: 'view' })
  }

  function openEditDialog(character: Character) {
    const nextDraft = createCharacterDraftFromCharacter(character)
    characterForm.resetDraft(nextDraft)
    setErrorMessage(undefined)
    setDialogState({ character, mode: 'edit' })
  }

  function requestCloseDialog() {
    if (characterForm.hasUnsavedChanges) {
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

  async function saveCharacter() {
    if (!isEditing || !characterForm.canSave) {
      return
    }

    setIsSaving(true)
    setErrorMessage(undefined)

    try {
      const input = createCharacterCreateInput(storyId, characterForm.draft)

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
        setErrorMessage(storyDetailCopy.character.missing)
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
        setErrorMessage(storyDetailCopy.character.missing)
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
    addProperty: characterForm.addProperty,
    cancelConfirmation,
    characters,
    confirmDeleteSelectedCharacter,
    confirmDiscardChanges,
    confirmationState,
    dialogState,
    draft: characterForm.draft,
    errorMessage,
    hasUnsavedChanges: characterForm.hasUnsavedChanges,
    isDeleting,
    isLoading,
    isSaving,
    moveProperty: characterForm.moveProperty,
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    requestDeleteSelectedCharacter,
    removeProperty: characterForm.removeProperty,
    requestCloseDialog,
    saveCharacter,
    setGender: characterForm.setGender,
    setName: characterForm.setName,
    updateProperty: characterForm.updateProperty,
  }
}
