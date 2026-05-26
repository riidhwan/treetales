import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StoryDetail } from '@/components/features/StoryDetail'
import { StoryDetailContent } from '@/components/features/StoryDetail/StoryDetail/StoryDetailContent'
import type {
  StoryCharacterServices,
  useStoryCharacters,
} from '@/hooks/useStoryCharacters'
import type {
  Character,
  CreateCharacterInput,
  Story,
  UpdateCharacterInput,
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

interface CreateServicesOptions {
  readonly story?: Story
}

function createServices(options?: CreateServicesOptions) {
  let story = options && 'story' in options ? options.story : createStory()

  return {
    deleteStory: vi.fn((storyId: string) => {
      if (!story || story.id !== storyId) {
        return Promise.resolve(false)
      }

      story = undefined
      return Promise.resolve(true)
    }),
    getStoryById: vi.fn(() => Promise.resolve(story)),
  }
}

function createCharacterServices(
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

function renderDetail({
  characterServices = createCharacterServices([]),
  onDeleted = vi.fn(),
  onEditStory = vi.fn(),
  onOpenCharacter = vi.fn(),
  onOpenDashboard = vi.fn(),
  onReadStory = vi.fn(),
  services = createServices(),
}: {
  readonly characterServices?: ReturnType<typeof createCharacterServices>
  readonly onDeleted?: () => void
  readonly onEditStory?: (storyId: string) => void
  readonly onOpenCharacter?: (storyId: string, characterId: string) => void
  readonly onOpenDashboard?: () => void
  readonly onReadStory?: (storyId: string) => void
  readonly services?: ReturnType<typeof createServices>
} = {}) {
  return render(
    <StoryDetail
      characterServices={characterServices}
      onDeleted={onDeleted}
      onEditStory={onEditStory}
      onOpenCharacter={onOpenCharacter}
      onOpenDashboard={onOpenDashboard}
      onReadStory={onReadStory}
      services={services}
      storyId="story-1"
    />,
  )
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

describe('StoryDetail', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows a loading state while the story loads', () => {
    const pendingStory = deferred<Story>()
    const services = createServices()
    services.getStoryById.mockReturnValue(pendingStory.promise)

    renderDetail({ services })

    expect(screen.getByText('Loading story...')).toBeTruthy()

    pendingStory.resolve(createStory())
  })

  it('shows the story title, description, and actions', async () => {
    const services = createServices()

    renderDetail({ services })

    expect(await screen.findByRole('heading', { name: 'The Old Road' }))
      .toBeTruthy()
    expect(screen.getByText('A choice in the woods')).toBeTruthy()
    expect(screen.getByRole('button', { name: /read/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /edit/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /delete/i })).toBeTruthy()
  })

  it('shows a characters empty state for loaded stories', async () => {
    const characterServices = createCharacterServices([])

    renderDetail({ characterServices })

    expect(await screen.findByText('Characters')).toBeTruthy()
    expect(await screen.findByText('No characters yet')).toBeTruthy()
    expect(characterServices.getCharactersByStoryId).toHaveBeenCalledWith(
      'story-1',
    )
  })

  it('shows a scoped loading state while characters load', async () => {
    const pendingCharacters = deferred<Character[]>()
    const characterServices = {
      ...createCharacterServices([]),
      getCharactersByStoryId: vi.fn(() => pendingCharacters.promise),
    }

    renderDetail({ characterServices })

    expect(await screen.findByText('Loading characters...')).toBeTruthy()

    pendingCharacters.resolve([])
  })

  it('shows scoped character load failures', async () => {
    const characterServices = {
      ...createCharacterServices([]),
      getCharactersByStoryId: vi.fn(() =>
        Promise.reject(new Error('Could not load characters.')),
      ),
    }

    renderDetail({ characterServices })

    expect(await screen.findByText('Could not load characters.')).toBeTruthy()
  })

  it('shows fixed character cards with truncated property previews', async () => {
    const characterServices = createCharacterServices([createCharacter()])

    renderDetail({ characterServices })

    expect(await screen.findByRole('button', { name: 'View Mira' })).toBeTruthy()
    expect(screen.getByText('Female')).toBeTruthy()
    expect(screen.getByText('age')).toBeTruthy()
    expect(screen.getByText('+1 more')).toBeTruthy()
    expect(screen.queryByText('relationship')).toBeNull()
  })

  it('shows male character cards without a remaining-count indicator', async () => {
    const characterServices = createCharacterServices([
      createCharacter({
        gender: 'male',
        properties: [{ key: 'role', value: 'Guide' }],
      }),
    ])

    renderDetail({ characterServices })

    expect(await screen.findByRole('button', { name: 'View Mira' })).toBeTruthy()
    expect(screen.getByText('Male')).toBeTruthy()
    expect(screen.queryByText(/\+\d+ more/)).toBeNull()
  })

  it('opens the selected character detail page from a character card', async () => {
    const characterServices = createCharacterServices([createCharacter()])
    const onOpenCharacter = vi.fn()

    renderDetail({ characterServices, onOpenCharacter })

    fireEvent.click(await screen.findByRole('button', { name: 'View Mira' }))

    expect(onOpenCharacter).toHaveBeenCalledWith('story-1', 'character-1')
  })

  it('creates a character from the story detail dialog', async () => {
    const characterServices = createCharacterServices([])

    renderDetail({ characterServices })

    await screen.findByText('Characters')
    fireEvent.click(screen.getByRole('button', { name: /add character/i }))
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
    const characterForm = screen.getByLabelText('Name').closest('form')

    if (!characterForm) {
      throw new Error('Character form was not found.')
    }

    fireEvent.submit(characterForm)

    await waitFor(() => {
      expect(characterServices.createCharacter).toHaveBeenCalledWith({
        storyId: 'story-1',
        name: 'Mira',
        gender: 'female',
        properties: [{ key: 'age', value: '32' }],
      })
    })
    expect(await screen.findByRole('dialog', { name: 'Mira' })).toBeTruthy()
  })

  it('shows character creation failures inside the open dialog', async () => {
    const characterServices = {
      ...createCharacterServices([]),
      createCharacter: vi.fn(() =>
        Promise.reject(new Error('Could not create character.')),
      ),
    }

    renderDetail({ characterServices })

    await screen.findByText('Characters')
    fireEvent.click(screen.getByRole('button', { name: /add character/i }))
    const dialog = screen.getByRole('dialog', { name: 'Add Character' })
    fireEvent.change(within(dialog).getByLabelText('Name'), {
      target: { value: 'Mira' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: /^save$/i }))

    expect((await within(dialog).findByRole('alert')).textContent).toBe(
      'Could not create character.',
    )
  })

  it('confirms before discarding unsaved character creation', async () => {
    renderDetail()

    await screen.findByText('Characters')
    fireEvent.click(screen.getByRole('button', { name: /add character/i }))
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

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('supports character view dialog edit and delete actions', async () => {
    const characterServices = createCharacterServices([])
    const pendingDelete = deferred<boolean>()
    vi.mocked(characterServices.deleteCharacter).mockReturnValueOnce(
      pendingDelete.promise,
    )

    renderDetail({ characterServices })

    await screen.findByText('Characters')
    fireEvent.click(screen.getByRole('button', { name: /add character/i }))
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mira' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    const dialog = await screen.findByRole('dialog', { name: 'Mira' })

    fireEvent.click(within(dialog).getByRole('button', { name: /^edit$/i }))
    expect(screen.getByRole('dialog', { name: 'Edit Mira' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    const updatedDialog = await screen.findByRole('dialog', { name: 'Mira' })
    fireEvent.click(within(updatedDialog).getByRole('button', { name: /delete/i }))
    const confirmation = await screen.findByRole('dialog', {
      name: 'Delete Character?',
    })
    fireEvent.click(
      within(confirmation).getByRole('button', { name: /delete character/i }),
    )
    expect(within(confirmation).getByRole('button', { name: /deleting/i }))
      .toBeTruthy()

    pendingDelete.resolve(true)
    await waitFor(() => {
      expect(characterServices.deleteCharacter).toHaveBeenCalledWith(
        'character-created',
      )
    })
  }, 10_000)

  it('opens the story editor from an empty description affordance', async () => {
    const onEditStory = vi.fn()
    const services = createServices({
      story: createStory({ description: '' }),
    })

    renderDetail({ onEditStory, services })

    const emptySummary = await screen.findByRole('button', {
      name: /no description yet - tap to add one/i,
    })
    fireEvent.click(emptySummary)

    expect(onEditStory).toHaveBeenCalledWith('story-1')
  })

  it('shows a fallback when the story has no title', async () => {
    const services = createServices({
      story: createStory({ title: '' }),
    })

    renderDetail({ services })

    expect(await screen.findByRole('heading', { name: 'Untitled story' }))
      .toBeTruthy()
  })

  it('navigates to read and edit flows', async () => {
    const onEditStory = vi.fn()
    const onReadStory = vi.fn()
    const services = createServices()

    renderDetail({ onEditStory, onReadStory, services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.click(screen.getByRole('button', { name: /read/i }))
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))

    expect(onReadStory).toHaveBeenCalledWith('story-1')
    expect(onEditStory).toHaveBeenCalledWith('story-1')
  })

  it('shows a missing story state', async () => {
    const services = createServices({ story: undefined })
    const onOpenDashboard = vi.fn()

    renderDetail({ onOpenDashboard, services })

    expect(await screen.findByRole('heading', { name: 'Story not found' }))
      .toBeTruthy()
    expect(
      screen.getByText(
        'This story may have been deleted or is unavailable in this browser.',
      ),
    ).toBeTruthy()

    fireEvent.click(screen.getAllByRole('button', { name: /dashboard/i })[0])

    expect(onOpenDashboard).toHaveBeenCalled()
  })

  it('shows load failures', async () => {
    const services = createServices()
    services.getStoryById.mockRejectedValue(new Error('Could not load story.'))

    renderDetail({ services })

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not load story.',
    )
  })

  it('deletes the story after confirmation and returns to the dashboard', async () => {
    const onDeleted = vi.fn()
    const services = createServices()

    renderDetail({ onDeleted, services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    const confirmation = await screen.findByRole('dialog', {
      name: 'Delete Story?',
    })
    expect(confirmation.textContent).toContain(
      'Delete "The Old Road"? This cannot be undone.',
    )
    fireEvent.click(
      within(confirmation).getByRole('button', { name: /delete story/i }),
    )

    await waitFor(() => {
      expect(services.deleteStory).toHaveBeenCalledWith('story-1')
    })
    expect(onDeleted).toHaveBeenCalled()
  })

  it('shows deleting state while deletion is pending', async () => {
    const pendingDelete = deferred<boolean>()
    const services = createServices()
    services.deleteStory.mockReturnValue(pendingDelete.promise)

    renderDetail({ services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    const confirmation = await screen.findByRole('dialog', {
      name: 'Delete Story?',
    })
    fireEvent.click(
      within(confirmation).getByRole('button', { name: /delete story/i }),
    )

    expect(within(confirmation).getByRole('button', { name: /deleting/i }))
      .toBeTruthy()

    pendingDelete.resolve(true)
  })

  it('keeps the story when deletion is cancelled', async () => {
    const onDeleted = vi.fn()
    const services = createServices()

    renderDetail({ onDeleted, services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    const confirmation = await screen.findByRole('dialog', {
      name: 'Delete Story?',
    })
    fireEvent.click(within(confirmation).getByRole('button', { name: /cancel/i }))

    expect(services.deleteStory).not.toHaveBeenCalled()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('stays on the detail page when deletion fails', async () => {
    const onDeleted = vi.fn()
    const services = createServices()
    services.deleteStory.mockRejectedValue(new Error('Could not delete story.'))

    renderDetail({ onDeleted, services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    const confirmation = await screen.findByRole('dialog', {
      name: 'Delete Story?',
    })
    fireEvent.click(
      within(confirmation).getByRole('button', { name: /delete story/i }),
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not delete story.',
    )
    expect(onDeleted).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'The Old Road' })).toBeTruthy()
  })

  it('renders nothing when ready detail content has no story context', () => {
    const view = render(
      <StoryDetailContent
        characterDialog={{} as ReturnType<typeof useStoryCharacters>}
        characterTitleId="characters-title"
        isDeleting={false}
        onEditStory={vi.fn()}
        onOpenCharacter={vi.fn()}
        onOpenDashboard={vi.fn()}
        onOpenDeleteDialog={vi.fn()}
        status="ready"
      />,
    )

    expect(view.container.textContent).toBe('')
  })
})
