import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  type StoryCharacterServices,
  useStoryCharacters,
} from '@/hooks/useStoryCharacters'
import type {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
} from '@/services/types'

function createCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'character-1',
    storyId: 'story-1',
    name: 'Mira',
    gender: 'female',
    properties: [
      {
        key: 'age',
        value: '32',
      },
    ],
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

function createServices(
  characters: Character[] = [createCharacter()],
): StoryCharacterServices {
  let currentCharacters = characters

  return {
    createCharacter: vi.fn((input: CreateCharacterInput) => {
      const character = createCharacter({
        id: 'character-created',
        ...input,
      })
      currentCharacters = [...currentCharacters, character]
      return Promise.resolve(character)
    }),
    deleteCharacter: vi.fn((id: string) => {
      const exists = currentCharacters.some((character) => character.id === id)
      currentCharacters = currentCharacters.filter(
        (character) => character.id !== id,
      )
      return Promise.resolve(exists)
    }),
    getCharactersByStoryId: vi.fn(() => Promise.resolve(currentCharacters)),
    updateCharacter: vi.fn((id: string, input: UpdateCharacterInput) => {
      const character = currentCharacters.find(
        (currentCharacter) => currentCharacter.id === id,
      )

      if (!character) {
        return Promise.resolve(undefined)
      }

      const updatedCharacter = {
        ...character,
        ...input,
        updatedAt: 200,
      }
      currentCharacters = currentCharacters.map((currentCharacter) =>
        currentCharacter.id === id ? updatedCharacter : currentCharacter,
      )

      return Promise.resolve(updatedCharacter)
    }),
  }
}

function deferred<TValue>() {
  let resolve!: (value: TValue) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<TValue>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, reject, resolve }
}

