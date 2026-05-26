import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CharacterDetail } from '@/components/features/CharacterDetail'
import { CharacterDetailContent } from '@/components/features/CharacterDetail/CharacterDetail/CharacterDetailContent'
import type {
  CharacterDetailServices,
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

function renderCharacterDetail({
  onBackToStory = vi.fn(),
  services = createServices(),
}: {
  readonly onBackToStory?: (storyId: string) => void
  readonly services?: CharacterDetailServices
} = {}) {
  return render(
    <CharacterDetail
      characterId="character-1"
      onBackToStory={onBackToStory}
      services={services}
      storyId="story-1"
    />,
  )
}

describe('CharacterDetail', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('loads the story and character for a direct URL view', async () => {
    const services = createServices()
    const onBackToStory = vi.fn()

    renderCharacterDetail({ onBackToStory, services })

    expect(await screen.findByRole('heading', { name: 'Mira' })).toBeTruthy()
    expect(screen.getByText('The Old Road')).toBeTruthy()
    expect(screen.getByText(/A long history\s+with line breaks/)).toBeTruthy()
    expect(screen.getByText('relationship')).toBeTruthy()
    expect(screen.queryByText('Custom properties')).toBeNull()
    expect(services.getStoryById).toHaveBeenCalledWith('story-1')
    expect(services.getCharacterById).toHaveBeenCalledWith('character-1')

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
            beginEdit: vi.fn(),
            character: createCharacter(),
            isEditing: false,
            status: 'ready',
            story: undefined,
          } as unknown as ReturnType<typeof useCharacterDetail>
        }
        titleId="character-title"
      />,
    )
    expect(screen.getByText('Story')).toBeTruthy()
  })

  it('shows missing states for absent story and absent character', async () => {
    const missingStoryServices = createServices({ story: undefined })
    const { rerender } = render(
      <CharacterDetail
        characterId="character-1"
        onBackToStory={vi.fn()}
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
        services={missingCharacterServices}
        storyId="story-1"
      />,
    )

    expect(await screen.findByText('Character could not be found.')).toBeTruthy()
  })

  it(
    'edits character fields and preserves ordered property behavior',
    async () => {
      const services = createServices()

      renderCharacterDetail({ services })

      await screen.findByRole('heading', { name: 'Mira' })
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }))
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'Mira Changed' },
      })
      fireEvent.change(screen.getByLabelText('Gender'), {
        target: { value: 'male' },
      })
      fireEvent.click(screen.getByRole('button', { name: /add property/i }))
      const keys = screen.getAllByLabelText('Key')
      const values = screen.getAllByLabelText('Value')
      fireEvent.change(keys[keys.length - 1], {
        target: { value: ' empty value ' },
      })
      fireEvent.change(values[values.length - 1], {
        target: { value: ' trimmed ' },
      })
      fireEvent.click(screen.getByRole('button', { name: /move age down/i }))
      fireEvent.click(
        screen.getByRole('button', { name: /move appearance up/i }),
      )
      fireEvent.click(screen.getAllByRole('button', { name: /remove/i })[0])
      const characterForm = screen.getByLabelText('Name').closest('form')

      if (!characterForm) {
        throw new Error('Character form was not found.')
      }

      fireEvent.submit(characterForm)

      await waitFor(() => {
        expect(services.updateCharacter).toHaveBeenCalledWith(
          'character-1',
          expect.objectContaining({
            gender: 'male',
            name: 'Mira Changed',
            properties: [
              { key: 'appearance', value: 'Silver hair' },
              { key: 'age', value: '32' },
              { key: 'relationship', value: 'Sister of Rowan' },
              { key: 'empty value', value: 'trimmed' },
            ],
          }),
        )
      })
      expect(await screen.findByRole('heading', { name: 'Mira Changed' }))
        .toBeTruthy()
    },
    10_000,
  )

  it('saves edits from the header save action', async () => {
    const services = createServices()

    renderCharacterDetail({ services })

    await screen.findByRole('heading', { name: 'Mira' })
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }))
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Header Save' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(services.updateCharacter).toHaveBeenCalledWith(
        'character-1',
        expect.objectContaining({ name: 'Header Save' }),
      )
    })
  })

  it('confirms before discarding unsaved character edits', async () => {
    renderCharacterDetail()

    await screen.findByRole('heading', { name: 'Mira' })
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }))
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mira Changed' },
    })
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    const confirmation = await screen.findByRole('dialog', {
      name: 'Discard Character Changes?',
    })
    expect(confirmation.textContent).toContain(
      'Discard unsaved character changes?',
    )
    fireEvent.click(
      within(confirmation).getByRole('button', { name: /discard changes/i }),
    )

    expect(screen.queryByLabelText('Name')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Mira' })).toBeTruthy()
  })

  it('confirms deletion and returns to the owning story detail page', async () => {
    const onBackToStory = vi.fn()
    const services = createServices()

    renderCharacterDetail({ onBackToStory, services })

    await screen.findByRole('heading', { name: 'Mira' })
    expect(screen.queryByRole('button', { name: /delete character/i })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }))
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
})
