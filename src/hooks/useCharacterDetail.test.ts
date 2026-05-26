import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  type CharacterDetailServices,
  useCharacterDetail,
} from '@/hooks/useCharacterDetail'
import type { Character, Story, UpdateCharacterInput } from '@/services/types'

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
  let currentCharacter = character

  return {
    deleteCharacter: vi.fn((id: string) => {
      if (!currentCharacter || currentCharacter.id !== id) {
        return Promise.resolve(false)
      }

      currentCharacter = undefined
      return Promise.resolve(true)
    }),
    getCharacterById: vi.fn(() => Promise.resolve(currentCharacter)),
    getStoryById: vi.fn(() => Promise.resolve(story)),
    updateCharacter: vi.fn((id: string, input: UpdateCharacterInput) => {
      if (!currentCharacter || currentCharacter.id !== id) {
        return Promise.resolve(undefined)
      }

      currentCharacter = {
        ...currentCharacter,
        ...input,
        updatedAt: 200,
      }

      return Promise.resolve(currentCharacter)
    }),
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

  it('loads a character and ignores stale loads after unmounting', async () => {
    const pendingStory = deferred<Story | undefined>()
    const services = {
      ...createServices(),
      getStoryById: vi.fn(() => pendingStory.promise),
    }
    const { result, unmount } = renderHook(() =>
      useCharacterDetail({
        characterId: 'character-1',
        onDeleted: vi.fn(),
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
        onDeleted: vi.fn(),
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
          onDeleted: vi.fn(),
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

  it('keeps no-op guards inert when no character is ready', async () => {
    const services = createServices({ character: undefined })
    const onDeleted = vi.fn()
    const { result } = renderHook(() =>
      useCharacterDetail({
        characterId: 'character-1',
        onDeleted,
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('missing-character')
    })

    act(() => {
      result.current.beginEdit()
      result.current.confirmDiscardChanges()
      result.current.requestDeleteCharacter()
    })
    await act(async () => {
      await result.current.saveCharacter()
      await result.current.confirmDeleteCharacter()
    })

    expect(services.updateCharacter).not.toHaveBeenCalled()
    expect(services.deleteCharacter).not.toHaveBeenCalled()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('cancels unchanged edits without confirmation and ignores invalid moves', async () => {
    const services = createServices()
    const { result } = renderHook(() =>
      useCharacterDetail({
        characterId: 'character-1',
        onDeleted: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    act(() => {
      result.current.beginEdit()
      result.current.moveProperty('missing-property', 1)
      result.current.requestCancelEdit()
    })

    expect(result.current.isEditing).toBe(false)
    expect(result.current.confirmationState.mode).toBe('closed')
  })

  it('handles update and delete failures', async () => {
    const services = {
      ...createServices(),
      deleteCharacter: vi.fn(() => Promise.reject(new Error('Delete failed.'))),
      updateCharacter: vi.fn(() => Promise.reject(new Error('Update failed.'))),
    }
    const { result } = renderHook(() =>
      useCharacterDetail({
        characterId: 'character-1',
        onDeleted: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    act(() => {
      result.current.beginEdit()
      result.current.setName('Changed')
    })
    await act(async () => {
      await result.current.saveCharacter()
    })

    expect(result.current.errorMessage).toBe('Update failed.')

    act(() => {
      result.current.requestDeleteCharacter()
    })
    await act(async () => {
      await result.current.confirmDeleteCharacter()
    })

    expect(result.current.errorMessage).toBe('Delete failed.')
  })

  it('shows missing character when update or delete cannot find the character', async () => {
    const services = {
      ...createServices(),
      deleteCharacter: vi.fn(() => Promise.resolve(false)),
      updateCharacter: vi.fn(() => Promise.resolve(undefined)),
    }
    const { result } = renderHook(() =>
      useCharacterDetail({
        characterId: 'character-1',
        onDeleted: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    act(() => {
      result.current.beginEdit()
      result.current.setName('Changed')
    })
    await act(async () => {
      await result.current.saveCharacter()
    })

    expect(result.current.status).toBe('missing-character')

    act(() => {
      result.current.requestDeleteCharacter()
    })
    await act(async () => {
      await result.current.confirmDeleteCharacter()
    })

    expect(result.current.confirmationState.mode).toBe('closed')
  })
})
