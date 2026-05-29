import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  type CharacterCreatorServices,
  useCharacterCreator,
} from '@/hooks/useCharacterCreator'
import type { Character, CreateCharacterInput, Story } from '@/services/types'

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
    id: 'character-created',
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
  readonly story?: Story
} = {}): CharacterCreatorServices {
  const story = 'story' in options ? options.story : createStory()

  return {
    createCharacter: vi.fn((input: CreateCharacterInput) =>
      Promise.resolve(createCharacter(input)),
    ),
    getStoryById: vi.fn(() => Promise.resolve(story)),
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

describe('useCharacterCreator', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('loads the owning story for the creation page', async () => {
    const services = createServices()
    const { result } = renderHook(() =>
      useCharacterCreator({
        onCreated: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })
    expect(result.current.story?.title).toBe('The Old Road')
    expect(services.getStoryById).toHaveBeenCalledWith('story-1')
  })

  it('reports missing stories separately from load failures', async () => {
    const services = createServices({ story: undefined })
    const { result } = renderHook(() =>
      useCharacterCreator({
        onCreated: vi.fn(),
        services,
        storyId: 'missing-story',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('missing-story')
    })
  })

  it('reports story load failures', async () => {
    const services = {
      ...createServices(),
      getStoryById: vi.fn(() => Promise.reject(new Error('Could not load.'))),
    }
    const { result } = renderHook(() =>
      useCharacterCreator({
        onCreated: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })
    expect(result.current.errorMessage).toBe('Could not load.')
  })

  it('ignores stale story loads after cleanup', async () => {
    const pendingStory = deferred<Story | undefined>()
    const services = {
      ...createServices(),
      getStoryById: vi.fn(() => pendingStory.promise),
    }
    const { unmount } = renderHook(() =>
      useCharacterCreator({
        onCreated: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    unmount()

    await act(async () => {
      pendingStory.resolve(createStory())
      await pendingStory.promise
    })

    expect(services.getStoryById).toHaveBeenCalledWith('story-1')
  })

  it('ignores stale story load failures after cleanup', async () => {
    const pendingStory = deferred<Story | undefined>()
    const services = {
      ...createServices(),
      getStoryById: vi.fn(() => pendingStory.promise),
    }
    const { unmount } = renderHook(() =>
      useCharacterCreator({
        onCreated: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    unmount()

    pendingStory.reject(new Error('Late failure.'))
    await expect(pendingStory.promise).rejects.toThrow('Late failure.')
  })

  it('does not save before the draft is valid', async () => {
    const services = createServices()
    const { result } = renderHook(() =>
      useCharacterCreator({
        onCreated: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })
    await act(async () => {
      await result.current.saveCharacter()
    })

    expect(services.createCharacter).not.toHaveBeenCalled()
  })

  it('creates a character with normalized form input and redirects', async () => {
    const services = createServices()
    const onCreated = vi.fn()
    const { result } = renderHook(() =>
      useCharacterCreator({
        onCreated,
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    act(() => {
      result.current.setName(' Mira ')
      result.current.addProperty()
    })
    act(() => {
      result.current.updateProperty(result.current.draft.properties[0].id, {
        key: ' age ',
        value: ' 32 ',
      })
    })
    await act(async () => {
      await result.current.saveCharacter()
    })

    expect(services.createCharacter).toHaveBeenCalledWith({
      storyId: 'story-1',
      name: 'Mira',
      gender: 'female',
      properties: [{ key: 'age', value: '32' }],
    })
    expect(onCreated).toHaveBeenCalledWith('character-created')
  })

  it('keeps the draft open when creation fails', async () => {
    const services = {
      ...createServices(),
      createCharacter: vi.fn(() =>
        Promise.reject(new Error('Could not create character.')),
      ),
    }
    const { result } = renderHook(() =>
      useCharacterCreator({
        onCreated: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })
    act(() => {
      result.current.setName('Mira')
    })
    await act(async () => {
      await result.current.saveCharacter()
    })

    expect(result.current.errorMessage).toBe('Could not create character.')
    expect(result.current.draft.name).toBe('Mira')
  })
})
