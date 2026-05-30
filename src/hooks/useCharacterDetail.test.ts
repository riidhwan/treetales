import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type CharacterDetailServices,
  useCharacterDetail,
} from '@/hooks/useCharacterDetail'
import type {
  Character,
  CharacterIllustration,
  ImportCharacterIllustrationInput,
  Story,
  UpdateCharacterIllustrationInput,
} from '@/services/types'

let createObjectUrlMock: ReturnType<typeof vi.fn>
let revokeObjectUrlMock: ReturnType<typeof vi.fn>

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

function createIllustration(
  overrides: Partial<CharacterIllustration> = {},
): CharacterIllustration {
  return {
    id: 'illustration-1',
    storyId: 'story-1',
    characterId: 'character-1',
    fileId: 'file-1',
    label: 'Bridge',
    order: 0,
    mimeType: 'image/png',
    sizeBytes: 2048,
    width: 800,
    height: 600,
    importMode: 'normalized',
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

function createServices(options: {
  readonly character?: Character
  readonly illustrations?: CharacterIllustration[]
  readonly story?: Story
} = {}): CharacterDetailServices {
  const character = 'character' in options ? options.character : createCharacter()
  const illustrations = options.illustrations ?? []
  const story = 'story' in options ? options.story : createStory()
  let currentCharacter = character
  let currentIllustrations = [...illustrations]

  return {
    deleteCharacter: vi.fn((id: string) => {
      if (!currentCharacter || currentCharacter.id !== id) {
        return Promise.resolve(false)
      }

      currentCharacter = undefined
      return Promise.resolve(true)
    }),
    deleteCharacterIllustration: vi.fn((id: string) => {
      const illustration = currentIllustrations.find((item) => item.id === id)

      if (!illustration) {
        return Promise.resolve(false)
      }

      currentIllustrations = currentIllustrations.filter((item) => item.id !== id)
      return Promise.resolve(true)
    }),
    getCharacterById: vi.fn(() => Promise.resolve(currentCharacter)),
    getCharacterIllustrationFile: vi.fn(() =>
      Promise.resolve(new Blob(['image'], { type: 'image/png' })),
    ),
    getCharacterIllustrationsByCharacterId: vi.fn(() =>
      Promise.resolve([...currentIllustrations]),
    ),
    getStoryById: vi.fn(() => Promise.resolve(story)),
    importCharacterIllustration: vi.fn(
      (input: ImportCharacterIllustrationInput) => {
        const illustration = createIllustration({
          id: `illustration-${currentIllustrations.length + 1}`,
          fileId: `file-${currentIllustrations.length + 1}`,
          label: input.label?.trim() ?? '',
          importMode: input.importMode ?? 'normalized',
          order: currentIllustrations.length,
        })
        currentIllustrations = [...currentIllustrations, illustration]

        return Promise.resolve(illustration)
      },
    ),
    updateCharacterIllustration: vi.fn(
      (id: string, input: UpdateCharacterIllustrationInput) => {
        const illustration = currentIllustrations.find((item) => item.id === id)

        if (!illustration) {
          return Promise.resolve(undefined)
        }

        const updatedIllustration = {
          ...illustration,
          ...input,
          updatedAt: 200,
        }
        currentIllustrations = currentIllustrations
          .map((item) => (item.id === id ? updatedIllustration : item))
          .sort((first, second) => first.order - second.order)

        return Promise.resolve(updatedIllustration)
      },
    ),
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
  beforeEach(() => {
    createObjectUrlMock = vi.fn(() => 'blob:illustration')
    revokeObjectUrlMock = vi.fn()
    vi.stubGlobal('URL', {
      createObjectURL: createObjectUrlMock,
      revokeObjectURL: revokeObjectUrlMock,
    })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
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

  it('releases stale Character Illustration object URLs after unmounting', async () => {
    const pendingIllustrations = deferred<CharacterIllustration[]>()
    const services = {
      ...createServices(),
      getCharacterIllustrationsByCharacterId: vi.fn(
        () => pendingIllustrations.promise,
      ),
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
      expect(services.getCharacterIllustrationsByCharacterId).toHaveBeenCalled()
    })
    unmount()

    await act(async () => {
      pendingIllustrations.resolve([createIllustration()])
      await pendingIllustrations.promise
    })

    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:illustration')
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

  it('ignores stale load errors after unmounting', async () => {
    const pendingStory = new Promise<Story | undefined>((_, reject) => {
      window.setTimeout(() => reject(new Error('Late failure.')), 0)
    })
    const services = {
      ...createServices(),
      getStoryById: vi.fn(() => pendingStory),
    }
    const { unmount } = renderHook(() =>
      useCharacterDetail({
        characterId: 'character-1',
        onDeleted: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    unmount()

    await expect(pendingStory).rejects.toThrow('Late failure.')
  })

  it('keeps Character Illustrations visible when a stored file is missing', async () => {
    const services = {
      ...createServices({ illustrations: [createIllustration()] }),
      getCharacterIllustrationFile: vi.fn(() =>
        Promise.resolve(undefined),
      ),
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

    expect(result.current.illustrations[0].imageUrl).toBeUndefined()
    expect(createObjectUrlMock).not.toHaveBeenCalled()
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
      result.current.requestDeleteCharacter()
    })
    await act(async () => {
      await result.current.confirmDeleteCharacter()
      result.current.setIllustrationFile(new File(['image'], 'mira.png'))
      await result.current.importIllustration()
      await result.current.confirmDeleteIllustration()
      await result.current.saveIllustrationLabel('missing-illustration')
      await result.current.moveIllustration('missing-illustration', 1)
    })

    expect(services.deleteCharacter).not.toHaveBeenCalled()
    expect(services.importCharacterIllustration).not.toHaveBeenCalled()
    expect(services.updateCharacterIllustration).not.toHaveBeenCalled()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('handles delete failures', async () => {
    const services = {
      ...createServices(),
      deleteCharacter: vi.fn(() => Promise.reject(new Error('Delete failed.'))),
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
      result.current.requestDeleteCharacter()
    })
    await act(async () => {
      await result.current.confirmDeleteCharacter()
    })

    expect(result.current.errorMessage).toBe('Delete failed.')
  })

  it('shows missing character when delete cannot find the character', async () => {
    const services = {
      ...createServices(),
      deleteCharacter: vi.fn(() => Promise.resolve(false)),
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
      result.current.requestDeleteCharacter()
    })
    await act(async () => {
      await result.current.confirmDeleteCharacter()
    })

    expect(result.current.confirmationState.mode).toBe('closed')
  })

  it('handles Character Illustration update, import, and delete failures', async () => {
    const services = {
      ...createServices({ illustrations: [createIllustration()] }),
      deleteCharacterIllustration: vi.fn(() =>
        Promise.reject(new Error('Delete image failed.')),
      ),
      importCharacterIllustration: vi.fn(() =>
        Promise.reject(new Error('Import failed.')),
      ),
      updateCharacterIllustration: vi.fn(() =>
        Promise.reject(new Error('Update image failed.')),
      ),
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
      result.current.setIllustrationLabelDraft('illustration-1', 'Failed')
    })
    await act(async () => {
      await result.current.saveIllustrationLabel('illustration-1')
    })

    expect(result.current.illustrationErrorMessage).toBe('Update image failed.')

    const file = new File(['image'], 'mira.png', { type: 'image/png' })
    act(() => {
      result.current.setIllustrationFile(file)
    })
    expect(result.current.illustrationFile).toBe(file)
    expect(result.current.illustrationPreviewUrl).toBe('blob:illustration')
    await act(async () => {
      await result.current.importIllustration()
    })

    expect(result.current.illustrationErrorMessage).toBe('Import failed.')
    expect(result.current.illustrationFile).toBe(file)
    expect(result.current.illustrationPreviewUrl).toBe('blob:illustration')

    act(() => {
      result.current.requestDeleteIllustration('illustration-1')
    })
    await act(async () => {
      await result.current.confirmDeleteIllustration()
    })

    expect(result.current.illustrationErrorMessage).toBe('Delete image failed.')
  })

  it('clears pending Character Illustration imports when cancelled', async () => {
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

    const file = new File(['image'], 'mira.png', { type: 'image/png' })
    act(() => {
      result.current.setIllustrationFile(file)
      result.current.setIllustrationImportLabel('Draft')
      result.current.setIllustrationImportMode('original')
    })

    expect(result.current.illustrationPreviewUrl).toBe('blob:illustration')

    act(() => {
      result.current.cancelIllustrationImport()
    })

    expect(result.current.illustrationFile).toBeUndefined()
    expect(result.current.illustrationImportLabel).toBe('')
    expect(result.current.illustrationImportMode).toBe('normalized')
    expect(result.current.illustrationPreviewUrl).toBeUndefined()
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:illustration')
  })

  it('clears a selected Character Illustration file without creating a preview', async () => {
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
      result.current.setIllustrationFile(undefined)
    })

    expect(result.current.illustrationFile).toBeUndefined()
    expect(result.current.illustrationPreviewUrl).toBeUndefined()
  })

  it('keeps pending Character Illustration imports while saving', async () => {
    const pendingImport = deferred<CharacterIllustration>()
    const services = {
      ...createServices(),
      importCharacterIllustration: vi.fn(() => pendingImport.promise),
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

    const file = new File(['image'], 'mira.png', { type: 'image/png' })
    act(() => {
      result.current.setIllustrationFile(file)
    })

    let importPromise!: Promise<void>
    act(() => {
      importPromise = result.current.importIllustration()
    })

    act(() => {
      result.current.cancelIllustrationImport()
    })

    expect(result.current.isImportingIllustration).toBe(true)
    expect(result.current.illustrationFile).toBe(file)

    await act(async () => {
      pendingImport.resolve(createIllustration())
      await importPromise
    })
  })

  it('reports missing Character Illustrations during label updates and delete no-ops', async () => {
    const services = {
      ...createServices({ illustrations: [createIllustration()] }),
      deleteCharacterIllustration: vi.fn(() => Promise.resolve(false)),
      updateCharacterIllustration: vi.fn(() => Promise.resolve(undefined)),
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

    await act(async () => {
      await result.current.saveIllustrationLabel('illustration-1')
    })

    expect(result.current.illustrationErrorMessage).toBe(
      'Character Illustration could not be found.',
    )

    act(() => {
      result.current.requestDeleteIllustration('illustration-1')
    })
    await act(async () => {
      await result.current.confirmDeleteIllustration()
    })

    expect(result.current.confirmationState.mode).toBe('closed')
  })

  it('manages Character Illustration import, label, reorder, and delete workflows', async () => {
    const services = createServices({
      illustrations: [
        createIllustration({ id: 'illustration-1', label: 'Bridge', order: 0 }),
        createIllustration({
          id: 'illustration-2',
          fileId: 'file-2',
          label: 'Lantern',
          order: 1,
        }),
        createIllustration({
          id: 'illustration-3',
          fileId: 'file-3',
          label: 'River',
          order: 2,
        }),
      ],
    })
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
    expect(result.current.illustrations.map(({ illustration }) => illustration.id))
      .toEqual(['illustration-1', 'illustration-2', 'illustration-3'])
    expect(createObjectUrlMock).toHaveBeenCalled()

    act(() => {
      result.current.setIllustrationLabelDraft('illustration-1', 'Bridge study')
    })
    await act(async () => {
      await result.current.saveIllustrationLabel('illustration-1')
    })

    expect(services.updateCharacterIllustration).toHaveBeenCalledWith(
      'illustration-1',
      { label: 'Bridge study' },
    )

    await act(async () => {
      await result.current.moveIllustration('illustration-2', -1)
    })

    expect(services.updateCharacterIllustration).toHaveBeenCalledWith(
      'illustration-2',
      { order: -1 },
    )

    await act(async () => {
      await result.current.moveIllustration('illustration-3', -1)
    })
    await waitFor(() => {
      expect(result.current.illustrations.map(({ illustration }) => illustration.id))
        .toEqual(['illustration-2', 'illustration-3', 'illustration-1'])
    })
    await act(async () => {
      await result.current.moveIllustration('illustration-2', 1)
    })
    await waitFor(() => {
      expect(result.current.illustrations.map(({ illustration }) => illustration.id))
        .toEqual(['illustration-3', 'illustration-2', 'illustration-1'])
    })
    await act(async () => {
      await result.current.moveIllustration('illustration-2', 1)
    })

    expect(services.updateCharacterIllustration).toHaveBeenCalledWith(
      'illustration-3',
      { order: -0.5 },
    )
    expect(services.updateCharacterIllustration).toHaveBeenCalledWith(
      'illustration-2',
      { order: -0.25 },
    )
    expect(services.updateCharacterIllustration).toHaveBeenCalledWith(
      'illustration-2',
      { order: 1 },
    )

    const file = new File(['image'], 'mira.png', { type: 'image/png' })
    act(() => {
      result.current.setIllustrationFile(file)
      result.current.setIllustrationImportLabel('Imported')
      result.current.setIllustrationImportMode('original')
    })
    await act(async () => {
      await result.current.importIllustration()
    })

    expect(services.importCharacterIllustration).toHaveBeenCalledWith({
      characterId: 'character-1',
      file,
      importMode: 'original',
      label: 'Imported',
    })
    expect(result.current.illustrationFile).toBeUndefined()
    expect(result.current.illustrationImportLabel).toBe('')
    expect(result.current.illustrationImportMode).toBe('normalized')
    expect(result.current.illustrationPreviewUrl).toBeUndefined()
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:illustration')

    act(() => {
      result.current.requestDeleteIllustration('illustration-2')
    })
    await act(async () => {
      await result.current.confirmDeleteIllustration()
    })

    expect(services.deleteCharacterIllustration).toHaveBeenCalledWith(
      'illustration-2',
    )
    expect(result.current.confirmationState.mode).toBe('closed')
  })
})
