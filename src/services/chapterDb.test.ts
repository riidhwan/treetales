import { IDBFactory } from 'fake-indexeddb'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createChapter,
  deleteChapter,
  getChapterById,
  getChaptersByStoryId,
  getNextChapters,
  updateChapter,
} from '@/services/chapterDb'
import { DB_NAME } from '@/services/db'
import { createStory } from '@/services/storyDb'

describe('chapterDb', () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await deleteDatabase()
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
      parentChapterIds: [],
    })

    expect(chapter).toMatchObject({
      storyId: story.id,
      title: 'Start',
      content: 'Once',
      parentChapterIds: [],
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
      parentChapterIds: [],
    })
    const left = await createChapter({
      storyId: story.id,
      title: 'Left',
      content: 'Go left',
      parentChapterIds: [root.id],
    })
    const right = await createChapter({
      storyId: story.id,
      title: 'Right',
      content: 'Go right',
      parentChapterIds: [root.id],
    })
    const other = await createChapter({
      storyId: otherStory.id,
      title: 'Other root',
      content: 'Elsewhere',
      parentChapterIds: [],
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

  it('removes deleted chapter ids from remaining chapter parents', async () => {
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const root = await createChapter({
      storyId: story.id,
      title: 'Root',
      content: 'Start',
      parentChapterIds: [],
    })
    const middle = await createChapter({
      storyId: story.id,
      title: 'Middle',
      content: 'Continue',
      parentChapterIds: [root.id],
    })
    const ending = await createChapter({
      storyId: story.id,
      title: 'Ending',
      content: 'End',
      parentChapterIds: [root.id, middle.id],
    })

    await expect(deleteChapter(root.id)).resolves.toBe(true)

    await expect(getChapterById(middle.id)).resolves.toMatchObject({
      parentChapterIds: [],
    })
    await expect(getChapterById(ending.id)).resolves.toMatchObject({
      parentChapterIds: [middle.id],
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
        parentChapterIds: [],
      }),
    ).rejects.toThrow('does not exist')

    await expect(
      createChapter({
        storyId: story.id,
        title: 'Invalid',
        content: 'No parent',
        parentChapterIds: ['missing-parent'],
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
      parentChapterIds: [],
    })

    await expect(
      createChapter({
        storyId: story.id,
        title: 'Invalid',
        content: 'Wrong story',
        parentChapterIds: [otherRoot.id],
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
      parentChapterIds: [],
    })
    const middle = await createChapter({
      storyId: story.id,
      title: 'Middle',
      content: 'Continue',
      parentChapterIds: [root.id],
    })
    const ending = await createChapter({
      storyId: story.id,
      title: 'Ending',
      content: 'End',
      parentChapterIds: [middle.id],
    })

    await expect(
      updateChapter(root.id, { parentChapterIds: [root.id] }),
    ).rejects.toThrow('parent itself')
    await expect(
      updateChapter(root.id, { parentChapterIds: [ending.id] }),
    ).rejects.toThrow('cycles')
  })

  it('rejects duplicate parent chapter ids', async () => {
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const root = await createChapter({
      storyId: story.id,
      title: 'Root',
      content: 'Start',
      parentChapterIds: [],
    })

    await expect(
      createChapter({
        storyId: story.id,
        title: 'Duplicate',
        content: 'Invalid',
        parentChapterIds: [root.id, root.id],
      }),
    ).rejects.toThrow('same parent more than once')
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
      parentChapterIds: [],
    })
    const firstById = await createChapter({
      storyId: story.id,
      title: 'First',
      content: 'Same time',
      parentChapterIds: [],
    })

    now = 50
    const firstByDate = await createChapter({
      storyId: story.id,
      title: 'Earlier',
      content: 'Earlier time',
      parentChapterIds: [],
    })

    await expect(getChaptersByStoryId(story.id)).resolves.toEqual([
      firstByDate,
      firstById,
      secondById,
    ])
  })

  it('clones parent chapter ids when updating a chapter', async () => {
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const root = await createChapter({
      storyId: story.id,
      title: 'Root',
      content: 'Start',
      parentChapterIds: [],
    })
    const child = await createChapter({
      storyId: story.id,
      title: 'Child',
      content: 'Continue',
      parentChapterIds: [],
    })
    const parentChapterIds = [root.id]

    const updatedChapter = await updateChapter(child.id, { parentChapterIds })
    parentChapterIds.push(child.id)

    await expect(getChapterById(child.id)).resolves.toMatchObject({
      parentChapterIds: [root.id],
    })
    expect(updatedChapter?.parentChapterIds).toEqual([root.id])
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
      parentChapterIds: [],
    })
    const linked = await createChapter({
      storyId: story.id,
      title: 'Linked',
      content: 'Continue',
      parentChapterIds: [root.id],
    })
    const unlinked = await createChapter({
      storyId: story.id,
      title: 'Unlinked',
      content: 'Elsewhere',
      parentChapterIds: [],
    })

    now = 90
    await expect(deleteChapter(root.id)).resolves.toBe(true)

    await expect(getChapterById(linked.id)).resolves.toMatchObject({
      parentChapterIds: [],
      updatedAt: 90,
    })
    await expect(getChapterById(unlinked.id)).resolves.toMatchObject({
      parentChapterIds: [],
      updatedAt: unlinked.updatedAt,
    })
  })
})

function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to delete test database.'))
    }

    request.onblocked = () => {
      reject(new Error('Test database deletion was blocked.'))
    }
  })
}
