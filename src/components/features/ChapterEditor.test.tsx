import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChapterEditor } from '@/components/features/ChapterEditor'
import type { Chapter, Story, UpdateChapterInput } from '@/services/types'

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
    getChapterById: vi.fn((chapterId: string) =>
      Promise.resolve(chapters.find((chapter) => chapter.id === chapterId)),
    ),
    getStoryById: vi.fn((storyId: string) =>
      Promise.resolve(story?.id === storyId ? story : undefined),
    ),
    updateChapter: vi.fn((chapterId: string, input: UpdateChapterInput) => {
      const chapter = chapters.find(
        (candidateChapter) => candidateChapter.id === chapterId,
      )

      if (!chapter) {
        return Promise.resolve(undefined)
      }

      const updatedChapter = {
        ...chapter,
        ...input,
        updatedAt: 300,
      }
      chapters = chapters.map((candidateChapter) =>
        candidateChapter.id === chapterId ? updatedChapter : candidateChapter,
      )

      return Promise.resolve(updatedChapter)
    }),
  }
}

function renderChapterEditor({
  onOpenDashboard = vi.fn(),
  onOpenStoryEditor = vi.fn(),
  services = createServices(),
}: {
  readonly onOpenDashboard?: () => void
  readonly onOpenStoryEditor?: (storyId: string) => void
  readonly services?: ReturnType<typeof createServices>
} = {}) {
  return render(
    <ChapterEditor
      chapterId="chapter-1"
      onOpenDashboard={onOpenDashboard}
      onOpenStoryEditor={onOpenStoryEditor}
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

describe('ChapterEditor', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows a loading state while the chapter loads', () => {
    const pendingStory = deferred<Story>()
    const services = createServices()
    services.getStoryById.mockReturnValue(pendingStory.promise)

    renderChapterEditor({ services })

    expect(screen.getByText('Loading chapter...')).toBeTruthy()

    pendingStory.resolve(createStory())
  })

  it('loads chapter fields for editing', async () => {
    const services = createServices()

    renderChapterEditor({ services })

    expect(await screen.findByRole('heading', { name: 'The Gate' }))
      .toBeTruthy()
    expect(screen.getByLabelText('Title')).toHaveProperty(
      'value',
      'The Gate',
    )
    expect(screen.getByLabelText('Content')).toHaveProperty(
      'value',
      'The path begins here.',
    )
    expect(screen.queryByRole('heading', { name: 'Child Chapters' })).toBeNull()
  })

  it('saves trimmed title and raw content values', async () => {
    const services = createServices()

    renderChapterEditor({ services })

    await screen.findByRole('heading', { name: 'The Gate' })
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '  River Fork  ' },
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: '  Keep the leading space.\n' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save chapter/i }))

    await waitFor(() => {
      expect(services.updateChapter).toHaveBeenCalledWith('chapter-1', {
        content: '  Keep the leading space.\n',
        title: 'River Fork',
      })
    })
    expect((await screen.findByRole('status')).textContent).toBe(
      'Chapter saved.',
    )
  })

  it('disables save when the title is blank', async () => {
    const services = createServices()

    renderChapterEditor({ services })

    await screen.findByRole('heading', { name: 'The Gate' })
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '   ' },
    })

    const saveButton = screen.getByRole('button', { name: /save chapter/i })
    expect(saveButton).toHaveProperty('disabled', true)
    fireEvent.click(saveButton)

    expect(services.updateChapter).not.toHaveBeenCalled()
  })

  it('shows a missing story state', async () => {
    const services = createServices({ story: undefined })

    renderChapterEditor({ services })

    expect(await screen.findByText('Story not found')).toBeTruthy()
    expect(
      screen.getByText(
        'This story may have been deleted or is unavailable in this browser.',
      ),
    ).toBeTruthy()
  })

  it('shows a missing chapter state when the chapter is absent', async () => {
    const services = createServices({ chapters: [] })

    renderChapterEditor({ services })

    expect(await screen.findByText('Chapter not found')).toBeTruthy()
    expect(
      screen.getByText('This chapter is not part of the selected story.'),
    ).toBeTruthy()
  })

  it('does not show child chapter controls on the edit page', async () => {
    const services = createServices()

    renderChapterEditor({ services })

    await screen.findByRole('heading', { name: 'The Gate' })

    expect(
      screen.queryByRole('button', { name: /add child chapter/i }),
    ).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Child Chapters' })).toBeNull()
  })

  it('shows load and save failure messages', async () => {
    const services = createServices()
    services.getChapterById.mockRejectedValue(
      new Error('Could not load chapter.'),
    )

    renderChapterEditor({ services })

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not load chapter.',
    )

    cleanup()
    const saveServices = createServices()
    saveServices.updateChapter.mockRejectedValue(
      new Error('Could not save chapter.'),
    )

    renderChapterEditor({ services: saveServices })

    await screen.findByRole('heading', { name: 'The Gate' })
    fireEvent.click(screen.getByRole('button', { name: /save chapter/i }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not save chapter.',
    )
  })

  it('calls dashboard and story editor navigation callbacks', async () => {
    const onOpenDashboard = vi.fn()
    const onOpenStoryEditor = vi.fn()

    renderChapterEditor({ onOpenDashboard, onOpenStoryEditor })

    await screen.findByRole('heading', { name: 'The Gate' })
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }))
    fireEvent.click(screen.getByRole('button', { name: 'Story Editor' }))

    expect(onOpenDashboard).toHaveBeenCalled()
    expect(onOpenStoryEditor).toHaveBeenCalledWith('story-1')
  })
})
