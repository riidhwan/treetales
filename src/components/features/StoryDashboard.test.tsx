import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StoryDashboard } from '@/components/features/StoryDashboard'
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

function createServices(
  initialStories: Story[],
  chapterCounts: Record<string, number>,
) {
  let stories = [...initialStories]

  return {
    createStory: vi.fn(async (input: CreateStoryInput) => {
      const story = createStory({
        id: `story-${stories.length + 1}`,
        title: input.title,
        description: input.description,
        createdAt: 300,
        updatedAt: 300,
      })

      stories = [...stories, story]

      return story
    }),
    deleteStory: vi.fn(async (id: string) => {
      stories = stories.filter((story) => story.id !== id)

      return true
    }),
    getChaptersByStoryId: vi.fn(async (storyId: string) =>
      Array.from({ length: chapterCounts[storyId] ?? 0 }),
    ),
    getStories: vi.fn(async () => stories),
  }
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
})
