import { useEffect, useState } from 'react'

import {
  createCharacterCreateInput,
  createEmptyCharacterDraft,
  useCharacterForm,
} from '@/hooks/useCharacterForm'
import { getErrorMessage } from '@/lib/errors'
import { createCharacter } from '@/services/characterService'
import { getStoryById } from '@/services/storyService'
import type {
  Character,
  CreateCharacterInput,
  Story,
} from '@/services/types'

export type { CharacterFormDraft } from '@/hooks/useCharacterForm'

type CharacterCreatorStatus = 'error' | 'loading' | 'missing-story' | 'ready'

export interface CharacterCreatorServices {
  readonly createCharacter: (input: CreateCharacterInput) => Promise<Character>
  readonly getStoryById: (id: string) => Promise<Story | undefined>
}

export const DEFAULT_CHARACTER_CREATOR_SERVICES: CharacterCreatorServices = {
  createCharacter,
  getStoryById,
}

interface UseCharacterCreatorOptions {
  readonly onCreated: (characterId: string) => void
  readonly services?: CharacterCreatorServices
  readonly storyId: string
}

export function useCharacterCreator({
  onCreated,
  services = DEFAULT_CHARACTER_CREATOR_SERVICES,
  storyId,
}: UseCharacterCreatorOptions) {
  const [status, setStatus] = useState<CharacterCreatorStatus>('loading')
  const [story, setStory] = useState<Story | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const characterForm = useCharacterForm({ isActive: status === 'ready' })

  useEffect(() => {
    let isCurrent = true

    async function loadStory() {
      setStatus('loading')
      setStory(undefined)
      setErrorMessage(undefined)
      characterForm.resetDraft(createEmptyCharacterDraft())

      try {
        const loadedStory = await services.getStoryById(storyId)

        if (!isCurrent) {
          return
        }

        if (!loadedStory) {
          setStatus('missing-story')
          return
        }

        setStory(loadedStory)
        setStatus('ready')
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error))
          setStatus('error')
        }
      }
    }

    void loadStory()

    return () => {
      isCurrent = false
    }
  }, [services, storyId])

  async function saveCharacter() {
    if (status !== 'ready' || !characterForm.canSave || isSaving) {
      return
    }

    setIsSaving(true)
    setErrorMessage(undefined)

    try {
      const createdCharacter = await services.createCharacter(
        createCharacterCreateInput(storyId, characterForm.draft),
      )
      characterForm.resetDraft(createEmptyCharacterDraft())
      onCreated(createdCharacter.id)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    addProperty: characterForm.addProperty,
    canSave: characterForm.canSave,
    draft: characterForm.draft,
    errorMessage,
    hasUnsavedChanges: characterForm.hasUnsavedChanges,
    isSaving,
    moveProperty: characterForm.moveProperty,
    removeProperty: characterForm.removeProperty,
    saveCharacter,
    setGender: characterForm.setGender,
    setName: characterForm.setName,
    status,
    story,
    updateProperty: characterForm.updateProperty,
  }
}
