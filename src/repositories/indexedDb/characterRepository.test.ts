import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createIndexedDbCharacterRepository } from '@/repositories/indexedDb/characterRepository'
import {
  CHARACTERS_STORE,
  STORIES_STORE,
  openDb,
  transactionDone,
} from '@/repositories/indexedDb/db'
import { createIndexedDbStoryRepository } from '@/repositories/indexedDb/storyRepository'
import type {
  CharacterRepository,
  StoryRepository,
} from '@/repositories/types'
import type { Character, Story } from '@/services/types'
import {
  deleteTestDatabase,
  installFakeIndexedDb,
} from '@/test/indexedDb'

let characters: CharacterRepository
let stories: StoryRepository

beforeEach(() => {
  installFakeIndexedDb()
  characters = createIndexedDbCharacterRepository()
  stories = createIndexedDbStoryRepository()
})

afterEach(async () => {
  vi.restoreAllMocks()
  await deleteTestDatabase()
})

describe('indexedDbCharacterRepository', () => {
  it('inserts, reads, updates, and deletes characters', async () => {
    const story = createStory({ id: 'story-1' })
    const character = createCharacter({
      id: 'character-1',
      storyId: story.id,
    })

    await stories.insertStory(story)
    await characters.insertCharacter(character)

    await expect(characters.findCharacterById(character.id)).resolves.toEqual(
      character,
    )
    await expect(characters.findCharactersByStoryId(story.id)).resolves.toEqual(
      [character],
    )

    const updatedCharacter = await characters.updateCharacter(character.id, {
      name: 'Mira Changed',
      updatedAt: 250,
    })

    expect(updatedCharacter).toEqual({
      ...character,
      name: 'Mira Changed',
      updatedAt: 250,
    })
    await expect(characters.findCharacterById(character.id)).resolves.toEqual(
      updatedCharacter,
    )
    await expect(characters.deleteCharacter(character.id)).resolves.toBe(true)
    await expect(
      characters.findCharacterById(character.id),
    ).resolves.toBeUndefined()
    await expect(characters.deleteCharacter(character.id)).resolves.toBe(false)
  })

  it('gets characters by story id in creation order', async () => {
    const story = createStory({ id: 'story-1' })
    const otherStory = createStory({ id: 'story-2' })
    const secondById = createCharacter({
      id: 'character-b',
      storyId: story.id,
    })
    const firstById = createCharacter({
      id: 'character-a',
      storyId: story.id,
    })
    const firstByDate = createCharacter({
      id: 'character-c',
      storyId: story.id,
      createdAt: 50,
      updatedAt: 50,
    })
    const otherCharacter = createCharacter({
      id: 'character-other',
      storyId: otherStory.id,
    })

    await stories.insertStory(story)
    await stories.insertStory(otherStory)
    await characters.insertCharacter(secondById)
    await characters.insertCharacter(firstById)
    await characters.insertCharacter(firstByDate)
    await characters.insertCharacter(otherCharacter)

    await expect(characters.findCharactersByStoryId(story.id)).resolves.toEqual(
      [firstByDate, firstById, secondById],
    )
    await expect(
      characters.findCharactersByStoryId(otherStory.id),
    ).resolves.toEqual([otherCharacter])
  })

  it('rejects characters for missing stories', async () => {
    await expect(
      characters.insertCharacter(
        createCharacter({ id: 'character-1', storyId: 'missing-story' }),
      ),
    ).rejects.toThrow('does not exist')
  })

  it('returns undefined when updating a missing character', async () => {
    await expect(
      characters.updateCharacter('missing-character', {
        name: 'No one',
        updatedAt: 200,
      }),
    ).resolves.toBeUndefined()
  })

  it('rejects writes when using a readonly transaction', async () => {
    const db = await openDb()

    try {
      const transaction = db.transaction(
        [STORIES_STORE, CHARACTERS_STORE],
        'readonly',
      )
      const done = transactionDone(transaction)
      const readonlyCharacters = createIndexedDbCharacterRepository({
        transaction,
      })

      await expect(
        readonlyCharacters.insertCharacter(
          createCharacter({ id: 'character-1', storyId: 'story-1' }),
        ),
      ).rejects.toThrow('readonly IndexedDB transaction')
      await done
    } finally {
      db.close()
    }
  })

  it('deletes all characters for a story', async () => {
    const story = createStory({ id: 'story-1' })
    const otherStory = createStory({ id: 'story-2' })
    const character = createCharacter({
      id: 'character-1',
      storyId: story.id,
    })
    const otherCharacter = createCharacter({
      id: 'character-2',
      storyId: otherStory.id,
    })

    await stories.insertStory(story)
    await stories.insertStory(otherStory)
    await characters.insertCharacter(character)
    await characters.insertCharacter(otherCharacter)
    await characters.deleteCharactersByStoryId(story.id)

    await expect(characters.findCharactersByStoryId(story.id)).resolves.toEqual(
      [],
    )
    await expect(
      characters.findCharactersByStoryId(otherStory.id),
    ).resolves.toEqual([otherCharacter])
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

function createCharacter({
  id,
  storyId,
  name = 'Mira',
  createdAt = 100,
  updatedAt = createdAt,
}: Partial<Character> & Pick<Character, 'id' | 'storyId'>): Character {
  return {
    id,
    storyId,
    name,
    gender: 'female',
    properties: [
      {
        key: 'age',
        value: '32',
      },
    ],
    createdAt,
    updatedAt,
  }
}
