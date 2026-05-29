import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  type StoryCharacterServices,
  useStoryCharacters,
} from '@/hooks/useStoryCharacters'
import type { Character } from '@/services/types'

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
  return {
    getCharactersByStoryId: vi.fn(() => Promise.resolve(characters)),
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

  it('resets list state when disabled', async () => {
    const services = createServices()
    const { rerender, result } = renderHook(
      ({ enabled }) =>
        useStoryCharacters({
          enabled,
          services,
          storyId: 'story-1',
        }),
      { initialProps: { enabled: true } },
    )

    await waitFor(() => {
      expect(result.current.characters).toEqual([createCharacter()])
    })

    rerender({ enabled: false })

    expect(result.current.characters).toEqual([])
    expect(result.current.errorMessage).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('ignores stale character loads after unmounting', async () => {
    const pendingCharacters = deferred<Character[]>()
    const services = {
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

  it('keeps scoped errors for character load failures', async () => {
    const services = {
      getCharactersByStoryId: vi.fn(() =>
        Promise.reject(new Error('Could not load characters.')),
      ),
    }
    const { result } = renderHook(() =>
      useStoryCharacters({
        enabled: true,
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Could not load characters.')
    })

    expect(result.current.characters).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })
})
