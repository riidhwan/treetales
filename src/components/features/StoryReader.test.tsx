import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StoryReader } from '@/components/features/StoryReader'
import type { Chapter, Story } from '@/services/types'

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
    parentChapterIds: [],
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

interface CreateServicesOptions {
  readonly chapters?: Chapter[]
  readonly nextChapters?: Chapter[]
  readonly story?: Story
}

function createServices(options?: CreateServicesOptions) {
  const chapters = options?.chapters ?? [createChapter()]
  const nextChapters = options?.nextChapters ?? []
  const story = options && 'story' in options ? options.story : createStory()

  return {
    getChaptersByStoryId: vi.fn(() => Promise.resolve(chapters)),
    getNextChapters: vi.fn(() => Promise.resolve(nextChapters)),
    getStoryById: vi.fn(() => Promise.resolve(story)),
  }
}

function renderReader({
  chapterId,
  onSelectChapter = vi.fn(),
  services = createServices(),
}: {
  readonly chapterId?: string
  readonly onSelectChapter?: (chapterId: string) => void
  readonly services?: ReturnType<typeof createServices>
} = {}) {
  return render(
    <StoryReader
      chapterId={chapterId}
      onEditStory={vi.fn()}
      onOpenDashboard={vi.fn()}
      onSelectChapter={onSelectChapter}
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

describe('StoryReader', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows a loading state while the story loads', () => {
    const pendingStory = deferred<Story>()
    const services = createServices()
    services.getStoryById.mockReturnValue(pendingStory.promise)

    renderReader({ services })

    expect(screen.getByText('Loading story...')).toBeTruthy()

    pendingStory.resolve(createStory())
  })

  it('shows a missing story state', async () => {
    const services = createServices({ story: undefined })

    renderReader({ services })

    expect(await screen.findByText('Story not found')).toBeTruthy()
    expect(
      screen.getByText(
        'This story may have been deleted or is unavailable in this browser.',
      ),
    ).toBeTruthy()
  })

  it('shows a no chapters state for an empty story', async () => {
    const services = createServices({ chapters: [] })

    renderReader({ services })

    expect(await screen.findByText('No chapters yet')).toBeTruthy()
    expect(
      screen.getByText('This story does not have any chapters to read yet.'),
    ).toBeTruthy()
  })

  it('loads the first chapter when no chapter id is supplied', async () => {
    const chapters = [
      createChapter({
        id: 'chapter-first',
        title: 'First Chapter',
        content: 'The first page.',
      }),
      createChapter({
        id: 'chapter-second',
        title: 'Second Chapter',
        content: 'The second page.',
        createdAt: 200,
      }),
    ]
    const services = createServices({ chapters })

    renderReader({ services })

    expect(await screen.findByRole('heading', { name: 'First Chapter' }))
      .toBeTruthy()
    expect(screen.getByText('The first page.')).toBeTruthy()
    expect(services.getNextChapters).toHaveBeenCalledWith('chapter-first')
  })

  it('loads the current chapter from the chapter id', async () => {
    const chapters = [
      createChapter({ id: 'chapter-first', title: 'First Chapter' }),
      createChapter({
        id: 'chapter-selected',
        title: 'Selected Chapter',
        content: 'This branch was selected.',
        createdAt: 200,
      }),
    ]
    const services = createServices({ chapters })

    renderReader({ chapterId: 'chapter-selected', services })

    expect(await screen.findByRole('heading', { name: 'Selected Chapter' }))
      .toBeTruthy()
    expect(screen.getByText('This branch was selected.')).toBeTruthy()
    expect(services.getNextChapters).toHaveBeenCalledWith('chapter-selected')
  })

  it('shows a missing chapter state for an invalid chapter id', async () => {
    const services = createServices()

    renderReader({ chapterId: 'missing-chapter', services })

    expect(await screen.findByText('Chapter not found')).toBeTruthy()
    expect(
      screen.getByText('This chapter is not part of the selected story.'),
    ).toBeTruthy()
    expect(services.getNextChapters).not.toHaveBeenCalled()
  })

  it('renders Continue for a single next chapter and navigates to it', async () => {
    const onSelectChapter = vi.fn()
    const services = createServices({
      nextChapters: [
        createChapter({
          id: 'chapter-next',
          title: 'Across the Bridge',
          parentChapterIds: ['chapter-1'],
        }),
      ],
    })

    renderReader({ onSelectChapter, services })

    fireEvent.click(await screen.findByRole('button', { name: /continue/i }))

    expect(onSelectChapter).toHaveBeenCalledWith('chapter-next')
  })

  it('renders branch choices and navigates to the selected chapter', async () => {
    const onSelectChapter = vi.fn()
    const services = createServices({
      nextChapters: [
        createChapter({
          id: 'chapter-bridge',
          title: 'Cross the bridge',
          parentChapterIds: ['chapter-1'],
        }),
        createChapter({
          id: 'chapter-river',
          title: 'Follow the river',
          parentChapterIds: ['chapter-1'],
        }),
      ],
    })

    renderReader({ onSelectChapter, services })

    expect(await screen.findByText('Choose your path')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cross the bridge' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Follow the river' }))

    expect(onSelectChapter).toHaveBeenCalledWith('chapter-river')
  })

  it('renders The End for a terminal chapter', async () => {
    const services = createServices({ nextChapters: [] })

    renderReader({ services })

    expect(await screen.findByText('The End')).toBeTruthy()
  })

  it('shows an alert when a service fails', async () => {
    const services = createServices()
    services.getChaptersByStoryId.mockRejectedValue(
      new Error('Could not load chapters.'),
    )

    renderReader({ services })

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toBe(
        'Could not load chapters.',
      )
    })
  })
})
