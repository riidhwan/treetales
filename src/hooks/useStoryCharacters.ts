import { useEffect, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import { getCharactersByStoryId } from '@/services/characterService'
import type { Character } from '@/services/types'

export interface StoryCharacterServices {
  readonly getCharactersByStoryId: (storyId: string) => Promise<Character[]>
}

export const DEFAULT_STORY_CHARACTER_SERVICES: StoryCharacterServices = {
  getCharactersByStoryId,
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
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  useEffect(() => {
    if (!enabled) {
      setCharacters([])
      setIsLoading(false)
      setErrorMessage(undefined)
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

  return {
    characters,
    errorMessage,
    isLoading,
  }
}
