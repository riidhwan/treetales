import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getChaptersByStoryId, getNextChapters } from '@/services/chapterDb'
import { createExampleStory } from '@/services/exampleStory'
import { getStories } from '@/services/storyDb'
import {
  deleteTestDatabase,
  installFakeIndexedDb,
} from '@/test/indexedDb'

describe('createExampleStory', () => {
  beforeEach(() => {
    installFakeIndexedDb()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await deleteTestDatabase()
  })

  it('creates a readable branching example story', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100)

    const exampleStory = await createExampleStory()

    expect(exampleStory.story).toMatchObject({
      id: 'example-story-lantern-road',
      title: 'The Lantern Road',
      createdAt: 100,
      updatedAt: 100,
    })
    expect(exampleStory.chapters).toHaveLength(5)
    await expect(getStories()).resolves.toEqual([exampleStory.story])

    const rootChapter = exampleStory.chapters[0]
    const nextChapters = await getNextChapters(rootChapter.id)

    expect(rootChapter).toMatchObject({
      title: 'A Light in the Pines',
      parentChapterId: null,
    })
    expect(nextChapters.map((chapter) => chapter.title)).toEqual([
      'Cross the Moonlit Bridge',
      'Follow the Willow Lights',
    ])
  })

  it('returns the existing example story without duplicating it', async () => {
    const firstExampleStory = await createExampleStory()
    const secondExampleStory = await createExampleStory()
    const chapters = await getChaptersByStoryId(firstExampleStory.story.id)

    expect(secondExampleStory.story).toEqual(firstExampleStory.story)
    expect(secondExampleStory.chapters).toEqual(chapters)
    expect(chapters).toHaveLength(5)
    await expect(getStories()).resolves.toEqual([firstExampleStory.story])
  })
})
