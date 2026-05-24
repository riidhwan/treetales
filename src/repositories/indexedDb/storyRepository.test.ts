import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createIndexedDbStoryRepository } from '@/repositories/indexedDb/storyRepository'
import type { StoryRepository } from '@/repositories/types'
import type { Story } from '@/services/types'
import {
  deleteTestDatabase,
  installFakeIndexedDb,
} from '@/test/indexedDb'

let stories: StoryRepository

beforeEach(() => {
  installFakeIndexedDb()
  stories = createIndexedDbStoryRepository()
})

afterEach(async () => {
  vi.restoreAllMocks()
  await deleteTestDatabase()
})

describe('indexedDbStoryRepository', () => {
  it('inserts, reads, updates, and deletes stories', async () => {
    const story = createStory({
      id: 'story-1',
      title: 'The Root',
      description: 'A branching tale',
    })

    await stories.insertStory(story)

    await expect(stories.findStoryById(story.id)).resolves.toEqual(story)
    await expect(stories.findStories()).resolves.toEqual([story])

    const updatedStory = await stories.updateStory(story.id, {
      title: 'The Canopy',
      updatedAt: 250,
    })

    expect(updatedStory).toEqual({
      ...story,
      title: 'The Canopy',
      updatedAt: 250,
    })
    await expect(stories.findStoryById(story.id)).resolves.toEqual(
      updatedStory,
    )
    await expect(stories.deleteStory(story.id)).resolves.toBe(true)
    await expect(stories.findStoryById(story.id)).resolves.toBeUndefined()
    await expect(stories.deleteStory(story.id)).resolves.toBe(false)
  })

  it('returns undefined when updating a missing story', async () => {
    await expect(
      stories.updateStory('missing-story', {
        title: 'No story',
        updatedAt: 100,
      }),
    ).resolves.toBeUndefined()
  })

  it('sorts stories by creation time and then id', async () => {
    const secondById = createStory({
      id: 'story-b',
      title: 'Second',
      description: 'Same time',
    })
    const firstById = createStory({
      id: 'story-a',
      title: 'First',
      description: 'Same time',
    })
    const firstByDate = createStory({
      id: 'story-c',
      title: 'Earlier',
      description: 'Earlier time',
      createdAt: 50,
      updatedAt: 50,
    })

    await stories.insertStory(secondById)
    await stories.insertStory(firstById)
    await stories.insertStory(firstByDate)

    await expect(stories.findStories()).resolves.toEqual([
      firstByDate,
      firstById,
      secondById,
    ])
  })

  it('finds an example story copy by its built-in example story id', async () => {
    const ordinaryStory = createStory({
      id: 'story-ordinary',
      title: 'Ordinary',
      description: 'No starter',
      createdAt: 50,
    })
    const exampleStoryCopy = createStory({
      id: 'story-copy',
      title: 'Example copy',
      description: 'From a starter',
      builtInExampleStoryId: 'starter-bee-man',
    })

    await stories.insertStory(ordinaryStory)
    await stories.insertStory(exampleStoryCopy)

    await expect(
      stories.findStoryByBuiltInExampleStoryId('starter-bee-man'),
    ).resolves.toEqual(exampleStoryCopy)
    await expect(
      stories.findStoryByBuiltInExampleStoryId('starter-missing'),
    ).resolves.toBeUndefined()
  })
})

function createStory({
  id,
  title,
  description,
  builtInExampleStoryId,
  storyProvenance,
  createdAt = 100,
  updatedAt = createdAt,
}: Partial<Story> & Pick<Story, 'id' | 'title' | 'description'>): Story {
  return {
    id,
    title,
    description,
    builtInExampleStoryId,
    storyProvenance,
    createdAt,
    updatedAt,
  }
}
