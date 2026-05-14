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
    parentChapterId: null,
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
  onCreateChildChapter = vi.fn(),
  onEditChapter = vi.fn(),
  onSelectChapter = vi.fn(),
  services = createServices(),
}: {
  readonly chapterId?: string
  readonly onCreateChildChapter?: (
    storyId: string,
    parentChapterId: string,
  ) => void
  readonly onEditChapter?: (storyId: string, chapterId: string) => void
  readonly onSelectChapter?: (chapterId: string) => void
  readonly services?: ReturnType<typeof createServices>
} = {}) {
  return render(
    <StoryReader
      chapterId={chapterId}
      onCreateChildChapter={onCreateChildChapter}
      onEditChapter={onEditChapter}
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

  it('does not show Back for a direct load with one chapter in the path', async () => {
    const services = createServices({
      chapters: [
        createChapter({
          id: 'chapter-first',
          title: 'First Chapter',
          content: 'The first page.',
        }),
      ],
    })

    renderReader({ services })

    expect(await screen.findByRole('heading', { name: 'First Chapter' }))
      .toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
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

  it('opens the current chapter for editing', async () => {
    const onEditChapter = vi.fn()
    const services = createServices()

    renderReader({ onEditChapter, services })

    fireEvent.click(
      await screen.findByRole('button', { name: 'Edit Chapter' }),
    )

    expect(onEditChapter).toHaveBeenCalledWith('story-1', 'chapter-1')
  })

  it('opens child chapter creation from the current chapter', async () => {
    const onCreateChildChapter = vi.fn()
    const services = createServices()

    renderReader({ onCreateChildChapter, services })

    fireEvent.click(
      await screen.findByRole('button', { name: /add child chapter/i }),
    )

    expect(onCreateChildChapter).toHaveBeenCalledWith(
      'story-1',
      'chapter-1',
    )
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
    const nextChapter = createChapter({
      id: 'chapter-next',
      title: 'Across the Bridge',
      parentChapterId: 'chapter-1',
    })
    const services = createServices({
      nextChapters: [nextChapter],
    })

    renderReader({ onSelectChapter, services })

    fireEvent.click(await screen.findByRole('button', { name: /continue/i }))

    expect(onSelectChapter).toHaveBeenCalledWith('chapter-next')
    expect(await screen.findByRole('button', { name: 'Back' })).toBeTruthy()
  })

  it('renders branch choices and navigates to the selected chapter', async () => {
    const onSelectChapter = vi.fn()
    const bridgeChapter = createChapter({
      id: 'chapter-bridge',
      title: 'Cross the bridge',
      parentChapterId: 'chapter-1',
    })
    const riverChapter = createChapter({
      id: 'chapter-river',
      title: 'Follow the river',
      parentChapterId: 'chapter-1',
    })
    const services = createServices({
      nextChapters: [bridgeChapter, riverChapter],
    })

    renderReader({ onSelectChapter, services })

    expect(await screen.findByText('Choose your path')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cross the bridge' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Follow the river' }))

    expect(onSelectChapter).toHaveBeenCalledWith('chapter-river')
    expect(await screen.findByRole('button', { name: 'Back' })).toBeTruthy()
  })

  it('navigates back to the previous chapter and trims the session path', async () => {
    const onSelectChapter = vi.fn()
    const firstChapter = createChapter({
      id: 'chapter-first',
      title: 'First Chapter',
    })
    const nextChapter = createChapter({
      id: 'chapter-next',
      title: 'Next Chapter',
      parentChapterId: 'chapter-first',
    })
    const chapters = [firstChapter, nextChapter]
    const services = {
      getChaptersByStoryId: vi.fn(() => Promise.resolve(chapters)),
      getNextChapters: vi.fn((selectedChapterId: string) =>
        Promise.resolve(
          selectedChapterId === 'chapter-first' ? [nextChapter] : [],
        ),
      ),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const view = render(
      <StoryReader
        onCreateChildChapter={vi.fn()}
        onEditChapter={vi.fn()}
        onEditStory={vi.fn()}
        onOpenDashboard={vi.fn()}
        onSelectChapter={onSelectChapter}
        services={services}
        storyId="story-1"
      />,
    )

    fireEvent.click(await screen.findByRole('button', { name: /continue/i }))

    expect(onSelectChapter).toHaveBeenLastCalledWith('chapter-next')

    view.rerender(
      <StoryReader
        chapterId="chapter-next"
        onCreateChildChapter={vi.fn()}
        onEditChapter={vi.fn()}
        onEditStory={vi.fn()}
        onOpenDashboard={vi.fn()}
        onSelectChapter={onSelectChapter}
        services={services}
        storyId="story-1"
      />,
    )

    expect(await screen.findByRole('heading', { name: 'Next Chapter' }))
      .toBeTruthy()
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(onSelectChapter).toHaveBeenLastCalledWith('chapter-first')
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
    })
  })

  it('clears the back path when switching stories in the same reader', async () => {
    const onSelectChapter = vi.fn()
    const firstStory = createStory({ id: 'story-1', title: 'First Story' })
    const secondStory = createStory({ id: 'story-2', title: 'Second Story' })
    const firstIntro = createChapter({
      id: 'story-1-intro',
      storyId: 'story-1',
      title: 'First Intro',
    })
    const firstNext = createChapter({
      id: 'story-1-next',
      parentChapterId: 'story-1-intro',
      storyId: 'story-1',
      title: 'First Next',
    })
    const secondIntro = createChapter({
      id: 'story-2-intro',
      storyId: 'story-2',
      title: 'Second Intro',
    })
    const services = {
      getChaptersByStoryId: vi.fn((selectedStoryId: string) =>
        Promise.resolve(
          selectedStoryId === 'story-1'
            ? [firstIntro, firstNext]
            : [secondIntro],
        ),
      ),
      getNextChapters: vi.fn((selectedChapterId: string) =>
        Promise.resolve(
          selectedChapterId === 'story-1-intro' ? [firstNext] : [],
        ),
      ),
      getStoryById: vi.fn((selectedStoryId: string) =>
        Promise.resolve(selectedStoryId === 'story-1' ? firstStory : secondStory),
      ),
    }
    const view = render(
      <StoryReader
        onCreateChildChapter={vi.fn()}
        onEditChapter={vi.fn()}
        onEditStory={vi.fn()}
        onOpenDashboard={vi.fn()}
        onSelectChapter={onSelectChapter}
        services={services}
        storyId="story-1"
      />,
    )

    fireEvent.click(await screen.findByRole('button', { name: /continue/i }))

    expect(await screen.findByRole('button', { name: 'Back' })).toBeTruthy()

    view.rerender(
      <StoryReader
        onCreateChildChapter={vi.fn()}
        onEditChapter={vi.fn()}
        onEditStory={vi.fn()}
        onOpenDashboard={vi.fn()}
        onSelectChapter={onSelectChapter}
        services={services}
        storyId="story-2"
      />,
    )

    expect(await screen.findByRole('heading', { name: 'Second Intro' }))
      .toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
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