describe('useStoryCharacters', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('loads characters only when enabled', async () => {
    const services = createServices()
    const { rerender, result } = renderHook(
      ({ enabled }) =>
        useStoryCharacters({
          enabled,
          services,
          storyId: 'story-1',
        }),
      { initialProps: { enabled: false } },
    )

    expect(result.current.characters).toEqual([])
    expect(services.getCharactersByStoryId).not.toHaveBeenCalled()

    rerender({ enabled: true })

    await waitFor(() => {
      expect(result.current.characters).toEqual([createCharacter()])
    })
    expect(services.getCharactersByStoryId).toHaveBeenCalledWith('story-1')
  })

  it('ignores stale character loads after unmounting', async () => {
    const pendingCharacters = deferred<Character[]>()
    const services = {
      ...createServices([]),
      getCharactersByStoryId: vi.fn(() => pendingCharacters.promise),
    }
    const view = renderHook(() =>
      useStoryCharacters({
        enabled: true,
        services,
        storyId: 'story-1',
      }),
    )

    view.unmount()

    await act(async () => {
      pendingCharacters.resolve([createCharacter()])
      await pendingCharacters.promise
    })

    const pendingFailure = deferred<Character[]>()
    const failureView = renderHook(() =>
      useStoryCharacters({
        enabled: true,
        services: {
          ...createServices([]),
          getCharactersByStoryId: vi.fn(() => pendingFailure.promise),
        },
        storyId: 'story-1',
      }),
    )

    failureView.unmount()

    await act(async () => {
      pendingFailure.reject(new Error('stale failure'))
      await pendingFailure.promise.catch(() => undefined)
    })

    expect(services.getCharactersByStoryId).toHaveBeenCalledWith('story-1')
  })

  it('creates characters from trimmed draft values', async () => {
    const services = createServices([])
    const { result } = renderHook(() =>
      useStoryCharacters({
        enabled: true,
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.openCreateDialog()
      result.current.setName(' Mira ')
      result.current.addProperty()
      result.current.addProperty()
    })
    const [property, ignoredProperty] = result.current.draft.properties

    act(() => {
      result.current.updateProperty(property.id, {
        key: ' description ',
        value: ' long note ',
      })
      result.current.updateProperty(ignoredProperty.id, {
        key: ' ',
        value: 'ignored',
      })
      result.current.updateProperty('missing-property', {
        key: 'missing',
      })
    })
    await act(async () => {
      await result.current.saveCharacter()
    })

    expect(services.createCharacter).toHaveBeenCalledWith({
      storyId: 'story-1',
      name: 'Mira',
      gender: 'female',
      properties: [{ key: 'description', value: 'long note' }],
    })
    expect(result.current.dialogState.mode).toBe('view')
    expect(result.current.characters).toHaveLength(1)
  })

  it('does not save outside an editable dialog or with a blank name', async () => {
    const services = createServices([])
    const { result } = renderHook(() =>
      useStoryCharacters({
        enabled: true,
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.saveCharacter()
    })
    act(() => {
      result.current.openCreateDialog()
    })
    await act(async () => {
      await result.current.saveCharacter()
    })

    expect(services.createCharacter).not.toHaveBeenCalled()
  })

  it('updates characters and reorders draft properties', async () => {
    const services = createServices([
      createCharacter({
        properties: [
          { key: 'age', value: '32' },
          { key: 'role', value: 'guide' },
        ],
      }),
    ])
    const { result } = renderHook(() =>
      useStoryCharacters({
        enabled: true,
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.characters).toHaveLength(1)
    })

    act(() => {
      result.current.openEditDialog(result.current.characters[0])
    })
    const [ageProperty, roleProperty] = result.current.draft.properties

    act(() => {
      result.current.setGender('male')
      result.current.moveProperty(ageProperty.id, 1)
      result.current.moveProperty(roleProperty.id, -1)
      result.current.moveProperty('missing-property', 1)
      result.current.removeProperty(ageProperty.id)
    })
    await act(async () => {
      await result.current.saveCharacter()
    })

    expect(services.updateCharacter).toHaveBeenCalledWith('character-1', {
      storyId: 'story-1',
      name: 'Mira',
      gender: 'male',
      properties: [{ key: 'role', value: 'guide' }],
    })
    expect(result.current.dialogState.mode).toBe('view')
  })

  it('asks before discarding unsaved edit changes', async () => {
    const services = createServices()
    const { result } = renderHook(() =>
      useStoryCharacters({
        enabled: true,
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.characters).toHaveLength(1)
    })

    act(() => {
      result.current.openEditDialog(result.current.characters[0])
    })
    act(() => {
      result.current.setName('Changed')
    })
    act(() => {
      result.current.requestCloseDialog()
    })

    expect(result.current.confirmationState.mode).toBe('discard-changes')
    expect(result.current.dialogState.mode).toBe('edit')

    act(() => {
      result.current.cancelConfirmation()
    })
    expect(result.current.confirmationState.mode).toBe('closed')

    act(() => {
      result.current.requestCloseDialog()
      result.current.confirmDiscardChanges()
    })
    expect(result.current.dialogState.mode).toBe('closed')
  })

  it('deletes the selected character after confirmation', async () => {
    const services = createServices()
    const { result } = renderHook(() =>
      useStoryCharacters({
        enabled: true,
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.characters).toHaveLength(1)
    })

    act(() => {
      result.current.openViewDialog(result.current.characters[0])
    })
    act(() => {
      result.current.requestDeleteSelectedCharacter()
    })
    expect(result.current.confirmationState.mode).toBe('delete-character')

    await act(async () => {
      await result.current.confirmDeleteSelectedCharacter()
    })

    expect(services.deleteCharacter).toHaveBeenCalledWith('character-1')
    expect(result.current.characters).toEqual([])
    expect(result.current.dialogState.mode).toBe('closed')
  })

  it('keeps scoped errors for character load and mutation failures', async () => {
    const services = {
      ...createServices(),
      getCharactersByStoryId: vi.fn(() =>
        Promise.reject(new Error('Could not load characters.')),
      ),
    }
    const loadFailure = renderHook(() =>
      useStoryCharacters({
        enabled: true,
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(loadFailure.result.current.errorMessage).toBe(
        'Could not load characters.',
      )
    })

    const mutationServices = {
      ...createServices(),
      createCharacter: vi.fn(() =>
        Promise.reject(new Error('Could not create character.')),
      ),
      deleteCharacter: vi.fn(() => Promise.resolve(false)),
      updateCharacter: vi.fn(() => Promise.resolve(undefined)),
    }
    const { result } = renderHook(() =>
      useStoryCharacters({
        enabled: true,
        services: mutationServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.characters).toHaveLength(1)
    })

    act(() => {
      result.current.openCreateDialog()
      result.current.setName('Mira')
    })
    await act(async () => {
      await result.current.saveCharacter()
    })
    expect(result.current.errorMessage).toBe('Could not create character.')

    act(() => {
      result.current.openEditDialog(result.current.characters[0])
    })
    await act(async () => {
      await result.current.saveCharacter()
    })
    expect(result.current.errorMessage).toBe('Character could not be found.')

    act(() => {
      result.current.openViewDialog(result.current.characters[0])
    })
    act(() => {
      result.current.requestDeleteSelectedCharacter()
    })
    await act(async () => {
      await result.current.confirmDeleteSelectedCharacter()
    })
    expect(result.current.errorMessage).toBe('Character could not be found.')
  })
})
