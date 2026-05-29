import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CharacterDetail } from '@/components/features/CharacterDetail'
import { CharacterDetailContent } from '@/components/features/CharacterDetail/CharacterDetail/CharacterDetailContent'
import { CharacterIllustrationSection } from '@/components/features/CharacterDetail/CharacterDetail/CharacterIllustrationSection'
import type {
  CharacterDetailServices,
  useCharacterDetail,
} from '@/hooks/useCharacterDetail'
import type {
  Character,
  CharacterIllustration,
  ImportCharacterIllustrationInput,
  Story,
  UpdateCharacterIllustrationInput,
} from '@/services/types'

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
    properties: [
      { key: 'age', value: '32' },
      { key: 'description', value: 'A long history\nwith line breaks' },
      { key: 'appearance', value: 'Silver hair' },
      { key: 'relationship', value: 'Sister of Rowan' },
    ],
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
    label: 'Bridge reference',
    order: 0,
    mimeType: 'image/png',
    sizeBytes: 1200,
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

function renderCharacterDetail({
  onBackToStory = vi.fn(),
  onEditCharacter = vi.fn(),
  services = createServices(),
}: {
  readonly onBackToStory?: (storyId: string) => void
  readonly onEditCharacter?: (storyId: string, characterId: string) => void
  readonly services?: CharacterDetailServices
} = {}) {
  return render(
    <CharacterDetail
      characterId="character-1"
      onBackToStory={onBackToStory}
      onEditCharacter={onEditCharacter}
      services={services}
      storyId="story-1"
    />,
  )
}

function createCharacterDetailView(
  overrides: Partial<ReturnType<typeof useCharacterDetail>> = {},
): ReturnType<typeof useCharacterDetail> {
  const illustration = createIllustration({
    id: 'illustration-1',
    label: '',
    sizeBytes: 2 * 1024 * 1024,
  })

  return {
    activeIllustrationActionId: undefined,
    cancelConfirmation: vi.fn(),
    canImportIllustration: true,
    character: createCharacter(),
    confirmDeleteCharacter: vi.fn(),
    confirmDeleteIllustration: vi.fn(),
    confirmationState: { mode: 'closed' },
    errorMessage: undefined,
    illustrationErrorMessage: undefined,
    illustrationFile: undefined,
    illustrationImportLabel: '',
    illustrationImportMode: 'normalized',
    illustrationImportResetKey: 0,
    illustrationLabelDrafts: {},
    illustrations: [{ illustration, imageUrl: undefined }],
    importIllustration: vi.fn(),
    isDeleting: false,
    isImportingIllustration: false,
    isLoadingIllustrations: false,
    moveIllustration: vi.fn(),
    requestDeleteCharacter: vi.fn(),
    requestDeleteIllustration: vi.fn(),
    saveIllustrationLabel: vi.fn(),
    setIllustrationFile: vi.fn(),
    setIllustrationImportLabel: vi.fn(),
    setIllustrationImportMode: vi.fn(),
    setIllustrationLabelDraft: vi.fn(),
    status: 'ready',
    story: createStory(),
    ...overrides,
  }
}

