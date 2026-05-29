import { useEffect, useState } from 'react'

import {
  createCharacterDraftFromCharacter,
  createCharacterUpdateInput,
  useCharacterForm,
} from '@/hooks/useCharacterForm'
import { getErrorMessage } from '@/lib/errors'
import {
  getCharacterById,
  updateCharacter,
} from '@/services/characterService'
import { getStoryById } from '@/services/storyService'
import type {
  Character,
  Story,
  UpdateCharacterInput,
} from '@/services/types'

export type { CharacterFormDraft } from '@/hooks/useCharacterForm'

type CharacterEditorStatus =
  | 'error'
  | 'loading'
  | 'missing-character'
  | 'missing-story'
  | 'ready'

export interface CharacterEditorServices {
  readonly getCharacterById: (id: string) => Promise<Character | undefined>
  readonly getStoryById: (id: string) => Promise<Story | undefined>
  readonly updateCharacter: (
    id: string,
    input: UpdateCharacterInput,
  ) => Promise<Character | undefined>
}

export const DEFAULT_CHARACTER_EDITOR_SERVICES: CharacterEditorServices = {
  getCharacterById,
  getStoryById,
  updateCharacter,
}

interface UseCharacterEditorOptions {
  readonly characterId: string
  readonly onSaved: () => void
  readonly services?: CharacterEditorServices
  readonly storyId: string
}

export function useCharacterEditor({
  characterId,
  onSaved,
  services = DEFAULT_CHARACTER_EDITOR_SERVICES,
  storyId,
}: UseCharacterEditorOptions) {
  const [status, setStatus] = useState<CharacterEditorStatus>('loading')
  const [story, setStory] = useState<Story | undefined>()
  const [character, setCharacter] = useState<Character | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const characterForm = useCharacterForm({ isActive: status === 'ready' })

  useEffect(() => {
    let isCurrent = true

    async function loadCharacter() {
      setStatus('loading')
      setStory(undefined)
      setCharacter(undefined)
      setErrorMessage(undefined)

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

        characterForm.resetDraft(
          createCharacterDraftFromCharacter(loadedCharacter),
        )
        setStory(loadedStory)
        setCharacter(loadedCharacter)
        setStatus('ready')
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error))
          setStatus('error')
        }
      }
    }

    void loadCharacter()

    return () => {
      isCurrent = false
    }
  }, [characterId, services, storyId])

  async function saveCharacter() {
    if (status !== 'ready' || !character || !characterForm.canSave || isSaving) {
      return
    }

    setIsSaving(true)
    setErrorMessage(undefined)

    try {
      const updatedCharacter = await services.updateCharacter(
        character.id,
        createCharacterUpdateInput(characterForm.draft),
      )

      if (!updatedCharacter || updatedCharacter.storyId !== storyId) {
        setStatus('missing-character')
        return
      }

      characterForm.resetDraft(createCharacterDraftFromCharacter(updatedCharacter))
      setCharacter(updatedCharacter)
      onSaved()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    addProperty: characterForm.addProperty,
    canSave: characterForm.canSave,
    character,
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
