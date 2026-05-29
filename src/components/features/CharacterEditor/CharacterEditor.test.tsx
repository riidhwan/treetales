import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CharacterEditor } from '@/components/features/CharacterEditor'
import { CharacterEditorContent } from '@/components/features/CharacterEditor/CharacterEditorContent'
import type { CharacterEditorServices } from '@/hooks/useCharacterEditor'
import type { useCharacterEditor } from '@/hooks/useCharacterEditor'
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

function renderCharacterEditor({
  onBackToCharacter = vi.fn(),
  services = createServices(),
}: {
  readonly onBackToCharacter?: (storyId: string, characterId: string) => void
  readonly services?: CharacterEditorServices
} = {}) {
  return render(
    <CharacterEditor
      characterId="character-1"
      onBackToCharacter={onBackToCharacter}
      services={services}
      storyId="story-1"
    />,
  )
}

describe('CharacterEditor', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('loads the story and character context into a full-page edit form', async () => {
    const services = createServices()

    renderCharacterEditor({ services })

    expect(await screen.findByRole('heading', { name: 'Edit Mira' })).toBeTruthy()
    expect(screen.getByText('The Old Road')).toBeTruthy()
    expect(screen.getByDisplayValue('Mira')).toBeTruthy()
    expect(screen.getByDisplayValue('32')).toBeTruthy()
    expect(services.getStoryById).toHaveBeenCalledWith('story-1')
    expect(services.getCharacterById).toHaveBeenCalledWith('character-1')
  })

  it('falls back to generic ready context when story or character are absent', () => {
    const moveProperty = vi.fn()
    const removeProperty = vi.fn()

    render(
      <CharacterEditorContent
        characterEditor={
          {
            addProperty: vi.fn(),
            canSave: true,
            character: undefined,
            draft: {
              gender: 'female',
              name: 'Mira',
              properties: [
                { id: 'property-1', key: 'age', value: '32' },
                { id: 'property-2', key: 'role', value: 'Guide' },
              ],
            },
            errorMessage: undefined,
            hasUnsavedChanges: false,
            isSaving: false,
            moveProperty,
            removeProperty,
            saveCharacter: vi.fn(),
            setGender: vi.fn(),
            setName: vi.fn(),
            status: 'ready',
            story: undefined,
            updateProperty: vi.fn(),
          } as unknown as ReturnType<typeof useCharacterEditor>
        }
        titleId="character-editor-title"
      />,
    )

    expect(screen.getByText('Story')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Edit Character' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /move role up/i }))
    fireEvent.click(screen.getByRole('button', { name: /move age down/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /remove/i })[0])

    expect(moveProperty).toHaveBeenCalledWith('property-2', -1)
    expect(moveProperty).toHaveBeenCalledWith('property-1', 1)
    expect(removeProperty).toHaveBeenCalledWith('property-1')
  })

  it('shows missing story and missing character states', async () => {
    const { rerender } = render(
      <CharacterEditor
        characterId="character-1"
        onBackToCharacter={vi.fn()}
        services={createServices({ story: undefined })}
        storyId="story-1"
      />,
    )

    expect(
      await screen.findByText(
        'This story may have been deleted or is unavailable in this browser.',
      ),
    ).toBeTruthy()

    rerender(
      <CharacterEditor
        characterId="character-1"
        onBackToCharacter={vi.fn()}
        services={createServices({ character: undefined })}
        storyId="story-1"
      />,
    )

    expect(await screen.findByText('Character could not be found.')).toBeTruthy()
  })

  it('shows load and save failures inside the edit page', async () => {
    const failingLoadServices = {
      ...createServices(),
      getStoryById: vi.fn(() => Promise.reject(new Error('Could not load.'))),
    }
    const { rerender } = render(
      <CharacterEditor
        characterId="character-1"
        onBackToCharacter={vi.fn()}
        services={failingLoadServices}
        storyId="story-1"
      />,
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not load.',
    )

    const failingSaveServices = {
      ...createServices(),
      updateCharacter: vi.fn(() =>
        Promise.reject(new Error('Could not save character.')),
      ),
    }
    rerender(
      <CharacterEditor
        characterId="character-1"
        onBackToCharacter={vi.fn()}
        services={failingSaveServices}
        storyId="story-1"
      />,
    )

    await screen.findByRole('heading', { name: 'Edit Mira' })
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mira Changed' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not save character.',
    )
  })

  it('saves edits and redirects to Character detail', async () => {
    const services = createServices()
    const onBackToCharacter = vi.fn()

    renderCharacterEditor({ onBackToCharacter, services })

    await screen.findByRole('heading', { name: 'Edit Mira' })
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: ' Mira Changed ' },
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
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(services.updateCharacter).toHaveBeenCalledWith('character-1', {
        gender: 'male',
        name: 'Mira Changed',
        properties: [
          { key: 'appearance', value: 'Silver hair' },
          { key: 'age', value: '32' },
          { key: 'relationship', value: 'Sister of Rowan' },
          { key: 'empty value', value: 'trimmed' },
        ],
      })
    })
    expect(onBackToCharacter).toHaveBeenCalledWith('story-1', 'character-1')
  })

  it('saves through form submit', async () => {
    const services = createServices()

    renderCharacterEditor({ services })

    await screen.findByRole('heading', { name: 'Edit Mira' })
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mira Submitted' },
    })
    const characterForm = screen.getByLabelText('Name').closest('form')

    if (!characterForm) {
      throw new Error('Character form was not found.')
    }

    fireEvent.submit(characterForm)

    await waitFor(() => {
      expect(services.updateCharacter).toHaveBeenCalledWith(
        'character-1',
        expect.objectContaining({ name: 'Mira Submitted' }),
      )
    })
  })

  it('requires a non-empty name before saving', async () => {
    const services = createServices()

    renderCharacterEditor({ services })

    await screen.findByRole('heading', { name: 'Edit Mira' })
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect(services.updateCharacter).not.toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: /^save$/i }).hasAttribute('disabled'),
    ).toBe(true)
  })

  it('confirms cancel and back navigation when the draft is dirty', async () => {
    const onBackToCharacter = vi.fn()

    renderCharacterEditor({ onBackToCharacter })

    await screen.findByRole('heading', { name: 'Edit Mira' })
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

    expect(onBackToCharacter).toHaveBeenCalledWith('story-1', 'character-1')
  })

  it('cancels pending navigation and leaves clean pages without confirmation', async () => {
    const onBackToCharacter = vi.fn()

    renderCharacterEditor({ onBackToCharacter })

    await screen.findByRole('heading', { name: 'Edit Mira' })
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mira Changed' },
    })
    fireEvent.click(screen.getByRole('button', { name: /character detail/i }))
    fireEvent.click(
      within(
        await screen.findByRole('dialog', {
          name: 'Discard Character Changes?',
        }),
      ).getByRole('button', { name: /cancel/i }),
    )
    expect(onBackToCharacter).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mira' },
    })
    fireEvent.click(screen.getByRole('button', { name: /character detail/i }))
    expect(onBackToCharacter).toHaveBeenCalledWith('story-1', 'character-1')
  })

  it('prevents beforeunload only while the draft is dirty', async () => {
    renderCharacterEditor()

    await screen.findByRole('heading', { name: 'Edit Mira' })
    const unchangedEvent = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(unchangedEvent)
    expect(unchangedEvent.defaultPrevented).toBe(false)

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mira Changed' },
    })
    const changedEvent = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(changedEvent)
    expect(changedEvent.defaultPrevented).toBe(true)
  })
})
