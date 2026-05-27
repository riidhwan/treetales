import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createIndexedDbCharacterRepository } from '@/repositories/indexedDb/characterRepository'
import { createIndexedDbChapterRepository } from '@/repositories/indexedDb/chapterRepository'
import {
  CHARACTER_ILLUSTRATIONS_STORE,
  CHARACTERS_STORE,
  CHAPTERS_STORE,
  STORIES_STORE,
  openDb,
  transactionDone,
} from '@/repositories/indexedDb/db'
import { createIndexedDbStoryRepository } from '@/repositories/indexedDb/storyRepository'
import { createIndexedDbRepositoryUnitOfWork } from '@/repositories/indexedDb/unitOfWork'
import type {
  ChapterRepository,
  CharacterRepository,
  StoryRepository,
} from '@/repositories/types'
import type { Chapter, Character, Story } from '@/services/types'
import {
  deleteTestDatabase,
  installFakeIndexedDb,
} from '@/test/indexedDb'

let chapters: ChapterRepository
let characters: CharacterRepository
let stories: StoryRepository

beforeEach(() => {
  installFakeIndexedDb()
  chapters = createIndexedDbChapterRepository()
  characters = createIndexedDbCharacterRepository()
  stories = createIndexedDbStoryRepository()
})

afterEach(async () => {
  vi.restoreAllMocks()
  await deleteTestDatabase()
})

describe('indexedDbRepositoryUnitOfWork', () => {
  it('commits multi-repository writes together', async () => {
    const unitOfWork = createIndexedDbRepositoryUnitOfWork()
    const story = createStory({ id: 'story-1' })
    const chapter = createChapter({ id: 'chapter-1', storyId: story.id })
    const character = createCharacter({ id: 'character-1', storyId: story.id })

    await stories.insertStory(story)
    await chapters.insertChapter(chapter)
    await characters.insertCharacter(character)

    await expect(
      unitOfWork.run(async (repositories) => {
        await repositories.chapters.deleteChapter(chapter.id, {
          unlinkedChildrenUpdatedAt: 250,
        })
        await repositories.characters.deleteCharacter(character.id)

        return repositories.stories.deleteStory(story.id)
      }),
    ).resolves.toBe(true)

    await expect(stories.findStoryById(story.id)).resolves.toBeUndefined()
    await expect(chapters.findChapterById(chapter.id)).resolves.toBeUndefined()
    await expect(
      characters.findCharacterById(character.id),
    ).resolves.toBeUndefined()
  })

  it('rolls back multi-repository writes when the operation fails', async () => {
    const unitOfWork = createIndexedDbRepositoryUnitOfWork()
    const story = createStory({ id: 'story-1' })
    const chapter = createChapter({ id: 'chapter-1', storyId: story.id })
    const character = createCharacter({ id: 'character-1', storyId: story.id })

    await stories.insertStory(story)
    await chapters.insertChapter(chapter)
    await characters.insertCharacter(character)

    await expect(
      unitOfWork.run(async (repositories) => {
        await repositories.chapters.deleteChapter(chapter.id, {
          unlinkedChildrenUpdatedAt: 250,
        })
        await repositories.characters.deleteCharacter(character.id)

        throw new Error('stop before deleting the story')
      }),
    ).rejects.toThrow('stop before deleting the story')

    await expect(stories.findStoryById(story.id)).resolves.toEqual(story)
    await expect(chapters.findChapterById(chapter.id)).resolves.toEqual(chapter)
    await expect(characters.findCharacterById(character.id)).resolves.toEqual(
      character,
    )
  })

  it('rejects writes when a repository receives a readonly transaction', async () => {
    const db = await openDb()

    try {
      const transaction = db.transaction(
        [
          STORIES_STORE,
          CHAPTERS_STORE,
          CHARACTERS_STORE,
          CHARACTER_ILLUSTRATIONS_STORE,
        ],
        'readonly',
      )
      const done = transactionDone(transaction)
      const readonlyStories = createIndexedDbStoryRepository({ transaction })
      const readonlyChapters = createIndexedDbChapterRepository({ transaction })
      const readonlyCharacters = createIndexedDbCharacterRepository({
        transaction,
      })
      const story = createStory({ id: 'story-1' })
      const chapter = createChapter({ id: 'chapter-1', storyId: story.id })
      const character = createCharacter({
        id: 'character-1',
        storyId: story.id,
      })

      await expect(readonlyStories.insertStory(story)).rejects.toThrow(
        'readonly IndexedDB transaction',
      )
      await expect(readonlyChapters.insertChapter(chapter)).rejects.toThrow(
        'readonly IndexedDB transaction',
      )
      await expect(
        readonlyCharacters.insertCharacter(character),
      ).rejects.toThrow('readonly IndexedDB transaction')
      await done
    } finally {
      db.close()
    }
  })
})

function createStory({
  id,
  title = 'Story',
  description = 'Description',
  createdAt = 100,
  updatedAt = createdAt,
}: Partial<Story> & Pick<Story, 'id'>): Story {
  return {
    id,
    title,
    description,
    createdAt,
    updatedAt,
  }
}

function createChapter({
  id,
  storyId,
  title = 'Chapter',
  content = 'Once',
  parentChapterId = null,
  createdAt = 100,
  updatedAt = createdAt,
}: Partial<Chapter> & Pick<Chapter, 'id' | 'storyId'>): Chapter {
  return {
    id,
    storyId,
    title,
    content,
    parentChapterId,
    createdAt,
    updatedAt,
  }
}

function createCharacter({
  id,
  storyId,
  name = 'Character',
  gender = 'female',
  properties = [],
  createdAt = 100,
  updatedAt = createdAt,
}: Partial<Character> & Pick<Character, 'id' | 'storyId'>): Character {
  return {
    id,
    storyId,
    name,
    gender,
    properties,
    createdAt,
    updatedAt,
  }
}