describe('CharacterDetail', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:illustration'),
      revokeObjectURL: vi.fn(),
    })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('loads the story and character for a direct URL view', async () => {
    const services = createServices()
    const onBackToStory = vi.fn()
    const onEditCharacter = vi.fn()

    renderCharacterDetail({ onBackToStory, onEditCharacter, services })

    expect(await screen.findByRole('heading', { name: 'Mira' })).toBeTruthy()
    expect(screen.getByText('The Old Road')).toBeTruthy()
    expect(screen.getByText(/A long history\s+with line breaks/)).toBeTruthy()
    expect(screen.getByText('relationship')).toBeTruthy()
    expect(screen.queryByText('Custom properties')).toBeNull()
    const editButton = within(
      screen.getByRole('navigation', { name: 'Character detail navigation' }),
    ).getByRole('button', { name: /^edit$/i })
    expect(editButton).toBeTruthy()
    expect(services.getStoryById).toHaveBeenCalledWith('story-1')
    expect(services.getCharacterById).toHaveBeenCalledWith('character-1')

    fireEvent.click(editButton)
    expect(onEditCharacter).toHaveBeenCalledWith('story-1', 'character-1')

    fireEvent.click(screen.getByRole('button', { name: 'Story Detail' }))

    expect(onBackToStory).toHaveBeenCalledWith('story-1')
  })

  it('shows the no-properties fallback and inline load errors', async () => {
    const services = createServices({
      character: createCharacter({ properties: [] }),
    })
    const { rerender } = render(
      <CharacterDetail
        characterId="character-1"
        onBackToStory={vi.fn()}
        onEditCharacter={vi.fn()}
        services={services}
        storyId="story-1"
      />,
    )

    expect(await screen.findByText('No custom properties yet.')).toBeTruthy()

    const failingServices = {
      ...createServices(),
      getStoryById: vi.fn(() =>
        Promise.reject(new Error('Could not load character.')),
      ),
    }
    rerender(
      <CharacterDetail
        characterId="character-1"
        onBackToStory={vi.fn()}
        onEditCharacter={vi.fn()}
        services={failingServices}
        storyId="story-1"
      />,
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not load character.',
    )
  })

  it('renders nothing when ready detail content has no character context', () => {
    const view = render(
      <CharacterDetailContent
        characterDetail={
          {
            character: undefined,
            status: 'ready',
          } as unknown as ReturnType<typeof useCharacterDetail>
        }
        titleId="character-title"
      />,
    )

    expect(view.container.textContent).toBe('')

    view.rerender(
      <CharacterDetailContent
        characterDetail={
          {
            character: createCharacter(),
            illustrationLabelDrafts: {},
            illustrations: [],
            status: 'ready',
            story: undefined,
          } as unknown as ReturnType<typeof useCharacterDetail>
        }
        titleId="character-title"
      />,
    )
    expect(screen.getByText('Story')).toBeTruthy()
  })

  it('shows Character Illustration loading, error, fallback, and busy states', () => {
    const setIllustrationImportMode = vi.fn()
    const fallbackIllustration = createIllustration({
      id: 'illustration-1',
      label: '',
      sizeBytes: 2 * 1024 * 1024,
    })
    const imageIllustration = createIllustration({
      id: 'illustration-2',
      label: '',
      order: 1,
    })

    render(
      <CharacterIllustrationSection
        characterDetail={createCharacterDetailView({
          activeIllustrationActionId: 'illustration-1',
          canImportIllustration: false,
          illustrationErrorMessage: 'Illustration update failed.',
          illustrationImportMode: 'original',
          illustrationLabelDrafts: { 'illustration-1': '' },
          illustrations: [
            { illustration: fallbackIllustration, imageUrl: undefined },
            { illustration: imageIllustration, imageUrl: 'blob:illustration' },
          ],
          isImportingIllustration: true,
          isLoadingIllustrations: true,
          setIllustrationImportMode,
        })}
      />,
    )

    expect(screen.getByText('Illustration update failed.')).toBeTruthy()
    expect(screen.getByText('Loading Character Illustrations...')).toBeTruthy()
    expect(
      screen.getAllByText('Unlabelled Character Illustration').length,
    ).toBeGreaterThan(0)
    expect(screen.getByText('800 x 600 - 2.0 MB - normalized')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /importing/i }).hasAttribute('disabled'),
    ).toBe(true)
    expect(
      screen
        .getAllByRole('button', {
          name: /save label for character illustration/i,
        })[0]
        .hasAttribute('disabled'),
    ).toBe(true)

    fireEvent.click(screen.getByLabelText(/preserve original quality/i))

    expect(setIllustrationImportMode).toHaveBeenCalledWith('normalized')
  })

  it('shows missing states for absent story and absent character', async () => {
    const missingStoryServices = createServices({ story: undefined })
    const { rerender } = render(
      <CharacterDetail
        characterId="character-1"
        onBackToStory={vi.fn()}
        onEditCharacter={vi.fn()}
        services={missingStoryServices}
        storyId="story-1"
      />,
    )

    expect(
      await screen.findByText(
        'This story may have been deleted or is unavailable in this browser.',
      ),
    ).toBeTruthy()

    const missingCharacterServices = createServices({ character: undefined })
    rerender(
      <CharacterDetail
        characterId="character-1"
        onBackToStory={vi.fn()}
        onEditCharacter={vi.fn()}
        services={missingCharacterServices}
        storyId="story-1"
      />,
    )

    expect(await screen.findByText('Character could not be found.')).toBeTruthy()
  })

  it('confirms deletion and returns to the owning story detail page', async () => {
    const onBackToStory = vi.fn()
    const services = createServices()

    renderCharacterDetail({ onBackToStory, services })

    await screen.findByRole('heading', { name: 'Mira' })
    expect(screen.getByText('Danger Zone')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /delete character/i }))
    const confirmation = await screen.findByRole('dialog', {
      name: 'Delete Character?',
    })
    expect(confirmation.textContent).toContain(
      'Delete "Mira"? This cannot be undone.',
    )
    fireEvent.click(within(confirmation).getByRole('button', { name: /cancel/i }))
    fireEvent.click(screen.getByRole('button', { name: /delete character/i }))
    fireEvent.click(
      within(
        await screen.findByRole('dialog', {
          name: 'Delete Character?',
        }),
      ).getByRole('button', { name: /delete character/i }),
    )

    await waitFor(() => {
      expect(services.deleteCharacter).toHaveBeenCalledWith('character-1')
    })
    expect(onBackToStory).toHaveBeenCalledWith('story-1')
  })

  it(
    'imports, labels, reorders, and deletes Character Illustrations',
    async () => {
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
          importMode: 'original',
          label: 'River',
          order: 2,
          sizeBytes: 2 * 1024 * 1024,
        }),
      ],
    })

    renderCharacterDetail({ services })

    expect(
      await screen.findByRole('heading', { name: 'Character Illustrations' }),
    ).toBeTruthy()
    expect(screen.getByDisplayValue('Bridge')).toBeTruthy()
    expect(screen.getAllByText('800 x 600 - 1 KB - normalized')).toHaveLength(2)
    expect(screen.getByText('800 x 600 - 2.0 MB - original quality'))
      .toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', { name: /move lantern up/i }),
    )

    await waitFor(() => {
      expect(services.updateCharacterIllustration).toHaveBeenCalledWith(
        'illustration-2',
        { order: -1 },
      )
    })

    fireEvent.click(
      screen.getByRole('button', { name: /move bridge down/i }),
    )

    await waitFor(() => {
      expect(services.updateCharacterIllustration).toHaveBeenCalledWith(
        'illustration-1',
        { order: 3 },
      )
    })

    fireEvent.change(screen.getByDisplayValue('Lantern'), {
      target: { value: 'Lantern study' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /save label for lantern/i }),
    )

    await waitFor(() => {
      expect(services.updateCharacterIllustration).toHaveBeenCalledWith(
        'illustration-2',
        { label: 'Lantern study' },
      )
    })

    const file = new File(['image'], 'mira.webp', { type: 'image/webp' })
    fireEvent.change(screen.getByLabelText(/image file/i), {
      target: { files: [file] },
    })
    fireEvent.change(screen.getAllByPlaceholderText('Scene reference')[0], {
      target: { value: 'River' },
    })
    fireEvent.click(screen.getByLabelText(/preserve original quality/i))
    fireEvent.click(
      screen.getByRole('button', { name: /import illustration/i }),
    )

    await waitFor(() => {
      expect(services.importCharacterIllustration).toHaveBeenCalledWith({
        characterId: 'character-1',
        file,
        importMode: 'original',
        label: 'River',
      })
    })

    fireEvent.click(screen.getAllByRole('button', { name: /^delete$/i })[0])
    const confirmation = await screen.findByRole('dialog', {
      name: 'Delete Character Illustration?',
    })
    fireEvent.click(
      within(confirmation).getByRole('button', {
        name: /delete character illustration/i,
      }),
    )

    await waitFor(() => {
      expect(services.deleteCharacterIllustration).toHaveBeenCalledWith(
        'illustration-2',
      )
    })
    },
    10_000,
  )
})
