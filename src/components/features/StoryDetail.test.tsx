import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StoryDetail } from '@/components/features/StoryDetail'
import type { Story } from '@/services/types'

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

function renderDetail({
  onDeleted = vi.fn(),
  onEditStory = vi.fn(),
  onOpenDashboard = vi.fn(),
  onReadStory = vi.fn(),
  services = createServices(),
}: {
  readonly onDeleted?: () => void
  readonly onEditStory?: (storyId: string) => void
  readonly onOpenDashboard?: () => void
  readonly onReadStory?: (storyId: string) => void
  readonly services?: ReturnType<typeof createServices>
} = {}) {
  return render(
    <StoryDetail
      onDeleted={onDeleted}
      onEditStory={onEditStory}
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

  it('shows a fallback when the story has no description', async () => {
    const services = createServices({
      story: createStory({ description: '' }),
    })

    renderDetail({ services })

    expect(await screen.findByText('No description yet.')).toBeTruthy()
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

    fireEvent.click(screen.getAllByRole('button', { name: /dashboard/i })[1])

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
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderDetail({ onDeleted, services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    await waitFor(() => {
      expect(services.deleteStory).toHaveBeenCalledWith('story-1')
    })
    expect(window.confirm).toHaveBeenCalledWith(
      'Delete "The Old Road"? This cannot be undone.',
    )
    expect(onDeleted).toHaveBeenCalled()
  })

  it('shows deleting state while deletion is pending', async () => {
    const pendingDelete = deferred<boolean>()
    const services = createServices()
    services.deleteStory.mockReturnValue(pendingDelete.promise)
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderDetail({ services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(await screen.findByRole('button', { name: /deleting/i }))
      .toBeTruthy()

    pendingDelete.resolve(true)
  })

  it('keeps the story when deletion is cancelled', async () => {
    const onDeleted = vi.fn()
    const services = createServices()
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderDetail({ onDeleted, services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(services.deleteStory).not.toHaveBeenCalled()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('stays on the detail page when deletion fails', async () => {
    const onDeleted = vi.fn()
    const services = createServices()
    services.deleteStory.mockRejectedValue(new Error('Could not delete story.'))
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderDetail({ onDeleted, services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not delete story.',
    )
    expect(onDeleted).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'The Old Road' })).toBeTruthy()
  })
})
