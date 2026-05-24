import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StoryDashboard } from '@/components/features/StoryDashboard'
import type {
  BuiltInExampleStorySummary,
  CreateOrReuseExampleStoryCopyResult,
} from '@/services/builtInExampleStories'
import type { CreateStoryInput, Story } from '@/services/types'

function createStory(overrides: Partial<Story>): Story {
  return {
    id: 'story-1',
    title: 'The Old Road',
    description: 'A choice in the woods',
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

const starterStories: BuiltInExampleStorySummary[] = [
  {
    id: 'bee-man-of-orn',
    title: 'The Bee-Man of Orn',
    description:
      'A wandering bee-keeper follows an old prophecy toward an unexpected identity.',
    storyProvenance: {
      sourceWorks: [
        {
          title: 'The Bee-Man of Orn',
          author: 'Frank R. Stockton',
          publication:
            'The Bee-Man of Orn and Other Fanciful Tales, first published 1887',
          publicDomainBasis:
            'Project Gutenberg eBook #12067, public domain in the USA.',
        },
      ],
      adaptationNote:
        'Adapted into a branching TreeTales starter from the source premise.',
      displayText:
        'Adapted from "The Bee-Man of Orn" by Frank R. Stockton, first published 1887.',
    },
  },
  {
    id: 'magicians-gifts',
    title: "The Magicians' Gifts",
    description:
      'Three gifts promise power, but each choice asks what kind of wisdom is worth keeping.',
    storyProvenance: {
      sourceWorks: [
        {
          title: "The Magicians' Gifts",
          author: 'Juliana Horatia Ewing',
          publication: 'Old-Fashioned Fairy Tales, first published 1880',
          publicDomainBasis:
            'Project Gutenberg eBook #15592, public domain in the USA.',
        },
      ],
      adaptationNote:
        'Adapted into a branching TreeTales starter from the source premise.',
      displayText:
        'Adapted from "The Magicians\' Gifts" by Juliana Horatia Ewing, first published 1880.',
    },
  },
]

function createServices(initialStories: Story[]) {
  let stories = [...initialStories]

  return {
    createOrReuseExampleStoryCopy: vi.fn((
      builtInExampleStoryId: string,
    ): Promise<CreateOrReuseExampleStoryCopyResult> => {
      const starterStory = starterStories.find(
        (starter) => starter.id === builtInExampleStoryId,
      )

      if (!starterStory) {
        return Promise.resolve({ status: 'not-found' as const })
      }

      const story = createStory({
        id: `copy-${builtInExampleStoryId}`,
        title: starterStory.title,
        description: starterStory.description,
        builtInExampleStoryId,
        storyProvenance: starterStory.storyProvenance,
        createdAt: 400,
        updatedAt: 400,
      })

      stories = [
        ...stories.filter((currentStory) => currentStory.id !== story.id),
        story,
      ]

      return Promise.resolve({
        status: 'created' as const,
        chapters: [],
        story,
      })
    }),
    createStory: vi.fn((input: CreateStoryInput) => {
      const story = createStory({
        id: `story-${stories.length + 1}`,
        title: input.title,
        description: input.description,
        createdAt: 300,
        updatedAt: 300,
      })

      stories = [...stories, story]

      return Promise.resolve(story)
    }),
    getStories: vi.fn(() => Promise.resolve(stories)),
    listBuiltInExampleStories: vi.fn(() => starterStories),
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

describe('StoryDashboard', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows prominent starter stories when no saved stories exist', async () => {
    const services = createServices([])

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect(screen.getByText('TreeTales')).toBeTruthy()
    expect(
      await screen.findByRole('heading', { name: 'Your stories' }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('heading', { name: 'Story dashboard' }),
    ).toBeNull()
    expect(
      await screen.findByRole('heading', {
        name: 'Built-in Example Stories',
      }),
    ).toBeTruthy()
    expect(
      screen.getByText(
        'Choose a starter to create an editable Example Story Copy in your library.',
      ),
    ).toBeTruthy()
    expect(screen.getByText('The Bee-Man of Orn')).toBeTruthy()
    expect(screen.getByText("The Magicians' Gifts")).toBeTruthy()
    expect(screen.getByText('No Saved Stories yet')).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: /add example story/i }),
    ).toBeNull()
  })

  it('shows a loading state while stories are loading', () => {
    const pendingStories = deferred<Story[]>()
    const services = createServices([])
    services.getStories.mockReturnValue(pendingStories.promise)

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect(screen.getByText('Loading stories...')).toBeTruthy()

    pendingStories.resolve([])
  })

  it('shows a load failure message', async () => {
    const services = createServices([])
    services.getStories.mockRejectedValue(new Error('Could not load stories.'))

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not load stories.',
    )
    expect(await screen.findByText('No Saved Stories yet')).toBeTruthy()
  })

  it('lists stories and opens story details from rows', async () => {
    const onOpenStory = vi.fn()
    const services = createServices([createStory({ id: 'story-7' })])

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={onOpenStory}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect(await screen.findByText('The Old Road')).toBeTruthy()
    expect(screen.getByText('The Bee-Man of Orn')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /open the old road/i }))

    expect(onOpenStory).toHaveBeenCalledWith('story-7')
    expect(screen.queryByRole('button', { name: /read/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /edit/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull()
  })

  it('keeps starter stories below saved stories when saved stories exist', async () => {
    const services = createServices([createStory({ id: 'story-7' })])

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect(await screen.findByText('The Old Road')).toBeTruthy()
    expect(screen.getByText('The Bee-Man of Orn')).toBeTruthy()
    expect(
      screen.getByText(
        'Start another editable copy from a built-in branching Story.',
      ),
    ).toBeTruthy()
  })

  it('toggles the story form from the saved-library create affordance', async () => {
    const services = createServices([createStory({ id: 'story-7' })])

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    const newStoryButton = await screen.findByRole('button', {
      name: /begin a new story/i,
    })

    fireEvent.click(newStoryButton)

    expect(screen.getByRole('form', { name: /new story/i })).toBeTruthy()
    expect(newStoryButton.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(newStoryButton)

    expect(screen.queryByRole('form', { name: /new story/i })).toBeNull()
    expect(newStoryButton.getAttribute('aria-expanded')).toBe('false')
  })

  it('renders empty descriptions', async () => {
    const services = createServices(
      [
        createStory({
          id: 'story-7',
          description: '',
        }),
      ],
    )

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect(await screen.findByText('No description yet.')).toBeTruthy()
  })

  it('sorts stories by updated time and then title', async () => {
    const services = createServices([
      createStory({
        id: 'story-a',
        title: 'Zebra Path',
        updatedAt: 500,
      }),
      createStory({
        id: 'story-b',
        title: 'Amber Path',
        updatedAt: 500,
      }),
      createStory({
        id: 'story-c',
        title: 'Newest Path',
        updatedAt: 700,
      }),
    ])

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    await screen.findByText('Newest Path')
    const storyRows = screen
      .getAllByRole('button', { name: /^open /i })
      .map((row) => row.getAttribute('aria-label'))

    expect(storyRows).toEqual([
      'Open Newest Path',
      'Open Amber Path',
      'Open Zebra Path',
    ])
  })

  it('creates a story and opens the editor', async () => {
    const onEditStory = vi.fn()
    const services = createServices([])

    render(
      <StoryDashboard
        onEditStory={onEditStory}
        onOpenStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    await screen.findByText('No Saved Stories yet')
    fireEvent.click(screen.getAllByRole('button', { name: /new story/i })[0])
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'River Fork' },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Two paths over the water' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create story/i }))

    await waitFor(() => {
      expect(services.createStory).toHaveBeenCalledWith({
        title: 'River Fork',
        description: 'Two paths over the water',
      })
    })
    expect(onEditStory).toHaveBeenCalledWith('story-1')
    expect(await screen.findByText('River Fork')).toBeTruthy()
  })

  it('creates an example story copy from a starter and opens the reader', async () => {
    const onReadStory = vi.fn()
    const services = createServices([])

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={onReadStory}
        services={services}
      />,
    )

    await screen.findByText('No Saved Stories yet')
    fireEvent.click(
      screen.getByRole('button', { name: /start the bee-man of orn/i }),
    )

    await waitFor(() => {
      expect(services.createOrReuseExampleStoryCopy).toHaveBeenCalledWith(
        'bee-man-of-orn',
      )
    })
    expect(onReadStory).toHaveBeenCalledWith('copy-bee-man-of-orn')
    expect(await screen.findByText('Saved stories')).toBeTruthy()
    expect(
      screen.getAllByText('The Bee-Man of Orn').length,
    ).toBeGreaterThanOrEqual(2)
  })

  it('opens the reader when a starter reuses an existing example story copy', async () => {
    const onReadStory = vi.fn()
    const services = createServices([])
    const reusedStory = createStory({
      id: 'existing-copy',
      title: 'The Bee-Man of Orn',
      description:
        'A wandering bee-keeper follows an old prophecy toward an unexpected identity.',
      builtInExampleStoryId: 'bee-man-of-orn',
      storyProvenance: starterStories[0].storyProvenance,
    })
    services.createOrReuseExampleStoryCopy.mockResolvedValue({
      status: 'reused',
      chapters: [],
      story: reusedStory,
    })

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={onReadStory}
        services={services}
      />,
    )

    await screen.findByText('No Saved Stories yet')
    fireEvent.click(
      screen.getByRole('button', { name: /start the bee-man of orn/i }),
    )

    await waitFor(() => {
      expect(onReadStory).toHaveBeenCalledWith('existing-copy')
    })
  })

  it('shows a starter copy creation failure message', async () => {
    const services = createServices([])
    services.createOrReuseExampleStoryCopy.mockRejectedValue(
      new Error('Could not open starter.'),
    )

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    await screen.findByText('No Saved Stories yet')
    fireEvent.click(
      screen.getByRole('button', { name: /start the bee-man of orn/i }),
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not open starter.',
    )
  })

  it('shows unavailable state for an unknown starter result', async () => {
    const services = createServices([])
    services.createOrReuseExampleStoryCopy.mockResolvedValue({
      status: 'not-found',
    })

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    await screen.findByText('No Saved Stories yet')
    fireEvent.click(
      screen.getByRole('button', { name: /start the bee-man of orn/i }),
    )

    expect(
      await screen.findByText('That Built-in Example Story is unavailable.'),
    ).toBeTruthy()
  })

  it('disables story creation when the title is blank', async () => {
    const services = createServices([])

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    await screen.findByText('No Saved Stories yet')
    fireEvent.click(screen.getAllByRole('button', { name: /new story/i })[0])
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '   ' },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Description only' },
    })

    const createButton = screen.getByRole('button', { name: /create story/i })
    expect(createButton).toHaveProperty('disabled', true)
    fireEvent.click(createButton)

    expect(services.createStory).not.toHaveBeenCalled()
  })

  it('shows a create failure message and keeps the form open', async () => {
    const services = createServices([])
    services.createStory.mockRejectedValue(new Error('Could not create story.'))

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onOpenStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    await screen.findByText('No Saved Stories yet')
    fireEvent.click(screen.getAllByRole('button', { name: /new story/i })[0])
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'River Fork' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create story/i }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not create story.',
    )
    expect(screen.getByRole('button', { name: /create story/i })).toBeTruthy()
  })

})
