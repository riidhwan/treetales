import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StoryReader } from '@/components/features/StoryReader'
import { ReaderContent } from '@/components/features/StoryReader/StoryReader/ReaderContent'
import { READER_APPEARANCE_STORAGE_KEY } from '@/config'
import type { StoryReaderServices } from '@/hooks/useStoryReader'
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
    getIntroChapterByStoryId: vi.fn((storyId: string) =>
      Promise.resolve(
        chapters.find(
          (chapter) =>
            chapter.storyId === storyId && chapter.parentChapterId === null,
        ),
      ),
    ),
    getNextChapters: vi.fn(() => Promise.resolve(nextChapters)),
    getStoryById: vi.fn(() => Promise.resolve(story)),
  }
}

function renderReader({
  chapterId,
  onCreateChildChapter = vi.fn(),
  onCreateIntroChapter = vi.fn(),
  onEditChapter = vi.fn(),
  onOpenStoryDetails = vi.fn(),
  onSelectChapter = vi.fn(),
  services = createServices(),
}: {
  readonly chapterId?: string
  readonly onCreateChildChapter?: (
    storyId: string,
    parentChapterId: string,
  ) => void
  readonly onCreateIntroChapter?: (storyId: string) => void
  readonly onEditChapter?: (storyId: string, chapterId: string) => void
  readonly onOpenStoryDetails?: (storyId: string) => void
  readonly onSelectChapter?: (chapterId: string) => void
  readonly services?: ReturnType<typeof createServices>
} = {}) {
  return render(
    <StoryReader
      chapterId={chapterId}
      onCreateChildChapter={onCreateChildChapter}
      onCreateIntroChapter={onCreateIntroChapter}
      onEditChapter={onEditChapter}
      onOpenDashboard={vi.fn()}
      onOpenStoryDetails={onOpenStoryDetails}
      onSelectChapter={onSelectChapter}
      services={services}
      storyId="story-1"
    />,
  )
}

function ControlledStoryReader({
  onSelectChapter,
  services,
  storyId = 'story-1',
}: {
  readonly onSelectChapter: (chapterId: string) => void
  readonly services: StoryReaderServices
  readonly storyId?: string
}) {
  const [chapterId, setChapterId] = useState<string | undefined>()

  return (
    <StoryReader
      chapterId={chapterId}
      onCreateChildChapter={vi.fn()}
      onCreateIntroChapter={vi.fn()}
      onEditChapter={vi.fn()}
      onOpenDashboard={vi.fn()}
      onOpenStoryDetails={vi.fn()}
      onSelectChapter={(selectedChapterId) => {
        onSelectChapter(selectedChapterId)
        setChapterId(selectedChapterId)
      }}
      services={services}
      storyId={storyId}
    />
  )
}

