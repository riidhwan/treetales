import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  type CharacterEditorServices,
  useCharacterEditor,
} from '@/hooks/useCharacterEditor'
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
} = {}): CharacterEditorServices {
  const story = 'story' in options ? options.story : createStory()
  let currentCharacter =
    'character' in options ? options.character : createCharacter()

  return {
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
  let reject!: (reason: unknown) => void
  const promise = new Promise<TValue>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, reject, resolve }
}

describe('useCharacterEditor', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('loads the owning story and character for editing', async () => {
    const services = createServices()
    const { result } = renderHook(() =>
      useCharacterEditor({
        characterId: 'character-1',
        onSaved: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })
    expect(result.current.story?.title).toBe('The Old Road')
    expect(result.current.draft.name).toBe('Mira')
    expect(services.getStoryById).toHaveBeenCalledWith('story-1')
    expect(services.getCharacterById).toHaveBeenCalledWith('character-1')
  })

  it('reports missing stories and missing characters separately', async () => {
    const { result, rerender } = renderHook(
      ({ services }) =>
        useCharacterEditor({
          characterId: 'character-1',
          onSaved: vi.fn(),
          services,
          storyId: 'story-1',
        }),
      { initialProps: { services: createServices({ story: undefined }) } },
    )

    await waitFor(() => {
      expect(result.current.status).toBe('missing-story')
    })

    rerender({ services: createServices({ character: undefined }) })

    await waitFor(() => {
      expect(result.current.status).toBe('missing-character')
    })

    rerender({
      services: createServices({
        character: createCharacter({ storyId: 'other-story' }),
      }),
    })

    await waitFor(() => {
      expect(result.current.status).toBe('missing-character')
    })
  })

  it('reports load failures and ignores stale load completions', async () => {
    const failingServices = {
      ...createServices(),
      getStoryById: vi.fn(() => Promise.reject(new Error('Could not load.'))),
    }
    const { result, unmount } = renderHook(() =>
      useCharacterEditor({
        characterId: 'character-1',
        onSaved: vi.fn(),
        services: failingServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })
    expect(result.current.errorMessage).toBe('Could not load.')

    const pendingStory = deferred<Story | undefined>()
    const staleServices = {
      ...createServices(),
      getStoryById: vi.fn(() => pendingStory.promise),
    }
    const staleLoad = renderHook(() =>
      useCharacterEditor({
        characterId: 'character-1',
        onSaved: vi.fn(),
        services: staleServices,
        storyId: 'story-1',
      }),
    )
    staleLoad.unmount()

    await act(async () => {
      pendingStory.resolve(createStory())
      await pendingStory.promise
    })

    const pendingFailure = deferred<Story | undefined>()
    const staleFailureServices = {
      ...createServices(),
      getStoryById: vi.fn(() => pendingFailure.promise),
    }
    const staleFailure = renderHook(() =>
      useCharacterEditor({
        characterId: 'character-1',
        onSaved: vi.fn(),
        services: staleFailureServices,
        storyId: 'story-1',
      }),
    )
    staleFailure.unmount()

    pendingFailure.reject(new Error('Late failure.'))
    await expect(pendingFailure.promise).rejects.toThrow('Late failure.')

    const pendingCharacter = deferred<Character | undefined>()
    const staleCharacterServices = {
      ...createServices(),
      getCharacterById: vi.fn(() => pendingCharacter.promise),
    }
    const staleCharacterLoad = renderHook(() =>
      useCharacterEditor({
        characterId: 'character-1',
        onSaved: vi.fn(),
        services: staleCharacterServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(staleCharacterServices.getCharacterById).toHaveBeenCalled()
    })
    staleCharacterLoad.unmount()

    await act(async () => {
      pendingCharacter.resolve(createCharacter())
      await pendingCharacter.promise
    })
    unmount()
  })

  it('saves normalized input and redirects after a successful update', async () => {
    const services = createServices()
    const onSaved = vi.fn()
    const { result } = renderHook(() =>
      useCharacterEditor({
        characterId: 'character-1',
        onSaved,
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    act(() => {
      result.current.setName(' Mira Changed ')
      result.current.addProperty()
    })
    act(() => {
      result.current.updateProperty(result.current.draft.properties[1].id, {
        key: ' empty ',
        value: ' trimmed ',
      })
    })
    await act(async () => {
      await result.current.saveCharacter()
    })

    expect(services.updateCharacter).toHaveBeenCalledWith('character-1', {
      gender: 'female',
      name: 'Mira Changed',
      properties: [
        { key: 'age', value: '32' },
        { key: 'empty', value: 'trimmed' },
      ],
    })
    expect(onSaved).toHaveBeenCalled()
  })

  it('keeps no-op guards and save failures on the editor page', async () => {
    const services = createServices()
    const { result } = renderHook(() =>
      useCharacterEditor({
        characterId: 'character-1',
        onSaved: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    await act(async () => {
      await result.current.saveCharacter()
    })
    expect(services.updateCharacter).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })
    act(() => {
      result.current.setName('')
    })
    await act(async () => {
      await result.current.saveCharacter()
    })
    expect(services.updateCharacter).not.toHaveBeenCalled()

    const missingUpdateServices = {
      ...createServices(),
      updateCharacter: vi.fn(() => Promise.resolve(undefined)),
    }
    const missingUpdate = renderHook(() =>
      useCharacterEditor({
        characterId: 'character-1',
        onSaved: vi.fn(),
        services: missingUpdateServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(missingUpdate.result.current.status).toBe('ready')
    })
    act(() => {
      missingUpdate.result.current.setName('Mira Changed')
    })
    await act(async () => {
      await missingUpdate.result.current.saveCharacter()
    })
    expect(missingUpdate.result.current.status).toBe('missing-character')

    const failingUpdateServices = {
      ...createServices(),
      updateCharacter: vi.fn(() =>
        Promise.reject(new Error('Could not save character.')),
      ),
    }
    const failingUpdate = renderHook(() =>
      useCharacterEditor({
        characterId: 'character-1',
        onSaved: vi.fn(),
        services: failingUpdateServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(failingUpdate.result.current.status).toBe('ready')
    })
    act(() => {
      failingUpdate.result.current.setName('Mira Changed')
    })
    await act(async () => {
      await failingUpdate.result.current.saveCharacter()
    })
    expect(failingUpdate.result.current.errorMessage).toBe(
      'Could not save character.',
    )
  })
})
