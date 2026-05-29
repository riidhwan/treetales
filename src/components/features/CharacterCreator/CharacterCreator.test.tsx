import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CharacterCreator } from '@/components/features/CharacterCreator'
import type { Character, CreateCharacterInput, Story } from '@/services/types'
import type { CharacterCreatorServices } from '@/hooks/useCharacterCreator'

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
    properties: [],
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

function renderCharacterCreator({
  onBackToStory = vi.fn(),
  onCreated = vi.fn(),
  services = createServices(),
}: {
  readonly onBackToStory?: (storyId: string) => void
  readonly onCreated?: (storyId: string, characterId: string) => void
  readonly services?: CharacterCreatorServices
} = {}) {
  return render(
    <CharacterCreator
      onBackToStory={onBackToStory}
      onCreated={onCreated}
      services={services}
      storyId="story-1"
    />,
  )
}

describe('CharacterCreator', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('loads the story context and renders a full-page Character form', async () => {
    renderCharacterCreator()

    expect(await screen.findByRole('heading', { name: 'Add Character' }))
      .toBeTruthy()
    expect(screen.getByText('The Old Road')).toBeTruthy()
    expect(screen.getByLabelText('Name')).toBeTruthy()
    expect(screen.getByLabelText('Gender')).toBeTruthy()
  })

  it('shows missing story state', async () => {
    renderCharacterCreator({ services: createServices({ story: undefined }) })

    expect((await screen.findByRole('alert')).textContent).toBe(
      'This story may have been deleted or is unavailable in this browser.',
    )
  })

  it('shows story load failures', async () => {
    const services = {
      ...createServices(),
      getStoryById: vi.fn(() => Promise.reject(new Error('Could not load.'))),
    }

    renderCharacterCreator({ services })

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not load.',
    )
  })

  it('shows creation failures inside the form page', async () => {
    const services = {
      ...createServices(),
      createCharacter: vi.fn(() =>
        Promise.reject(new Error('Could not create character.')),
      ),
    }

    renderCharacterCreator({ services })

    await screen.findByRole('heading', { name: 'Add Character' })
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mira' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not create character.',
    )
  })

  it('saves a new Character and redirects to Character detail', async () => {
    const services = createServices()
    const onCreated = vi.fn()

    renderCharacterCreator({ onCreated, services })

    await screen.findByRole('heading', { name: 'Add Character' })
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: ' Mira ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /add property/i }))
    fireEvent.change(screen.getByLabelText('Key'), {
      target: { value: ' age ' },
    })
    fireEvent.change(screen.getByLabelText('Value'), {
      target: { value: ' 32 ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(services.createCharacter).toHaveBeenCalledWith({
        storyId: 'story-1',
        name: 'Mira',
        gender: 'female',
        properties: [{ key: 'age', value: '32' }],
      })
    })
    expect(onCreated).toHaveBeenCalledWith('story-1', 'character-created')
  })

  it('saves through form submit', async () => {
    const services = createServices()

    renderCharacterCreator({ services })

    await screen.findByRole('heading', { name: 'Add Character' })
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mira' },
    })
    const characterForm = screen.getByLabelText('Name').closest('form')

    if (!characterForm) {
      throw new Error('Character form was not found.')
    }

    fireEvent.submit(characterForm)

    await waitFor(() => {
      expect(services.createCharacter).toHaveBeenCalled()
    })
  })

  it('confirms cancel and back navigation when the draft is dirty', async () => {
    const onBackToStory = vi.fn()

    renderCharacterCreator({ onBackToStory })

    await screen.findByRole('heading', { name: 'Add Character' })
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mira' },
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

    expect(onBackToStory).toHaveBeenCalledWith('story-1')
  })

  it('cancels pending navigation and leaves clean pages without confirmation', async () => {
    const onBackToStory = vi.fn()

    renderCharacterCreator({ onBackToStory })

    await screen.findByRole('heading', { name: 'Add Character' })
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mira' },
    })
    fireEvent.click(screen.getByRole('button', { name: /story detail/i }))
    fireEvent.click(
      within(
        await screen.findByRole('dialog', {
          name: 'Discard Character Changes?',
        }),
      ).getByRole('button', { name: /cancel/i }),
    )
    expect(onBackToStory).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: /story detail/i }))
    expect(onBackToStory).toHaveBeenCalledWith('story-1')
  })

  it('prevents beforeunload only while the draft is dirty', async () => {
    renderCharacterCreator()

    await screen.findByRole('heading', { name: 'Add Character' })
    const unchangedEvent = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(unchangedEvent)
    expect(unchangedEvent.defaultPrevented).toBe(false)

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mira' },
    })
    const changedEvent = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(changedEvent)
    expect(changedEvent.defaultPrevented).toBe(true)
  })
})