function StorySwitchingReader({
  onSelectChapter,
  services,
  storyId,
}: {
  readonly onSelectChapter: (chapterId: string) => void
  readonly services: StoryReaderServices
  readonly storyId: string
}) {
  const [chapterIdByStoryId, setChapterIdByStoryId] = useState<
    Record<string, string | undefined>
  >({})

  return (
    <StoryReader
      chapterId={chapterIdByStoryId[storyId]}
      onCreateChildChapter={vi.fn()}
      onCreateIntroChapter={vi.fn()}
      onEditChapter={vi.fn()}
      onOpenDashboard={vi.fn()}
      onOpenStoryDetails={vi.fn()}
      onSelectChapter={(selectedChapterId) => {
        onSelectChapter(selectedChapterId)
        setChapterIdByStoryId((currentChapterIdByStoryId) => ({
          ...currentChapterIdByStoryId,
          [storyId]: selectedChapterId,
        }))
      }}
      services={services}
      storyId={storyId}
    />
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
    window.localStorage.clear()
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

  it('shows an actionable no Intro Chapter state for an empty story', async () => {
    const onCreateIntroChapter = vi.fn()
    const onOpenStoryDetails = vi.fn()
    const services = createServices({ chapters: [] })

    renderReader({ onCreateIntroChapter, onOpenStoryDetails, services })

    expect(await screen.findByText('No Intro Chapter yet')).toBeTruthy()
    expect(
      screen.getByText(
        'Add an Intro Chapter to give this Story a place to begin.',
      ),
    ).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Reader actions' }))
      .toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Add Intro Chapter' }))
    fireEvent.click(screen.getByRole('button', { name: 'Story Details' }))

    expect(onCreateIntroChapter).toHaveBeenCalledWith('story-1')
    expect(onOpenStoryDetails).toHaveBeenCalledWith('story-1')
  })

  it('does not show Parent Chapter for the intro chapter', async () => {
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
    expect(screen.queryByRole('button', { name: 'Parent Chapter' })).toBeNull()
  })

  it('opens story details from the reader toolbar', async () => {
    const onOpenStoryDetails = vi.fn()
    const services = createServices()

    renderReader({ onOpenStoryDetails, services })

    fireEvent.click(
      await screen.findByRole('button', { name: 'Story Details' }),
    )

    expect(onOpenStoryDetails).toHaveBeenCalledWith('story-1')
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

  it('renders chapter content as markdown without rendering raw HTML', async () => {
    const services = createServices({
      chapters: [
        createChapter({
          content: [
            '# The Warning',
            '',
            'A **bold** choice with [a map](https://example.com/map).',
            '',
            '- Pack a torch',
            '- Close the gate',
            '',
            '<h2>Unsafe heading</h2>',
          ].join('\n'),
        }),
      ],
    })

    renderReader({ services })

    expect(await screen.findByRole('heading', { name: 'The Warning' }))
      .toBeTruthy()
    expect(screen.getByText('bold').tagName).toBe('STRONG')
    expect(screen.getByRole('link', { name: 'a map' })).toHaveProperty(
      'href',
      'https://example.com/map',
    )
    expect(screen.getByText('Pack a torch').tagName).toBe('LI')
    expect(
      screen.queryByRole('heading', { name: 'Unsafe heading' }),
    ).toBeNull()
  })

  it('renders single newlines in chapter content as line breaks', async () => {
    const services = createServices({
      chapters: [
        createChapter({
          content: 'First line\nSecond line',
        }),
      ],
    })

    const view = renderReader({ services })

    await screen.findByRole('heading', { name: 'The Gate' })
    const paragraph = Array.from(view.container.querySelectorAll('p')).find(
      (element) =>
        element.textContent?.includes('First line') &&
        element.textContent.includes('Second line'),
    )

    expect(paragraph?.querySelector('br')).toBeTruthy()
  })

  it('shows the blank chapter fallback for empty content', async () => {
    const services = createServices({
      chapters: [createChapter({ content: '' })],
    })

    renderReader({ services })

    expect(await screen.findByText('This chapter is blank.')).toBeTruthy()
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

  it('opens the parent chapter from a direct child chapter load', async () => {
    const onSelectChapter = vi.fn()
    const parentChapter = createChapter({
      id: 'chapter-parent',
      title: 'Parent Chapter',
    })
    const childChapter = createChapter({
      id: 'chapter-child',
      title: 'Child Chapter',
      parentChapterId: 'chapter-parent',
    })
    const services = createServices({
      chapters: [parentChapter, childChapter],
    })

    renderReader({
      chapterId: 'chapter-child',
      onSelectChapter,
      services,
    })

    expect(await screen.findByRole('heading', { name: 'Child Chapter' }))
      .toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Parent Chapter' }))

    expect(onSelectChapter).toHaveBeenCalledWith('chapter-parent')
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

  it('opens Reader Appearance from the toolbar', async () => {
    const services = createServices()

    renderReader({ services })

    fireEvent.click(
      await screen.findByRole('button', { name: 'Reader Appearance' }),
    )

    expect(screen.getByText('Reader Appearance')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Readerly' }).getAttribute(
        'aria-pressed',
      ),
    ).toBe('true')
    expect(screen.getByText('14 pt')).toBeTruthy()
  })

  it('updates reader font and font size preferences', async () => {
    const services = createServices()

    renderReader({ services })

    fireEvent.click(
      await screen.findByRole('button', { name: 'Reader Appearance' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'NV Garamond' }))
    fireEvent.click(screen.getByRole('button', { name: 'Increase Font Size' }))

    expect(
      screen.getByRole('button', { name: 'NV Garamond' }).getAttribute(
        'aria-pressed',
      ),
    ).toBe('true')
    expect(screen.getByText('15 pt')).toBeTruthy()

    await waitFor(() => {
      expect(
        window.localStorage.getItem(READER_APPEARANCE_STORAGE_KEY),
      ).toContain('"fontId":"nv-garamond"')
    })
    expect(window.localStorage.getItem(READER_APPEARANCE_STORAGE_KEY)).toContain(
      '"fontSizePt":15',
    )
  })

  it('uses stored reader appearance preferences', async () => {
    window.localStorage.setItem(
      READER_APPEARANCE_STORAGE_KEY,
      JSON.stringify({ fontId: 'nv-jost', fontSizePt: 18 }),
    )
    const services = createServices()

    renderReader({ services })

    await screen.findByRole('heading', { name: 'The Gate' })
    fireEvent.click(screen.getByRole('button', { name: 'Reader Appearance' }))

    await waitFor(() => {
      expect(screen.getByText('18 pt')).toBeTruthy()
    })
    expect(
      screen.getByRole('button', { name: 'NV Jost' }).getAttribute(
        'aria-pressed',
      ),
    ).toBe('true')
    expect(
      screen.getByText('The path begins here.').parentElement?.style.fontFamily,
    ).toContain('NV Jost')
  })

  it('resets reader appearance preferences to defaults', async () => {
    window.localStorage.setItem(
      READER_APPEARANCE_STORAGE_KEY,
      JSON.stringify({ fontId: 'nv-jost', fontSizePt: 18 }),
    )
    const services = createServices()

    renderReader({ services })

    fireEvent.click(
      await screen.findByRole('button', { name: 'Reader Appearance' }),
    )
    await waitFor(() => {
      expect(screen.getByText('18 pt')).toBeTruthy()
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset Reader Appearance' }),
    )

    expect(screen.getByText('14 pt')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Readerly' }).getAttribute(
        'aria-pressed',
      ),
    ).toBe('true')
    await waitFor(() => {
      expect(window.localStorage.getItem(READER_APPEARANCE_STORAGE_KEY)).toBe(
        JSON.stringify({ fontId: 'readerly', fontSizePt: 14 }),
      )
    })
  })

  it('opens branch creation from the current chapter', async () => {
    const onCreateChildChapter = vi.fn()
    const services = createServices()

    renderReader({ onCreateChildChapter, services })

    fireEvent.click(
      await screen.findByRole('button', { name: /add branch/i }),
    )

    expect(onCreateChildChapter).toHaveBeenCalledWith(
      'story-1',
      'chapter-1',
    )
  })

  it('shows a missing chapter state for an invalid chapter id', async () => {
    const onOpenStoryDetails = vi.fn()
    const services = createServices()

    renderReader({ chapterId: 'missing-chapter', onOpenStoryDetails, services })

    expect(await screen.findByText('Chapter not found')).toBeTruthy()
    expect(
      screen.getByText('This chapter is not part of the selected story.'),
    ).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Reader actions' }))
      .toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Story Details' }))

    expect(onOpenStoryDetails).toHaveBeenCalledWith('story-1')
    expect(services.getNextChapters).not.toHaveBeenCalled()
  })

  it('renders a branch list for a single next chapter and navigates to it', async () => {
    const onSelectChapter = vi.fn()
    const introChapter = createChapter()
    const nextChapter = createChapter({
      id: 'chapter-next',
      title: 'Across the Bridge',
      parentChapterId: 'chapter-1',
    })
    const services = createServices({
      chapters: [introChapter, nextChapter],
      nextChapters: [nextChapter],
    })

    render(
      <ControlledStoryReader
        onSelectChapter={onSelectChapter}
        services={services}
      />,
    )

    expect(await screen.findByText('What happens next?')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /continue/i })).toBeNull()

    fireEvent.click(
      screen.getByRole('button', { name: /Across the Bridge/i }),
    )

    expect(onSelectChapter).toHaveBeenCalledWith('chapter-next')
    expect(await screen.findByRole('heading', { name: 'Across the Bridge' }))
      .toBeTruthy()
  })

  it('renders branch choices and navigates to the selected chapter', async () => {
    const onSelectChapter = vi.fn()
    const introChapter = createChapter()
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
      chapters: [introChapter, bridgeChapter, riverChapter],
      nextChapters: [bridgeChapter, riverChapter],
    })

    render(
      <ControlledStoryReader
        onSelectChapter={onSelectChapter}
        services={services}
      />,
    )

    expect(await screen.findByText('What happens next?')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cross the bridge' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Follow the river' }))

    expect(onSelectChapter).toHaveBeenCalledWith('chapter-river')
    expect(await screen.findByRole('heading', { name: 'Follow the river' }))
      .toBeTruthy()
  })

  it('navigates to the parent chapter and trims the session path', async () => {
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
      getIntroChapterByStoryId: vi.fn(() => Promise.resolve(firstChapter)),
      getNextChapters: vi.fn((selectedChapterId: string) =>
        Promise.resolve(
          selectedChapterId === 'chapter-first' ? [nextChapter] : [],
        ),
      ),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    render(
      <ControlledStoryReader
        onSelectChapter={onSelectChapter}
        services={services}
      />,
    )

    fireEvent.click(await screen.findByRole('button', { name: /Next Chapter/i }))

    expect(onSelectChapter).toHaveBeenLastCalledWith('chapter-next')

    expect(await screen.findByRole('heading', { name: 'Next Chapter' }))
      .toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
    expect(await screen.findByRole('button', { name: 'Parent Chapter' }))
      .toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Parent Chapter' }))

    expect(onSelectChapter).toHaveBeenLastCalledWith('chapter-first')
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Parent Chapter' })).toBeNull()
    })
  })

  it('clears parent navigation when switching to a story intro', async () => {
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
      getIntroChapterByStoryId: vi.fn((selectedStoryId: string) =>
        Promise.resolve(
          selectedStoryId === 'story-1' ? firstIntro : secondIntro,
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
      <StorySwitchingReader
        onSelectChapter={onSelectChapter}
        services={services}
        storyId="story-1"
      />,
    )

    fireEvent.click(await screen.findByRole('button', { name: /First Next/i }))

    expect(await screen.findByRole('heading', { name: 'First Next' }))
      .toBeTruthy()
    expect(await screen.findByRole('button', { name: 'Parent Chapter' }))
      .toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()

    view.rerender(
      <StorySwitchingReader
        onSelectChapter={onSelectChapter}
        services={services}
        storyId="story-2"
      />,
    )

    expect(await screen.findByRole('heading', { name: 'Second Intro' }))
      .toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Parent Chapter' })).toBeNull()
  })

  it('renders The End for a terminal chapter', async () => {
    const services = createServices({ nextChapters: [] })

    renderReader({ services })

    expect(await screen.findByText('What happens next?')).toBeTruthy()
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

  it('renders nothing when ready reader content has no story context', () => {
    const view = render(
      <ReaderContent
        nextChapters={[]}
        onCreateChildChapter={vi.fn()}
        onCreateIntroChapter={vi.fn()}
        onSelectNextChapter={vi.fn()}
        readerFontFamily="Readerly"
        readerFontSizePt={14}
        status="ready"
      />,
    )

    expect(view.container.textContent).toBe('')
  })
})
