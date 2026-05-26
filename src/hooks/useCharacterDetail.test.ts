import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  type CharacterDetailServices,
  useCharacterDetail,
} from '@/hooks/useCharacterDetail'
import type { Character, Story } from '@/services/types'

function createStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 'story-1',
    title: 'The Old Road',
    description: 'A choice in the woods',
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

function createCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'character-1',
    storyId: 'story-1',
    name: 'Mira',
    gender: 'female',
    properties: [{ key: 'age', value: '32' }],
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

function createServices(options: {
  readonly character?: Character
  readonly story?: Story
} = {}): CharacterDetailServices {
  const character = 'character' in options ? options.character : createCharacter()
  const story = 'story' in options ? options.story : createStory()

  return {
    getCharacterById: vi.fn(() => Promise.resolve(character)),
    getStoryById: vi.fn(() => Promise.resolve(story)),
  }
}

function deferred<TValue>() {
  let resolve!: (value: TValue) => void
  const promise = new Promise<TValue>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

describe('useCharacterDetail', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('loads character detail and ignores stale story loads after unmounting', async () => {
    const pendingStory = deferred<Story | undefined>()
    const services = {
      ...createServices(),
      getStoryById: vi.fn(() => pendingStory.promise),
    }
    const { result, unmount } = renderHook(() =>
      useCharacterDetail({
        characterId: 'character-1',
        services,
        storyId: 'story-1',
      }),
    )

    expect(result.current.status).toBe('loading')
    unmount()

    await act(async () => {
      pendingStory.resolve(createStory())
      await pendingStory.promise
    })
  })

  it('ignores stale character loads after the story resolves', async () => {
    const pendingCharacter = deferred<Character | undefined>()
    const services = {
      ...createServices(),
      getCharacterById: vi.fn(() => pendingCharacter.promise),
    }
    const { unmount } = renderHook(() =>
      useCharacterDetail({
        characterId: 'character-1',
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(services.getCharacterById).toHaveBeenCalledWith('character-1')
    })
    unmount()

    await act(async () => {
      pendingCharacter.resolve(createCharacter())
      await pendingCharacter.promise
    })
  })

  it('handles load errors and story-mismatched characters', async () => {
    const failingServices: CharacterDetailServices = {
      ...createServices(),
      getStoryById: vi.fn(() => Promise.reject(new Error('Could not load.'))),
    }
    const { result, rerender } = renderHook(
      ({ services }) =>
        useCharacterDetail({
          characterId: 'character-1',
          services,
          storyId: 'story-1',
        }),
      { initialProps: { services: failingServices } },
    )

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })
    expect(result.current.errorMessage).toBe('Could not load.')

    rerender({
      services: createServices({
        character: createCharacter({ storyId: 'other-story' }),
      }),
    })

    await waitFor(() => {
      expect(result.current.status).toBe('missing-character')
    })
  })
})
