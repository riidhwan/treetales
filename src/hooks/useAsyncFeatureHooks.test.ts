import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useChapterCreator } from '@/hooks/useChapterCreator'
import { useChapterEditor } from '@/hooks/useChapterEditor'
import { useStoryDashboard } from '@/hooks/useStoryDashboard'
import { useStoryDetail } from '@/hooks/useStoryDetail'
import { useStoryEditor } from '@/hooks/useStoryEditor'
import { useStoryReader } from '@/hooks/useStoryReader'
import type {
  Chapter,
  Story,
} from '@/services/types'
import {
  deleteTestDatabase,
  installFakeIndexedDb,
} from '@/test/indexedDb'

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

function deferred<TValue>() {
  let resolve!: (value: TValue) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<TValue>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, reject, resolve }
}

describe('async feature hooks', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('ignores stale Story Editor loads after unmounting at each await boundary', async () => {
    const pendingStory = deferred<Story | undefined>()
    const storyServices = {
      getIntroChapterByStoryId: vi.fn(() => Promise.resolve(undefined)),
      getStoryById: vi.fn(() => pendingStory.promise),
      updateStory: vi.fn(),
    }
    const firstView = renderHook(() =>
      useStoryEditor({ services: storyServices, storyId: 'story-1' }),
    )

    firstView.unmount()

    await act(async () => {
      pendingStory.resolve(createStory())
      await pendingStory.promise
    })

    const pendingIntroChapter = deferred<Chapter | undefined>()
    const introServices = {
      getIntroChapterByStoryId: vi.fn(() => pendingIntroChapter.promise),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
      updateStory: vi.fn(),
    }
    const secondView = renderHook(() =>
      useStoryEditor({ services: introServices, storyId: 'story-1' }),
    )

    await waitFor(() => {
      expect(introServices.getIntroChapterByStoryId).toHaveBeenCalled()
    })

    secondView.unmount()

    await act(async () => {
      pendingIntroChapter.resolve(undefined)
      await pendingIntroChapter.promise
    })
  })

  it('marks the Story Editor missing when save no longer finds the story', async () => {
    const services = {
      getIntroChapterByStoryId: vi.fn(() => Promise.resolve(undefined)),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
      updateStory: vi.fn(() => Promise.resolve(undefined)),
    }
    const { result } = renderHook(() =>
      useStoryEditor({ services, storyId: 'story-1' }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    act(() => {
      result.current.setTitle('Changed Title')
    })
    await act(async () => {
      await result.current.saveStory()
    })

    expect(result.current.status).toBe('missing-story')
    expect(result.current.story).toBeUndefined()
  })

  it('marks the Story Editor errored when the story load fails', async () => {
    const services = {
      getIntroChapterByStoryId: vi.fn(() => Promise.resolve(undefined)),
      getStoryById: vi.fn(() =>
        Promise.reject(new Error('Could not load story.')),
      ),
      updateStory: vi.fn(),
    }
    const { result } = renderHook(() =>
      useStoryEditor({ services, storyId: 'story-1' }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })
    expect(result.current.errorMessage).toBe('Could not load story.')
    expect(result.current.story).toBeUndefined()
    expect(result.current.introChapter).toBeUndefined()
    expect(result.current.canSave).toBe(false)
  })

  it('does not save Story Editor or Chapter Editor forms when their current state is invalid', async () => {
    const storyServices = {
      getIntroChapterByStoryId: vi.fn(() => Promise.resolve(undefined)),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
      updateStory: vi.fn(),
    }
    const storyEditor = renderHook(() =>
      useStoryEditor({ services: storyServices, storyId: 'story-1' }),
    )

    await waitFor(() => {
      expect(storyEditor.result.current.status).toBe('ready')
    })

    act(() => {
      storyEditor.result.current.setTitle('   ')
    })
    await act(async () => {
      await storyEditor.result.current.saveStory()
    })

    expect(storyServices.updateStory).not.toHaveBeenCalled()

    const chapterServices = {
      getChapterById: vi.fn(() => Promise.resolve(createChapter())),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
      updateChapter: vi.fn(),
    }
    const chapterEditor = renderHook(() =>
      useChapterEditor({
        chapterId: 'chapter-1',
        services: chapterServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(chapterEditor.result.current.status).toBe('ready')
    })

    act(() => {
      chapterEditor.result.current.setTitle('   ')
    })
    await act(async () => {
      await chapterEditor.result.current.saveChapter()
    })

    expect(chapterServices.updateChapter).not.toHaveBeenCalled()
  })

  it('uses default services against the browser-local database boundary', async () => {
    installFakeIndexedDb()

    try {
      const dashboardView = renderHook(() =>
        useStoryDashboard({
          onEditStory: vi.fn(),
          onReadStory: vi.fn(),
        }),
      )
      const detailView = renderHook(() =>
        useStoryDetail({
          onDeleted: vi.fn(),
          storyId: 'missing-story',
        }),
      )
      const editorView = renderHook(() =>
        useStoryEditor({ storyId: 'missing-story' }),
      )
      const creatorView = renderHook(() =>
        useChapterCreator({ storyId: 'missing-story' }),
      )
      const chapterEditorView = renderHook(() =>
        useChapterEditor({
          chapterId: 'missing-chapter',
          storyId: 'missing-story',
        }),
      )
      const readerView = renderHook(() =>
        useStoryReader({
          onSelectChapter: vi.fn(),
          storyId: 'missing-story',
        }),
      )

      await waitFor(() => {
        expect(dashboardView.result.current.isLoading).toBe(false)
        expect(detailView.result.current.status).toBe('missing-story')
        expect(editorView.result.current.status).toBe('missing-story')
        expect(creatorView.result.current.status).toBe('missing-story')
        expect(chapterEditorView.result.current.status).toBe('missing-story')
        expect(readerView.result.current.status).toBe('missing-story')
      })
    } finally {
      cleanup()
      await deleteTestDatabase()
    }
  })

  it('ignores stale Story Dashboard loads and no-ops blank story creation', async () => {
    const pendingStories = deferred<Story[]>()
    const services = {
      createExampleStory: vi.fn(),
      createStory: vi.fn(),
      getStories: vi.fn(() => pendingStories.promise),
    }
    const view = renderHook(() =>
      useStoryDashboard({
        onEditStory: vi.fn(),
        onReadStory: vi.fn(),
        services,
      }),
    )

    view.unmount()

    await act(async () => {
      pendingStories.resolve([createStory()])
      await pendingStories.promise
    })

    const readyServices = {
      createExampleStory: vi.fn(),
      createStory: vi.fn(),
      getStories: vi.fn(() => Promise.resolve([])),
    }
    const { result } = renderHook(() =>
      useStoryDashboard({
        onEditStory: vi.fn(),
        onReadStory: vi.fn(),
        services: readyServices,
      }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    await act(async () => {
      await result.current.createStoryFromForm()
    })

    expect(readyServices.createStory).not.toHaveBeenCalled()
  })

  it('handles stale Story Detail loads, absent stories, and missing deletes', async () => {
    const pendingStory = deferred<Story | undefined>()
    const staleServices = {
      deleteStory: vi.fn(),
      getStoryById: vi.fn(() => pendingStory.promise),
    }
    const staleView = renderHook(() =>
      useStoryDetail({
        onDeleted: vi.fn(),
        services: staleServices,
        storyId: 'story-1',
      }),
    )

    staleView.unmount()

    await act(async () => {
      pendingStory.resolve(createStory())
      await pendingStory.promise
    })

    const absentServices = {
      deleteStory: vi.fn(),
      getStoryById: vi.fn(() => Promise.resolve(undefined)),
    }
    const absentView = renderHook(() =>
      useStoryDetail({
        onDeleted: vi.fn(),
        services: absentServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(absentView.result.current.status).toBe('missing-story')
    })
    await act(async () => {
      await absentView.result.current.deleteStory()
    })

    expect(absentServices.deleteStory).not.toHaveBeenCalled()

    const missingDeleteServices = {
      deleteStory: vi.fn(() => Promise.resolve(false)),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const missingDeleteView = renderHook(() =>
      useStoryDetail({
        onDeleted: vi.fn(),
        services: missingDeleteServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(missingDeleteView.result.current.status).toBe('ready')
    })
    await act(async () => {
      await missingDeleteView.result.current.deleteStory()
    })

    expect(missingDeleteView.result.current.status).toBe('missing-story')
  })

  it('ignores stale Chapter Creator loads after unmounting at story, intro, and parent boundaries', async () => {
    const pendingStory = deferred<Story | undefined>()
    const storyServices = {
      createChapter: vi.fn(),
      getChapterById: vi.fn(),
      getIntroChapterByStoryId: vi.fn(),
      getStoryById: vi.fn(() => pendingStory.promise),
    }
    const storyView = renderHook(() =>
      useChapterCreator({ services: storyServices, storyId: 'story-1' }),
    )

    storyView.unmount()

    await act(async () => {
      pendingStory.resolve(createStory())
      await pendingStory.promise
    })

    const pendingIntroChapter = deferred<Chapter | undefined>()
    const introServices = {
      createChapter: vi.fn(),
      getChapterById: vi.fn(),
      getIntroChapterByStoryId: vi.fn(() => pendingIntroChapter.promise),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const introView = renderHook(() =>
      useChapterCreator({ services: introServices, storyId: 'story-1' }),
    )

    await waitFor(() => {
      expect(introServices.getIntroChapterByStoryId).toHaveBeenCalled()
    })

    introView.unmount()

    await act(async () => {
      pendingIntroChapter.resolve(undefined)
      await pendingIntroChapter.promise
    })

    const pendingParentChapter = deferred<Chapter | undefined>()
    const parentServices = {
      createChapter: vi.fn(),
      getChapterById: vi.fn(() => pendingParentChapter.promise),
      getIntroChapterByStoryId: vi.fn(),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const parentView = renderHook(() =>
      useChapterCreator({
        parentChapterId: 'chapter-parent',
        services: parentServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(parentServices.getChapterById).toHaveBeenCalledWith(
        'chapter-parent',
      )
    })

    parentView.unmount()

    await act(async () => {
      pendingParentChapter.resolve(createChapter({ id: 'chapter-parent' }))
      await pendingParentChapter.promise
    })
  })

  it('returns undefined from Chapter Creator when the draft cannot be created', async () => {
    const services = {
      createChapter: vi.fn(() => Promise.resolve(createChapter())),
      getChapterById: vi.fn(() => Promise.resolve(createChapter())),
      getIntroChapterByStoryId: vi.fn(() => Promise.resolve(undefined)),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const { result } = renderHook(() =>
      useChapterCreator({
        parentChapterId: 'chapter-1',
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    await expect(result.current.createChapterFromForm()).resolves.toBeUndefined()
    expect(services.createChapter).not.toHaveBeenCalled()
  })

  it('ignores stale Chapter Editor loads and reports unavailable parent context', async () => {
    const pendingStory = deferred<Story | undefined>()
    const storyServices = {
      getChapterById: vi.fn(),
      getStoryById: vi.fn(() => pendingStory.promise),
      updateChapter: vi.fn(),
    }
    const storyView = renderHook(() =>
      useChapterEditor({
        chapterId: 'chapter-1',
        services: storyServices,
        storyId: 'story-1',
      }),
    )

    storyView.unmount()

    await act(async () => {
      pendingStory.resolve(createStory())
      await pendingStory.promise
    })

    const pendingChapter = deferred<Chapter | undefined>()
    const chapterServices = {
      getChapterById: vi.fn(() => pendingChapter.promise),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
      updateChapter: vi.fn(),
    }
    const chapterView = renderHook(() =>
      useChapterEditor({
        chapterId: 'chapter-1',
        services: chapterServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(chapterServices.getChapterById).toHaveBeenCalledWith('chapter-1')
    })

    chapterView.unmount()

    await act(async () => {
      pendingChapter.resolve(createChapter())
      await pendingChapter.promise
    })

    const parentServices = {
      getChapterById: vi
        .fn()
        .mockResolvedValueOnce(
          createChapter({
            id: 'chapter-1',
            parentChapterId: 'chapter-parent',
          }),
        )
        .mockRejectedValueOnce(new Error('parent unavailable')),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
      updateChapter: vi.fn(),
    }
    const { result } = renderHook(() =>
      useChapterEditor({
        chapterId: 'chapter-1',
        services: parentServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })
    expect(result.current.parentChapter).toBeUndefined()
    expect(result.current.parentChapterUnavailable).toBe(true)
  })

  it('marks the Chapter Editor missing when save returns an absent chapter', async () => {
    const services = {
      getChapterById: vi.fn(() => Promise.resolve(createChapter())),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
      updateChapter: vi.fn(() => Promise.resolve(undefined)),
    }
    const { result } = renderHook(() =>
      useChapterEditor({
        chapterId: 'chapter-1',
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    act(() => {
      result.current.setTitle('Changed Chapter')
    })
    await act(async () => {
      await result.current.saveChapter()
    })

    expect(result.current.status).toBe('missing-chapter')
    expect(result.current.chapter).toBeUndefined()
  })

  it('marks the Chapter Editor errored when the chapter load fails', async () => {
    const services = {
      getChapterById: vi.fn(() =>
        Promise.reject(new Error('Could not load chapter.')),
      ),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
      updateChapter: vi.fn(),
    }
    const { result } = renderHook(() =>
      useChapterEditor({
        chapterId: 'chapter-1',
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })
    expect(result.current.errorMessage).toBe('Could not load chapter.')
    expect(result.current.chapter).toBeUndefined()
    expect(result.current.story).toBeUndefined()
    expect(result.current.canSave).toBe(false)
  })

  it('ignores Chapter Editor parent context that resolves after unmount', async () => {
    const pendingParent = deferred<Chapter | undefined>()
    const services = {
      getChapterById: vi
        .fn()
        .mockResolvedValueOnce(
          createChapter({
            id: 'chapter-1',
            parentChapterId: 'chapter-parent',
          }),
        )
        .mockImplementationOnce(() => pendingParent.promise),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
      updateChapter: vi.fn(),
    }
    const view = renderHook(() =>
      useChapterEditor({
        chapterId: 'chapter-1',
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(services.getChapterById).toHaveBeenCalledWith('chapter-parent')
    })

    view.unmount()

    await act(async () => {
      pendingParent.resolve(createChapter({ id: 'chapter-parent' }))
      await pendingParent.promise
    })
  })

  it('ignores stale Story Reader loads and filters next chapters by story', async () => {
    const pendingStory = deferred<Story | undefined>()
    const storyServices = {
      getChaptersByStoryId: vi.fn(),
      getNextChapters: vi.fn(),
      getStoryById: vi.fn(() => pendingStory.promise),
    }
    const storyView = renderHook(() =>
      useStoryReader({
        onSelectChapter: vi.fn(),
        services: storyServices,
        storyId: 'story-1',
      }),
    )

    storyView.unmount()

    await act(async () => {
      pendingStory.resolve(createStory())
      await pendingStory.promise
    })

    const pendingChapters = deferred<Chapter[]>()
    const chapterServices = {
      getChaptersByStoryId: vi.fn(() => pendingChapters.promise),
      getNextChapters: vi.fn(),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const chapterView = renderHook(() =>
      useStoryReader({
        onSelectChapter: vi.fn(),
        services: chapterServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(chapterServices.getChaptersByStoryId).toHaveBeenCalled()
    })

    chapterView.unmount()

    await act(async () => {
      pendingChapters.resolve([createChapter()])
      await pendingChapters.promise
    })

    const pendingNextChapters = deferred<Chapter[]>()
    const nextServices = {
      getChaptersByStoryId: vi.fn(() => Promise.resolve([createChapter()])),
      getNextChapters: vi.fn(() => pendingNextChapters.promise),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const nextView = renderHook(() =>
      useStoryReader({
        onSelectChapter: vi.fn(),
        services: nextServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(nextServices.getNextChapters).toHaveBeenCalledWith('chapter-1')
    })

    nextView.unmount()

    await act(async () => {
      pendingNextChapters.resolve([createChapter({ id: 'chapter-next' })])
      await pendingNextChapters.promise
    })

    const sameStoryNext = createChapter({
      id: 'chapter-next',
      parentChapterId: 'chapter-1',
    })
    const otherStoryNext = createChapter({
      id: 'other-story-next',
      parentChapterId: 'chapter-1',
      storyId: 'story-2',
    })
    const filterServices = {
      getChaptersByStoryId: vi.fn(() => Promise.resolve([createChapter()])),
      getNextChapters: vi.fn(() =>
        Promise.resolve([sameStoryNext, otherStoryNext]),
      ),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const { result } = renderHook(() =>
      useStoryReader({
        onSelectChapter: vi.fn(),
        services: filterServices,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })
    expect(result.current.nextChapters).toEqual([sameStoryNext])
  })

  it('keeps Story Reader parent selection inert when there is no parent chapter', async () => {
    const onSelectChapter = vi.fn()
    const services = {
      getChaptersByStoryId: vi.fn(() => Promise.resolve([createChapter()])),
      getNextChapters: vi.fn(() => Promise.resolve([])),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const { result } = renderHook(() =>
      useStoryReader({
        onSelectChapter,
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    act(() => {
      result.current.selectParentChapter()
    })

    expect(onSelectChapter).not.toHaveBeenCalled()
  })

  it('marks the Story Reader errored when chapters fail to load', async () => {
    const services = {
      getChaptersByStoryId: vi.fn(() =>
        Promise.reject(new Error('Could not load chapters.')),
      ),
      getNextChapters: vi.fn(() => Promise.resolve([])),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const { result } = renderHook(() =>
      useStoryReader({
        onSelectChapter: vi.fn(),
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })
    expect(result.current.errorMessage).toBe('Could not load chapters.')
    expect(result.current.currentChapter).toBeUndefined()
  })

  it('does not duplicate the same next chapter in the Story Reader session path', async () => {
    const onSelectChapter = vi.fn()
    const nextChapter = createChapter({
      id: 'chapter-next',
      parentChapterId: 'chapter-1',
    })
    const services = {
      getChaptersByStoryId: vi.fn(() =>
        Promise.resolve([createChapter(), nextChapter]),
      ),
      getNextChapters: vi.fn(() => Promise.resolve([nextChapter])),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const { result } = renderHook(() =>
      useStoryReader({
        onSelectChapter,
        services,
        storyId: 'story-1',
      }),
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    act(() => {
      result.current.selectNextChapter(nextChapter)
      result.current.selectNextChapter(nextChapter)
    })

    expect(onSelectChapter).toHaveBeenCalledTimes(2)
    expect(onSelectChapter).toHaveBeenLastCalledWith('chapter-next')
  })

  it('keeps an existing Story Reader path when reselecting an earlier chapter', async () => {
    const firstChapter = createChapter({
      id: 'chapter-first',
      title: 'First',
    })
    const secondChapter = createChapter({
      id: 'chapter-second',
      parentChapterId: firstChapter.id,
      title: 'Second',
    })
    const thirdChapter = createChapter({
      id: 'chapter-third',
      parentChapterId: secondChapter.id,
      title: 'Third',
    })
    const services = {
      getChaptersByStoryId: vi.fn(() =>
        Promise.resolve([firstChapter, secondChapter, thirdChapter]),
      ),
      getNextChapters: vi.fn((chapterId: string) => {
        if (chapterId === firstChapter.id) {
          return Promise.resolve([secondChapter])
        }

        if (chapterId === secondChapter.id) {
          return Promise.resolve([thirdChapter])
        }

        return Promise.resolve([])
      }),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const view = renderHook(
      ({ chapterId }: { readonly chapterId?: string }) =>
        useStoryReader({
          chapterId,
          onSelectChapter: vi.fn(),
          services,
          storyId: 'story-1',
        }),
      { initialProps: { chapterId: undefined as string | undefined } },
    )

    await waitFor(() => {
      expect(view.result.current.currentChapter?.id).toBe(firstChapter.id)
    })

    act(() => {
      view.result.current.selectNextChapter(secondChapter)
    })
    view.rerender({ chapterId: secondChapter.id })
    await waitFor(() => {
      expect(view.result.current.currentChapter?.id).toBe(secondChapter.id)
    })

    act(() => {
      view.result.current.selectNextChapter(thirdChapter)
    })
    view.rerender({ chapterId: thirdChapter.id })
    await waitFor(() => {
      expect(view.result.current.currentChapter?.id).toBe(thirdChapter.id)
    })

    view.rerender({ chapterId: secondChapter.id })
    await waitFor(() => {
      expect(view.result.current.currentChapter?.id).toBe(secondChapter.id)
    })
  })

  it('resets the Story Reader path when directly opening an unvisited chapter', async () => {
    const firstChapter = createChapter({
      id: 'chapter-first',
      title: 'First',
    })
    const secondChapter = createChapter({
      id: 'chapter-second',
      parentChapterId: firstChapter.id,
      title: 'Second',
    })
    const services = {
      getChaptersByStoryId: vi.fn(() =>
        Promise.resolve([firstChapter, secondChapter]),
      ),
      getNextChapters: vi.fn(() => Promise.resolve([])),
      getStoryById: vi.fn(() => Promise.resolve(createStory())),
    }
    const view = renderHook(
      ({ chapterId }: { readonly chapterId?: string }) =>
        useStoryReader({
          chapterId,
          onSelectChapter: vi.fn(),
          services,
          storyId: 'story-1',
        }),
      { initialProps: { chapterId: undefined as string | undefined } },
    )

    await waitFor(() => {
      expect(view.result.current.currentChapter?.id).toBe(firstChapter.id)
    })

    view.rerender({ chapterId: secondChapter.id })

    await waitFor(() => {
      expect(view.result.current.currentChapter?.id).toBe(secondChapter.id)
    })
  })
})
