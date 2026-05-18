import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
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
  onGoBack = vi.fn(),
  onOpenDashboard = vi.fn(),
  services = createServices(),
}: {
  readonly onGoBack?: () => void
  readonly onOpenDashboard?: () => void
  readonly services?: ReturnType<typeof createServices>
} = {}) {
  return render(
    <ChapterEditor
      chapterId="chapter-1"
      onGoBack={onGoBack}
      onOpenDashboard={onOpenDashboard}
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

    expect(await screen.findByDisplayValue('The Gate')).toBeTruthy()
    expect(screen.getByLabelText('Title')).toHaveProperty(
      'value',
      'The Gate',
    )
    expect(screen.getByLabelText('Content')).toHaveProperty(
      'value',
      'The path begins here.',
    )
    expect(screen.getByRole('button', { name: 'Write' }).getAttribute(
      'aria-pressed',
    )).toBe('true')
    expect(screen.getByText('4 words')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'What happens next?' }))
      .toBeNull()
  })

  it('counts rendered prose words without markdown link targets', async () => {
    const services = createServices({
      chapters: [
        createChapter({
          content:
            'Read [the old road](https://example.com/old-road) and <https://example.com/hidden>.',
        }),
      ],
    })

    renderChapterEditor({ services })

    await screen.findByDisplayValue('The Gate')

    expect(screen.getByText('5 words')).toBeTruthy()
  })

  it('saves trimmed title and raw content values', async () => {
    const services = createServices()

    renderChapterEditor({ services })

    await screen.findByDisplayValue('The Gate')
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '  River Fork  ' },
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: '  Keep the leading space.\n' },
    })
    expect(screen.queryByRole('status')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(services.updateChapter).toHaveBeenCalledWith('chapter-1', {
        content: '  Keep the leading space.\n',
        title: 'River Fork',
      })
    })
  })

  it('previews markdown while saving the raw markdown content', async () => {
    const services = createServices({
      chapters: [
        createChapter({
          content: 'Plain opening.',
        }),
      ],
    })
    const markdown = [
      '## River Fork',
      '',
      'Choose the **left** bank.',
      '',
      '- Watch the stones',
      '- Keep quiet',
    ].join('\n')

    renderChapterEditor({ services })

    await screen.findByDisplayValue('The Gate')
    expect(screen.queryByRole('region', { name: 'Content preview' })).toBeNull()

    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: markdown },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    const preview = screen.getByRole('region', { name: 'Content preview' })
    expect(
      within(preview).getByRole('heading', { name: 'River Fork' }),
    ).toBeTruthy()
    expect(within(preview).getByText('left').tagName).toBe('STRONG')
    expect(within(preview).getByText('Watch the stones').tagName).toBe('LI')
    expect(screen.queryByLabelText('Content')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Write' }))

    expect(screen.getByLabelText('Content')).toHaveProperty('value', markdown)

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(services.updateChapter).toHaveBeenCalledWith('chapter-1', {
        content: markdown,
        title: 'The Gate',
      })
    })
  })

  it('disables save when the title is blank', async () => {
    const services = createServices()

    renderChapterEditor({ services })

    await screen.findByDisplayValue('The Gate')
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '   ' },
    })

    const saveButton = screen.getByRole('button', { name: /^save$/i })
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

  it('does not show branch controls on the edit page', async () => {
    const services = createServices()

    renderChapterEditor({ services })

    await screen.findByDisplayValue('The Gate')

    expect(
      screen.queryByRole('button', { name: /add branch/i }),
    ).toBeNull()
    expect(screen.queryByRole('heading', { name: 'What happens next?' }))
      .toBeNull()
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

    await screen.findByDisplayValue('The Gate')
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'Changed before failure.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not save chapter.',
    )
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('saves from the keyboard shortcut in write and preview modes', async () => {
    const services = createServices()

    renderChapterEditor({ services })

    await screen.findByDisplayValue('The Gate')
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'A changed path.' },
    })
    fireEvent.keyDown(window, { ctrlKey: true, key: 's' })

    await waitFor(() => {
      expect(services.updateChapter).toHaveBeenCalledWith('chapter-1', {
        content: 'A changed path.',
        title: 'The Gate',
      })
    })

    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Preview Save' },
    })
    fireEvent.keyDown(window, { key: 's', metaKey: true })

    await waitFor(() => {
      expect(services.updateChapter).toHaveBeenLastCalledWith('chapter-1', {
        content: 'A changed path.',
        title: 'Preview Save',
      })
    })
  })

  it('confirms before leaving with unsaved changes', async () => {
    const onGoBack = vi.fn()
    const onOpenDashboard = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderChapterEditor({ onGoBack, onOpenDashboard })

    await screen.findByDisplayValue('The Gate')
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'A changed path.' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }))

    expect(confirmSpy).toHaveBeenCalledTimes(2)
    expect(onGoBack).not.toHaveBeenCalled()
    expect(onOpenDashboard).not.toHaveBeenCalled()

    confirmSpy.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }))

    expect(onOpenDashboard).toHaveBeenCalled()
  })

  it('calls dashboard and back navigation callbacks', async () => {
    const onGoBack = vi.fn()
    const onOpenDashboard = vi.fn()

    renderChapterEditor({ onGoBack, onOpenDashboard })

    await screen.findByDisplayValue('The Gate')
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.queryByRole('button', { name: 'Story Editor' })).toBeNull()
    expect(onOpenDashboard).toHaveBeenCalled()
    expect(onGoBack).toHaveBeenCalled()
  })
})
