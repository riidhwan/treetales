import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createChapter,
  deleteChapter,
  getChapterById,
  getChaptersByStoryId,
  getIntroChapterByStoryId,
  getNextChapters,
  updateChapter,
} from '@/services/chapterDb'
import { createStory } from '@/services/storyDb'
import {
  deleteTestDatabase,
  installFakeIndexedDb,
} from '@/test/indexedDb'

describe('chapterDb', () => {
  beforeEach(() => {
    installFakeIndexedDb()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await deleteTestDatabase()
  })

  it('creates, reads, updates, and deletes chapters', async () => {
    let now = 10
    vi.spyOn(Date, 'now').mockImplementation(() => now)

    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    now = 20
    const chapter = await createChapter({
      storyId: story.id,
      title: 'Start',
      content: 'Once',
      parentChapterId: null,
    })

    expect(chapter).toMatchObject({
      storyId: story.id,
      title: 'Start',
      content: 'Once',
      parentChapterId: null,
      createdAt: 20,
      updatedAt: 20,
    })
    await expect(getChapterById(chapter.id)).resolves.toEqual(chapter)

    now = 30
    const updatedChapter = await updateChapter(chapter.id, {
      content: 'Once again',
    })

    expect(updatedChapter).toEqual({
      ...chapter,
      content: 'Once again',
      updatedAt: 30,
    })
    await expect(deleteChapter(chapter.id)).resolves.toBe(true)
    await expect(getChapterById(chapter.id)).resolves.toBeUndefined()
    await expect(deleteChapter(chapter.id)).resolves.toBe(false)
  })

  it('gets chapters by story id and next chapters through the parent index', async () => {
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const otherStory = await createStory({
      title: 'Other',
      description: 'Description',
    })
    const root = await createChapter({
      storyId: story.id,
      title: 'Root',
      content: 'Start',
      parentChapterId: null,
    })
    const left = await createChapter({
      storyId: story.id,
      title: 'Left',
      content: 'Go left',
      parentChapterId: root.id,
    })
    const right = await createChapter({
      storyId: story.id,
      title: 'Right',
      content: 'Go right',
      parentChapterId: root.id,
    })
    const other = await createChapter({
      storyId: otherStory.id,
      title: 'Other root',
      content: 'Elsewhere',
      parentChapterId: null,
    })

    const storyChapters = await getChaptersByStoryId(story.id)
    expect(storyChapters).toHaveLength(3)
    expect(storyChapters).toEqual(expect.arrayContaining([root, left, right]))
    await expect(getChaptersByStoryId(otherStory.id)).resolves.toEqual([other])
    const nextChapters = await getNextChapters(root.id)
    expect(nextChapters).toHaveLength(2)
    expect(nextChapters).toEqual(expect.arrayContaining([left, right]))
    await expect(getNextChapters(left.id)).resolves.toEqual([])
  })

  it('gets the intro chapter for a story without returning child chapters', async () => {
    let now = 100
    vi.spyOn(Date, 'now').mockImplementation(() => now)

    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const otherStory = await createStory({
      title: 'Other',
      description: 'Description',
    })
    const intro = await createChapter({
      storyId: story.id,
      title: 'Intro',
      content: 'Start',
      parentChapterId: null,
    })
    now = 200
    await createChapter({
      storyId: story.id,
      title: 'Child',
      content: 'Continue',
      parentChapterId: intro.id,
    })
    await createChapter({
      storyId: otherStory.id,
      title: 'Other Intro',
      content: 'Elsewhere',
      parentChapterId: null,
    })

    await expect(getIntroChapterByStoryId(story.id)).resolves.toEqual(intro)
  })

  it('returns the earliest intro chapter when legacy data has multiple intros', async () => {
    let now = 100
    vi.spyOn(Date, 'now').mockImplementation(() => now)

    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const laterIntro = await createChapter({
      storyId: story.id,
      title: 'Later Intro',
      content: 'Later',
      parentChapterId: null,
    })

    now = 50
    const earliestIntro = await createChapter({
      storyId: story.id,
      title: 'Earliest Intro',
      content: 'Earlier',
      parentChapterId: null,
    })

    await expect(getIntroChapterByStoryId(story.id)).resolves.toEqual(
      earliestIntro,
    )
    expect(laterIntro.createdAt).toBeGreaterThan(earliestIntro.createdAt)
  })

  it('removes deleted chapter ids from remaining chapter parents', async () => {
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const root = await createChapter({
      storyId: story.id,
      title: 'Root',
      content: 'Start',
      parentChapterId: null,
    })
    const middle = await createChapter({
      storyId: story.id,
      title: 'Middle',
      content: 'Continue',
      parentChapterId: root.id,
    })
    const ending = await createChapter({
      storyId: story.id,
      title: 'Ending',
      content: 'End',
      parentChapterId: middle.id,
    })

    await expect(deleteChapter(root.id)).resolves.toBe(true)

    await expect(getChapterById(middle.id)).resolves.toMatchObject({
      parentChapterId: null,
    })
    await expect(getChapterById(ending.id)).resolves.toMatchObject({
      parentChapterId: middle.id,
    })
  })

  it('rejects chapters for missing stories and missing parent chapters', async () => {
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })

    await expect(
      createChapter({
        storyId: 'missing-story',
        title: 'Invalid',
        content: 'No story',
        parentChapterId: null,
      }),
    ).rejects.toThrow('does not exist')

    await expect(
      createChapter({
        storyId: story.id,
        title: 'Invalid',
        content: 'No parent',
        parentChapterId: 'missing-parent',
      }),
    ).rejects.toThrow('does not exist in story')
  })

  it('rejects parents from other stories', async () => {
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const otherStory = await createStory({
      title: 'Other',
      description: 'Description',
    })
    const otherRoot = await createChapter({
      storyId: otherStory.id,
      title: 'Other root',
      content: 'Elsewhere',
      parentChapterId: null,
    })

    await expect(
      createChapter({
        storyId: story.id,
        title: 'Invalid',
        content: 'Wrong story',
        parentChapterId: otherRoot.id,
      }),
    ).rejects.toThrow('does not exist in story')
  })

  it('rejects self-parenting and cycles', async () => {
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const root = await createChapter({
      storyId: story.id,
      title: 'Root',
      content: 'Start',
      parentChapterId: null,
    })
    const middle = await createChapter({
      storyId: story.id,
      title: 'Middle',
      content: 'Continue',
      parentChapterId: root.id,
    })
    const ending = await createChapter({
      storyId: story.id,
      title: 'Ending',
      content: 'End',
      parentChapterId: middle.id,
    })

    await expect(
      updateChapter(root.id, { parentChapterId: root.id }),
    ).rejects.toThrow('parent itself')
    await expect(
      updateChapter(root.id, { parentChapterId: ending.id }),
    ).rejects.toThrow('cycles')
  })

  it('returns undefined when updating a missing chapter', async () => {
    await expect(
      updateChapter('missing-chapter', { title: 'No chapter' }),
    ).resolves.toBeUndefined()
  })

  it('sorts chapters by creation time and then id', async () => {
    let now = 100
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-4000-8000-0000000000ff')
      .mockReturnValueOnce('00000000-0000-4000-8000-00000000000b')
      .mockReturnValueOnce('00000000-0000-4000-8000-00000000000a')
      .mockReturnValueOnce('00000000-0000-4000-8000-00000000000c')

    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const secondById = await createChapter({
      storyId: story.id,
      title: 'Second',
      content: 'Same time',
      parentChapterId: null,
    })
    const firstById = await createChapter({
      storyId: story.id,
      title: 'First',
      content: 'Same time',
      parentChapterId: null,
    })

    now = 50
    const firstByDate = await createChapter({
      storyId: story.id,
      title: 'Earlier',
      content: 'Earlier time',
      parentChapterId: null,
    })

    await expect(getChaptersByStoryId(story.id)).resolves.toEqual([
      firstByDate,
      firstById,
      secondById,
    ])
  })

  it('updates a chapter parent id', async () => {
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const root = await createChapter({
      storyId: story.id,
      title: 'Root',
      content: 'Start',
      parentChapterId: null,
    })
    const child = await createChapter({
      storyId: story.id,
      title: 'Child',
      content: 'Continue',
      parentChapterId: null,
    })

    const updatedChapter = await updateChapter(child.id, {
      parentChapterId: root.id,
    })

    await expect(getChapterById(child.id)).resolves.toMatchObject({
      parentChapterId: root.id,
    })
    expect(updatedChapter?.parentChapterId).toBe(root.id)
  })

  it('updates timestamps for chapters unlinked during delete', async () => {
    let now = 10
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const root = await createChapter({
      storyId: story.id,
      title: 'Root',
      content: 'Start',
      parentChapterId: null,
    })
    const linked = await createChapter({
      storyId: story.id,
      title: 'Linked',
      content: 'Continue',
      parentChapterId: root.id,
    })
    const unlinked = await createChapter({
      storyId: story.id,
      title: 'Unlinked',
      content: 'Elsewhere',
      parentChapterId: null,
    })

    now = 90
    await expect(deleteChapter(root.id)).resolves.toBe(true)

    await expect(getChapterById(linked.id)).resolves.toMatchObject({
      parentChapterId: null,
      updatedAt: 90,
    })
    await expect(getChapterById(unlinked.id)).resolves.toMatchObject({
      parentChapterId: null,
      updatedAt: unlinked.updatedAt,
    })
  })
})
