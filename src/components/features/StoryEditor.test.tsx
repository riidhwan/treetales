import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StoryEditor } from '@/components/features/StoryEditor'
import type { Story, UpdateStoryInput } from '@/services/types'

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
    getStoryById: vi.fn(() => Promise.resolve(story)),
    updateStory: vi.fn((storyId: string, input: UpdateStoryInput) => {
      if (!story || story.id !== storyId) {
        return Promise.resolve(undefined)
      }

      story = {
        ...story,
        ...input,
        updatedAt: 200,
      }

      return Promise.resolve(story)
    }),
  }
}

function renderEditor({
  onOpenDashboard = vi.fn(),
  onReadStory = vi.fn(),
  services = createServices(),
}: {
  readonly onOpenDashboard?: () => void
  readonly onReadStory?: (storyId: string) => void
  readonly services?: ReturnType<typeof createServices>
} = {}) {
  return render(
    <StoryEditor
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

describe('StoryEditor', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows a loading state while the story loads', () => {
    const pendingStory = deferred<Story>()
    const services = createServices()
    services.getStoryById.mockReturnValue(pendingStory.promise)

    renderEditor({ services })

    expect(screen.getByText('Loading story...')).toBeTruthy()

    pendingStory.resolve(createStory())
  })

  it('loads story fields for editing', async () => {
    const services = createServices()

    renderEditor({ services })

    expect(await screen.findByRole('heading', { name: 'The Old Road' }))
      .toBeTruthy()
    expect(screen.getByLabelText('Title')).toHaveProperty(
      'value',
      'The Old Road',
    )
    expect(screen.getByLabelText('Description')).toHaveProperty(
      'value',
      'A choice in the woods',
    )
    expect(screen.getByText(/chapter editing is not available yet/i)).toBeTruthy()
  })

  it('saves trimmed title and description values', async () => {
    const services = createServices()

    renderEditor({ services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '  River Fork  ' },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: '  Two paths over the water  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save story/i }))

    await waitFor(() => {
      expect(services.updateStory).toHaveBeenCalledWith('story-1', {
        title: 'River Fork',
        description: 'Two paths over the water',
      })
    })
    expect((await screen.findByRole('status')).textContent).toBe('Story saved.')
  })

  it('reflects returned story data after save', async () => {
    const services = createServices()
    services.updateStory.mockResolvedValue(
      createStory({
        title: 'Saved Title',
        description: 'Saved description from storage',
        updatedAt: 300,
      }),
    )

    renderEditor({ services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Draft Title' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save story/i }))

    expect(await screen.findByRole('heading', { name: 'Saved Title' }))
      .toBeTruthy()
    expect(screen.getByLabelText('Title')).toHaveProperty(
      'value',
      'Saved Title',
    )
    expect(screen.getByLabelText('Description')).toHaveProperty(
      'value',
      'Saved description from storage',
    )
  })

  it('disables save when the title is blank', async () => {
    const services = createServices()

    renderEditor({ services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '   ' },
    })

    const saveButton = screen.getByRole('button', { name: /save story/i })
    expect(saveButton).toHaveProperty('disabled', true)
    fireEvent.click(saveButton)

    expect(services.updateStory).not.toHaveBeenCalled()
  })

  it('shows a missing story state with dashboard navigation', async () => {
    const onOpenDashboard = vi.fn()
    const services = createServices({ story: undefined })

    renderEditor({ onOpenDashboard, services })

    expect(await screen.findByText('Story not found')).toBeTruthy()
    expect(
      screen.getByText(
        'This story may have been deleted or is unavailable in this browser.',
      ),
    ).toBeTruthy()

    fireEvent.click(screen.getAllByRole('button', { name: 'Dashboard' })[0])

    expect(onOpenDashboard).toHaveBeenCalled()
  })

  it('shows a load failure message', async () => {
    const services = createServices()
    services.getStoryById.mockRejectedValue(new Error('Could not load story.'))

    renderEditor({ services })

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not load story.',
    )
  })

  it('shows a save failure message', async () => {
    const services = createServices()
    services.updateStory.mockRejectedValue(new Error('Could not save story.'))

    renderEditor({ services })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'River Fork' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save story/i }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not save story.',
    )
  })

  it('calls dashboard and read navigation callbacks', async () => {
    const onOpenDashboard = vi.fn()
    const onReadStory = vi.fn()

    renderEditor({ onOpenDashboard, onReadStory })

    await screen.findByRole('heading', { name: 'The Old Road' })
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }))
    fireEvent.click(screen.getByRole('button', { name: 'Read' }))

    expect(onOpenDashboard).toHaveBeenCalled()
    expect(onReadStory).toHaveBeenCalledWith('story-1')
  })
})
