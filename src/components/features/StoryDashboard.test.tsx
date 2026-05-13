import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StoryDashboard } from '@/components/features/StoryDashboard'
import type { Chapter, CreateStoryInput, Story } from '@/services/types'

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

function createChapter(overrides: Partial<Chapter>): Chapter {
  return {
    id: 'chapter-1',
    storyId: 'story-1',
    title: 'Chapter',
    content: 'Content',
    parentChapterId: null,
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

function createServices(
  initialStories: Story[],
  chapterCounts: Record<string, number>,
) {
  let stories = [...initialStories]

  return {
    createExampleStory: vi.fn(() => {
      const story = createStory({
        id: 'example-story',
        title: 'The Lantern Road',
        description: 'An example branching tale',
        createdAt: 400,
        updatedAt: 400,
      })

      stories = [...stories, story]

      return Promise.resolve({
        chapters: [
          createChapter({ id: 'chapter-1', storyId: story.id }),
          createChapter({ id: 'chapter-2', storyId: story.id }),
        ],
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
    deleteStory: vi.fn((id: string) => {
      stories = stories.filter((story) => story.id !== id)

      return Promise.resolve(true)
    }),
    getChaptersByStoryId: vi.fn((storyId: string) =>
      Promise.resolve(
        Array.from({ length: chapterCounts[storyId] ?? 0 }, (_, index) =>
          createChapter({
            id: `${storyId}-chapter-${index + 1}`,
            storyId,
          }),
        ),
      ),
    ),
    getStories: vi.fn(() => Promise.resolve(stories)),
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

  it('shows an empty state when no stories exist', async () => {
    const services = createServices([], {})

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect(await screen.findByText('No stories yet')).toBeTruthy()
  })

  it('shows a loading state while stories are loading', () => {
    const pendingStories = deferred<Story[]>()
    const services = createServices([], {})
    services.getStories.mockReturnValue(pendingStories.promise)

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect(screen.getByText('Loading stories...')).toBeTruthy()

    pendingStories.resolve([])
  })

  it('shows a load failure message', async () => {
    const services = createServices([], {})
    services.getStories.mockRejectedValue(new Error('Could not load stories.'))

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not load stories.',
    )
    expect(await screen.findByText('No stories yet')).toBeTruthy()
  })

  it('lists stories with chapter counts and navigates to reader and editor', async () => {
    const onEditStory = vi.fn()
    const onReadStory = vi.fn()
    const services = createServices([createStory({ id: 'story-7' })], {
      'story-7': 2,
    })

    render(
      <StoryDashboard
        onEditStory={onEditStory}
        onReadStory={onReadStory}
        services={services}
      />,
    )

    expect(await screen.findByText('The Old Road')).toBeTruthy()
    expect(screen.getByText('2 chapters')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /read/i }))
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))

    expect(onReadStory).toHaveBeenCalledWith('story-7')
    expect(onEditStory).toHaveBeenCalledWith('story-7')
  })

  it('renders singular chapter counts and empty descriptions', async () => {
    const services = createServices(
      [
        createStory({
          id: 'story-7',
          description: '',
        }),
      ],
      { 'story-7': 1 },
    )

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect(await screen.findByText('1 chapter')).toBeTruthy()
    expect(screen.getByText('No description yet.')).toBeTruthy()
  })

  it('sorts stories by updated time and then title', async () => {
    const services = createServices(
      [
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
      ],
      {},
    )

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    await screen.findByText('Newest Path')
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)

    expect(headings).toEqual(['Newest Path', 'Amber Path', 'Zebra Path'])
  })

  it('creates a story and opens the editor', async () => {
    const onEditStory = vi.fn()
    const services = createServices([], {})

    render(
      <StoryDashboard
        onEditStory={onEditStory}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    await screen.findByText('No stories yet')
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

  it('creates the example story and opens the reader', async () => {
    const onReadStory = vi.fn()
    const services = createServices([], {})

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onReadStory={onReadStory}
        services={services}
      />,
    )

    await screen.findByText('No stories yet')
    fireEvent.click(
      screen.getByRole('button', { name: /add example story/i }),
    )

    await waitFor(() => {
      expect(services.createExampleStory).toHaveBeenCalled()
    })
    expect(onReadStory).toHaveBeenCalledWith('example-story')
    expect(await screen.findByText('The Lantern Road')).toBeTruthy()
    expect(screen.getByText('2 chapters')).toBeTruthy()
  })

  it('shows an example story creation failure message', async () => {
    const services = createServices([], {})
    services.createExampleStory.mockRejectedValue(
      new Error('Could not add example story.'),
    )

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    await screen.findByText('No stories yet')
    fireEvent.click(
      screen.getByRole('button', { name: /add example story/i }),
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not add example story.',
    )
  })

  it('disables story creation when the title is blank', async () => {
    const services = createServices([], {})

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    await screen.findByText('No stories yet')
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
    const services = createServices([], {})
    services.createStory.mockRejectedValue(new Error('Could not create story.'))

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    await screen.findByText('No stories yet')
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

  it('confirms before deleting a story', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const services = createServices([createStory({ id: 'story-9' })], {
      'story-9': 1,
    })

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect(await screen.findByText('The Old Road')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    await waitFor(() => {
      expect(services.deleteStory).toHaveBeenCalledWith('story-9')
    })
    expect(confirmSpy).toHaveBeenCalledWith(
      'Delete "The Old Road"? This cannot be undone.',
    )
    expect(screen.queryByText('The Old Road')).toBeNull()
  })

  it('does not delete when confirmation is cancelled', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const services = createServices([createStory({ id: 'story-9' })], {
      'story-9': 1,
    })

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect(await screen.findByText('The Old Road')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(services.deleteStory).not.toHaveBeenCalled()
    expect(screen.getByText('The Old Road')).toBeTruthy()
  })

  it('shows a delete failure message without removing the story', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const services = createServices([createStory({ id: 'story-9' })], {
      'story-9': 1,
    })
    services.deleteStory.mockRejectedValue(new Error('Could not delete story.'))

    render(
      <StoryDashboard
        onEditStory={vi.fn()}
        onReadStory={vi.fn()}
        services={services}
      />,
    )

    expect(await screen.findByText('The Old Road')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not delete story.',
    )
    expect(screen.getByText('The Old Road')).toBeTruthy()
  })
})
