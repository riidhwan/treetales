import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChapterCreator } from '@/components/features/ChapterCreator'
import type { Chapter, CreateChapterInput, Story } from '@/services/types'

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
    title: 'The Gate',
    content: 'The path begins here.',
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
  let chapters = options?.chapters ?? [createChapter()]
  const story = options && 'story' in options ? options.story : createStory()

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
    getChapterById: vi.fn((chapterId: string) =>
      Promise.resolve(chapters.find((chapter) => chapter.id === chapterId)),
    ),
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
    getStoryById: vi.fn((storyId: string) =>
      Promise.resolve(story?.id === storyId ? story : undefined),
    ),
  }
}

function renderChapterCreator({
  intro = false,
  onChapterCreated = vi.fn(),
  onOpenDashboard = vi.fn(),
  onOpenParentChapter = vi.fn(),
  onOpenStoryEditor = vi.fn(),
  parentChapterId = 'chapter-1',
  services = createServices(),
}: {
  readonly intro?: boolean
  readonly onChapterCreated?: (storyId: string, chapterId: string) => void
  readonly onOpenDashboard?: () => void
  readonly onOpenParentChapter?: (storyId: string, chapterId: string) => void
  readonly onOpenStoryEditor?: (storyId: string) => void
  readonly parentChapterId?: string
  readonly services?: ReturnType<typeof createServices>
} = {}) {
  return render(
    <ChapterCreator
      onChapterCreated={onChapterCreated}
      onOpenDashboard={onOpenDashboard}
      onOpenParentChapter={onOpenParentChapter}
      onOpenStoryEditor={onOpenStoryEditor}
      parentChapterId={intro ? undefined : parentChapterId}
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

describe('ChapterCreator', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows a loading state while the parent chapter loads', () => {
    const pendingStory = deferred<Story>()
    const services = createServices()
    services.getStoryById.mockReturnValue(pendingStory.promise)

    renderChapterCreator({ services })

    expect(screen.getByText('Loading parent chapter...')).toBeTruthy()

    pendingStory.resolve(createStory())
  })

  it('renders title and content fields for a valid parent chapter', async () => {
    renderChapterCreator()

    expect(
      await screen.findByRole('heading', { name: 'Add Child Chapter' }),
    ).toBeTruthy()
    expect(screen.getByText('Follows The Gate.')).toBeTruthy()
    expect(screen.getByLabelText('Title')).toHaveProperty('value', '')
    expect(screen.getByLabelText('Content')).toHaveProperty('value', '')
  })

  it('requires a title before creating a child chapter', async () => {
    const services = createServices()

    renderChapterCreator({ services })

    await screen.findByRole('heading', { name: 'Add Child Chapter' })

    const createButton = screen.getByRole('button', {
      name: /create chapter/i,
    })
    expect(createButton).toHaveProperty('disabled', true)
    fireEvent.click(createButton)

    expect(services.createChapter).not.toHaveBeenCalled()
  })

  it('creates a child chapter with title and content and opens it', async () => {
    const onChapterCreated = vi.fn()
    const services = createServices()

    renderChapterCreator({ onChapterCreated, services })

    await screen.findByRole('heading', { name: 'Add Child Chapter' })
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '  The Cellar  ' },
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'The stairs creak.' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /create chapter/i }),
    )

    await waitFor(() => {
      expect(services.createChapter).toHaveBeenCalledWith({
        content: 'The stairs creak.',
        parentChapterId: 'chapter-1',
        storyId: 'story-1',
        title: 'The Cellar',
      })
    })
    expect(onChapterCreated).toHaveBeenCalledWith('story-1', 'chapter-2')
  })

  it('creates an intro chapter with title and content and opens it', async () => {
    const onChapterCreated = vi.fn()
    const services = createServices({ chapters: [] })

    renderChapterCreator({
      intro: true,
      onChapterCreated,
      services,
    })

    expect(
      await screen.findByRole('heading', { name: 'Add Intro Chapter' }),
    ).toBeTruthy()
    expect(
      screen.getByText('This is the first chapter readers will see.'),
    ).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '  First Light  ' },
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'Morning finds the road.' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /create chapter/i }),
    )

    await waitFor(() => {
      expect(services.createChapter).toHaveBeenCalledWith({
        content: 'Morning finds the road.',
        parentChapterId: null,
        storyId: 'story-1',
        title: 'First Light',
      })
    })
    expect(onChapterCreated).toHaveBeenCalledWith('story-1', 'chapter-1')
  })

  it('does not show the intro creation form when an intro already exists', async () => {
    const services = createServices({
      chapters: [createChapter({ title: 'Existing Intro' })],
    })

    renderChapterCreator({ intro: true, services })

    expect(await screen.findByText('Existing Intro')).toBeTruthy()
    expect(
      screen.getByText('This story already has an intro chapter.'),
    ).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: /create chapter/i }),
    ).toBeNull()
    expect(services.createChapter).not.toHaveBeenCalled()
  })

  it('shows a missing story state', async () => {
    const services = createServices({ story: undefined })

    renderChapterCreator({ services })

    expect(await screen.findByText('Story not found')).toBeTruthy()
    expect(
      screen.getByText(
        'This story may have been deleted or is unavailable in this browser.',
      ),
    ).toBeTruthy()
  })

  it('shows a missing parent chapter state', async () => {
    const services = createServices({ chapters: [] })

    renderChapterCreator({ services })

    expect(await screen.findByText('Parent chapter not found')).toBeTruthy()
    expect(
      screen.getByText('This chapter is not part of the selected story.'),
    ).toBeTruthy()
  })

  it('shows load and create failure messages', async () => {
    const services = createServices()
    services.getChapterById.mockRejectedValue(
      new Error('Could not load chapter.'),
    )

    renderChapterCreator({ services })

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not load chapter.',
    )

    cleanup()
    const createServicesMock = createServices()
    createServicesMock.createChapter.mockRejectedValue(
      new Error('Could not create chapter.'),
    )

    renderChapterCreator({ services: createServicesMock })

    await screen.findByRole('heading', { name: 'Add Child Chapter' })
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'The Cellar' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /create chapter/i }),
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not create chapter.',
    )
  })

  it('calls dashboard and parent chapter navigation callbacks', async () => {
    const onOpenDashboard = vi.fn()
    const onOpenParentChapter = vi.fn()

    renderChapterCreator({ onOpenDashboard, onOpenParentChapter })

    await screen.findByRole('heading', { name: 'Add Child Chapter' })
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }))
    fireEvent.click(screen.getByRole('button', { name: 'Parent Chapter' }))

    expect(onOpenDashboard).toHaveBeenCalled()
    expect(onOpenParentChapter).toHaveBeenCalledWith('story-1', 'chapter-1')
  })

  it('calls story editor navigation from intro creation', async () => {
    const onOpenStoryEditor = vi.fn()
    const services = createServices({ chapters: [] })

    renderChapterCreator({
      intro: true,
      onOpenStoryEditor,
      services,
    })

    await screen.findByRole('heading', { name: 'Add Intro Chapter' })
    fireEvent.click(screen.getByRole('button', { name: 'Story Editor' }))

    expect(onOpenStoryEditor).toHaveBeenCalledWith('story-1')
  })
})
