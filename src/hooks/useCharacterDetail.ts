import { useEffect, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import { getCharacterById } from '@/services/characterService'
import { getStoryById } from '@/services/storyService'
import type { Character, Story } from '@/services/types'

type CharacterDetailStatus =
  | 'error'
  | 'loading'
  | 'missing-character'
  | 'missing-story'
  | 'ready'

export interface CharacterDetailServices {
  readonly getCharacterById: (id: string) => Promise<Character | undefined>
  readonly getStoryById: (id: string) => Promise<Story | undefined>
}

export const DEFAULT_CHARACTER_DETAIL_SERVICES: CharacterDetailServices = {
  getCharacterById,
  getStoryById,
}

interface UseCharacterDetailOptions {
  readonly characterId: string
  readonly services?: CharacterDetailServices
  readonly storyId: string
}

export function useCharacterDetail({
  characterId,
  services = DEFAULT_CHARACTER_DETAIL_SERVICES,
  storyId,
}: UseCharacterDetailOptions) {
  const [status, setStatus] = useState<CharacterDetailStatus>('loading')
  const [story, setStory] = useState<Story | undefined>()
  const [character, setCharacter] = useState<Character | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  useEffect(() => {
    let isCurrent = true

    async function loadCharacterDetail() {
      setStatus('loading')
      setErrorMessage(undefined)
      setStory(undefined)
      setCharacter(undefined)

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

    void loadCharacterDetail()

    return () => {
      isCurrent = false
    }
  }, [characterId, services, storyId])

  return {
    character,
    errorMessage,
    status,
    story,
  }
}
