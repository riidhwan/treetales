import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StoryEditor } from '@/components/features/StoryEditor'
import type {
  Chapter,
  CreateChapterInput,
  Story,
  UpdateStoryInput,
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

function createChapter(overrides: Partial<Chapter> = {}): Chapter {
  return {
    id: 'chapter-1',
    storyId: 'story-1',
    title: 'Introduction',
    content: '',
    parentChapterId: null,
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

interface CreateServicesOptions {
  readonly chapters?: Chapter[]
  readonly story?: Story
}

function createServices(options?: CreateServicesOptions) {
  let story = options && 'story' in options ? options.story : createStory()
  let chapters = options?.chapters ?? []

  return {
    createChapter: vi.fn((input: CreateChapterInput) => {
      const chapter = createChapter({
        id: `chapter-${chapters.length + 1}`,
        ...input,
        createdAt: 200,
        updatedAt: 200,
      })
      chapters = [...chapters, chapter]

      return Promise.resolve(chapter)
    }),
    getIntroChapterByStoryId: vi.fn((storyId: string) =>
      Promise.resolve(
        chapters
          .filter(
            (chapter) =>
              chapter.storyId === storyId && chapter.parentChapterId === null,
          )
          .sort((left, right) => left.createdAt - right.createdAt)[0],
      ),
    ),
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
  onEditChapter = vi.fn(),
  onOpenDashboard = vi.fn(),
  onReadStory = vi.fn(),
  services = createServices(),
}: {
  readonly onEditChapter?: (storyId: string, chapterId: string) => void
  readonly onOpenDashboard?: () => void
  readonly onReadStory?: (storyId: string) => void
  readonly services?: ReturnType<typeof createServices>
} = {}) {
  return render(
    <StoryEditor
      onEditChapter={onEditChapter}
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
    expect(screen.getByRole('heading', { name: 'Intro Chapter' })).toBeTruthy()
    expect(screen.getByText('Start with an intro chapter')).toBeTruthy()
  })

  it('shows only the intro chapter when child chapters exist', async () => {
    const services = createServices({
      chapters: [
        createChapter({ id: 'chapter-intro', title: 'Awakening' }),
        createChapter({
          id: 'chapter-child',
          parentChapterId: 'chapter-intro',
          title: 'Forest Path',
        }),
      ],
    })

    renderEditor({ services })

    expect(await screen.findByRole('heading', { name: 'Awakening' }))
      .toBeTruthy()
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Forest Path' })).toBeNull()
    })
    expect(screen.getByText('Intro chapter')).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: /add intro chapter/i }),
    ).toBeNull()
  })

  it('creates one intro chapter and opens it for editing', async () => {
    const onEditChapter = vi.fn()
    const services = createServices()

    renderEditor({ onEditChapter, services })

    await screen.findByText('Start with an intro chapter')
    fireEvent.change(screen.getByLabelText('Intro chapter title'), {
      target: { value: '  First Light  ' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /add intro chapter/i }),
    )

    await waitFor(() => {
      expect(services.createChapter).toHaveBeenCalledWith({
        content: '',
        parentChapterId: null,
        storyId: 'story-1',
        title: 'First Light',
      })
    })
    expect(await screen.findByRole('heading', { name: 'First Light' }))
      .toBeTruthy()
    expect(screen.queryByText('Start with an intro chapter')).toBeNull()
    expect(onEditChapter).toHaveBeenCalledWith('story-1', 'chapter-1')
  })

  it('requires an intro chapter title before creating one', async () => {
    const services = createServices()

    renderEditor({ services })

    await screen.findByText('Start with an intro chapter')
    fireEvent.change(screen.getByLabelText('Intro chapter title'), {
      target: { value: '   ' },
    })

    const createButton = screen.getByRole('button', {
      name: /add intro chapter/i,
    })
    expect(createButton).toHaveProperty('disabled', true)
    fireEvent.click(createButton)

    expect(services.createChapter).not.toHaveBeenCalled()
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

  it('opens an existing chapter for editing', async () => {
    const onEditChapter = vi.fn()
    const services = createServices({
      chapters: [createChapter({ id: 'chapter-existing' })],
    })

    renderEditor({ onEditChapter, services })

    await screen.findByRole('heading', { name: 'Introduction' })
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEditChapter).toHaveBeenCalledWith('story-1', 'chapter-existing')
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

  it('shows an intro chapter creation failure message', async () => {
    const services = createServices()
    services.createChapter.mockRejectedValue(
      new Error('Could not create chapter.'),
    )

    renderEditor({ services })

    await screen.findByText('Start with an intro chapter')
    fireEvent.click(
      screen.getByRole('button', { name: /add intro chapter/i }),
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not create chapter.',
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
