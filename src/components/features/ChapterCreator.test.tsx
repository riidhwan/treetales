import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChapterCreator } from '@/components/features/ChapterCreator'
import { READER_APPEARANCE_STORAGE_KEY } from '@/config'
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
  onGoBack = vi.fn(),
  onOpenDashboard = vi.fn(),
  parentChapterId = 'chapter-1',
  services = createServices(),
}: {
  readonly intro?: boolean
  readonly onChapterCreated?: (storyId: string, chapterId: string) => void
  readonly onGoBack?: () => void
  readonly onOpenDashboard?: () => void
  readonly parentChapterId?: string
  readonly services?: ReturnType<typeof createServices>
} = {}) {
  return render(
    <ChapterCreator
      onChapterCreated={onChapterCreated}
      onGoBack={onGoBack}
      onOpenDashboard={onOpenDashboard}
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

function mockClipboard() {
  const writeText = vi.fn<(text: string) => Promise<void>>(() =>
    Promise.resolve(),
  )

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })

  return writeText
}

function mockFailingClipboard() {
  const writeText = vi.fn<(text: string) => Promise<void>>(() =>
    Promise.reject(new Error('Clipboard blocked')),
  )

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })

  return writeText
}

describe('ChapterCreator', () => {
  afterEach(() => {
    cleanup()
    window.localStorage.clear()
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
      await screen.findByText('The Old Road - Branch from The Gate'),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Write' }).getAttribute(
      'aria-pressed',
    )).toBe('true')
    expect(screen.getByText('0 words')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByLabelText('Title')).toHaveProperty('value', '')
    expect(screen.getByLabelText('Content')).toHaveProperty('value', '')
  })

  it('copies a branch Prompt Builder prompt from rough plot and parent context', async () => {
    const writeText = mockClipboard()

    renderChapterCreator()

    await screen.findByText('The Old Road - Branch from The Gate')
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'The Cellar' },
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'The stairs already creak.' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Writing Assist' }))
    expect(screen.getByRole('button', { name: /Write with LLM/ }))
      .toHaveProperty('disabled', true)

    fireEvent.click(screen.getByRole('button', { name: 'Prompt Builder' }))
    expect(
      screen.getByRole('dialog', { name: 'Prompt Builder' }),
    ).toBeTruthy()
    expect(screen.queryByLabelText('Generated prompt')).toBeNull()

    fireEvent.change(screen.getByLabelText('Rough plot'), {
      target: { value: 'Find the hidden latch and choose whether to descend.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
    })

    const copiedPrompt = writeText.mock.calls[0]?.[0] ?? ''
    expect(copiedPrompt).toContain('The path begins here.')
    expect(copiedPrompt).toContain(
      'Find the hidden latch and choose whether to descend.',
    )
    expect(copiedPrompt).not.toContain('{{')
    expect(screen.getByRole('status').textContent).toBe('Prompt copied.')
  })

  it('requires a title before creating a branch', async () => {
    const services = createServices()

    renderChapterCreator({ services })

    await screen.findByText('The Old Road - Branch from The Gate')

    const createButton = screen.getByRole('button', {
      name: /^save$/i,
    })
    expect(createButton).toHaveProperty('disabled', true)
    fireEvent.click(createButton)

    expect(services.createChapter).not.toHaveBeenCalled()
  })

  it('shows title validation after the title field is touched', async () => {
    renderChapterCreator()

    await screen.findByText('The Old Road - Branch from The Gate')
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '   ' },
    })
    fireEvent.blur(screen.getByLabelText('Title'))

    expect(screen.getByText('Chapter title is required.')).toBeTruthy()
  })

  it('creates a branch with title and content and opens it', async () => {
    const onChapterCreated = vi.fn()
    const services = createServices()

    renderChapterCreator({ onChapterCreated, services })

    await screen.findByText('The Old Road - Branch from The Gate')
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '  The Cellar  ' },
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'The stairs creak.' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /^save$/i }),
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

  it('previews markdown while saving the raw markdown content', async () => {
    const onChapterCreated = vi.fn()
    const services = createServices()
    const markdown = [
      '## The Cellar',
      '',
      'Bring **matches**.',
      '',
      '- Listen',
      '- Wait',
    ].join('\n')

    renderChapterCreator({ onChapterCreated, services })

    await screen.findByText('The Old Road - Branch from The Gate')
    expect(screen.queryByText('Nothing to preview yet.')).toBeNull()

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'The Cellar' },
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: markdown },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    const preview = screen.getByRole('region', { name: 'Content preview' })
    expect(
      within(preview).getByRole('heading', { name: 'The Cellar' }),
    ).toBeTruthy()
    expect(within(preview).getByText('matches').tagName).toBe('STRONG')
    expect(within(preview).getByText('Listen').tagName).toBe('LI')
    expect(screen.queryByLabelText('Content')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Write' }))

    expect(screen.getByLabelText('Content')).toHaveProperty('value', markdown)

    fireEvent.click(
      screen.getByRole('button', { name: /^save$/i }),
    )

    await waitFor(() => {
      expect(services.createChapter).toHaveBeenCalledWith({
        content: markdown,
        parentChapterId: 'chapter-1',
        storyId: 'story-1',
        title: 'The Cellar',
      })
    })
    expect(onChapterCreated).toHaveBeenCalledWith('story-1', 'chapter-2')
  })

  it('applies Reader Appearance to write and preview document text', async () => {
    renderChapterCreator()

    await screen.findByText('The Old Road - Branch from The Gate')
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'The Cellar' },
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'The stairs creak.' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reader Appearance' }))
    fireEvent.click(screen.getByRole('button', { name: 'NV Garamond' }))
    fireEvent.click(screen.getByRole('button', { name: 'Increase Font Size' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Title').parentElement?.style.fontFamily)
        .toContain('NV Garamond')
    })
    expect(screen.getByLabelText('Content').style.fontFamily).toContain(
      'NV Garamond',
    )
    expect(screen.getByLabelText('Content').style.fontSize).toBe('15pt')

    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    const preview = screen.getByRole('region', { name: 'Content preview' })
    expect(
      preview.firstElementChild instanceof HTMLElement
        ? preview.firstElementChild.style.fontFamily
        : '',
    ).toContain('NV Garamond')
    expect(
      window.localStorage.getItem(READER_APPEARANCE_STORAGE_KEY),
    ).toContain('"fontSizePt":15')
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
      await screen.findByText('The Old Road - Intro Chapter'),
    ).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '  First Light  ' },
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'Morning finds the road.' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /^save$/i }),
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

  it('copies an intro Prompt Builder prompt without parent chapter context', async () => {
    const writeText = mockClipboard()
    const services = createServices({ chapters: [] })

    renderChapterCreator({
      intro: true,
      services,
    })

    await screen.findByText('The Old Road - Intro Chapter')
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'First Light' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Writing Assist' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prompt Builder' }))
    fireEvent.change(screen.getByLabelText('Rough plot'), {
      target: { value: 'Open on the road at dawn.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
    })

    const copiedPrompt = writeText.mock.calls[0]?.[0] ?? ''
    expect(copiedPrompt).toContain('Open on the road at dawn.')
    expect(copiedPrompt).not.toContain('The path begins here.')
    expect(copiedPrompt).not.toContain('{{')
  })

  it('shows the generated Prompt Builder prompt when clipboard copy fails', async () => {
    mockFailingClipboard()

    renderChapterCreator()

    await screen.findByText('The Old Road - Branch from The Gate')
    fireEvent.click(screen.getByRole('button', { name: 'Writing Assist' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prompt Builder' }))
    fireEvent.change(screen.getByLabelText('Rough plot'), {
      target: { value: 'Search for the hidden hinge.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not copy prompt.',
    )
    expect(screen.getByLabelText('Generated prompt')).toHaveProperty(
      'value',
      expect.stringContaining('Search for the hidden hinge.'),
    )
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
      screen.queryByRole('button', { name: /^save$/i }),
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

    await screen.findByText('The Old Road - Branch from The Gate')
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'The Cellar' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /^save$/i }),
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not create chapter.',
    )
  })

  it('calls dashboard navigation without parent chapter navigation', async () => {
    const onOpenDashboard = vi.fn()

    renderChapterCreator({ onOpenDashboard })

    await screen.findByText('The Old Road - Branch from The Gate')
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }))

    expect(onOpenDashboard).toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Parent Chapter' })).toBeNull()
  })

  it('calls browser-history back separately from parent chapter navigation', async () => {
    const onGoBack = vi.fn()

    renderChapterCreator({ onGoBack })

    await screen.findByText('The Old Road - Branch from The Gate')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(onGoBack).toHaveBeenCalled()
  })

  it('does not show story editor navigation from intro creation', async () => {
    const services = createServices({ chapters: [] })

    renderChapterCreator({
      intro: true,
      services,
    })

    await screen.findByText('The Old Road - Intro Chapter')

    expect(screen.queryByRole('button', { name: 'Story Editor' })).toBeNull()
  })

  it('confirms before leaving with draft changes', async () => {
    const onOpenDashboard = vi.fn()
    const onGoBack = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderChapterCreator({ onGoBack, onOpenDashboard })

    await screen.findByText('The Old Road - Branch from The Gate')
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'A draft path.' },
    })

    expect(screen.queryByRole('status')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(confirmSpy).toHaveBeenCalledTimes(2)
    expect(onGoBack).not.toHaveBeenCalled()
    expect(onOpenDashboard).not.toHaveBeenCalled()

    confirmSpy.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(onGoBack).toHaveBeenCalled()
  })

  it('prevents beforeunload only after draft changes exist', async () => {
    renderChapterCreator()

    await screen.findByText('The Old Road - Branch from The Gate')

    const unchangedEvent = new Event('beforeunload', { cancelable: true })
    const unchangedPreventDefault = vi.spyOn(unchangedEvent, 'preventDefault')
    window.dispatchEvent(unchangedEvent)

    expect(unchangedPreventDefault).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'A draft path.' },
    })

    const changedEvent = new Event('beforeunload', { cancelable: true })
    const changedPreventDefault = vi.spyOn(changedEvent, 'preventDefault')
    window.dispatchEvent(changedEvent)

    expect(changedPreventDefault).toHaveBeenCalled()
  })

  it('does not create from the keyboard save shortcut', async () => {
    const services = createServices()

    renderChapterCreator({ services })

    await screen.findByText('The Old Road - Branch from The Gate')
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'The Cellar' },
    })
    fireEvent.keyDown(window, { ctrlKey: true, key: 's' })

    expect(services.createChapter).not.toHaveBeenCalled()
  })
})
