import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createIndexedDbCharacterIllustrationRepository } from '@/repositories/indexedDb/characterIllustrationRepository'
import { createIndexedDbCharacterRepository } from '@/repositories/indexedDb/characterRepository'
import {
  CHARACTER_ILLUSTRATIONS_STORE,
  CHARACTERS_STORE,
  STORIES_STORE,
  openDb,
  transactionDone,
} from '@/repositories/indexedDb/db'
import { createIndexedDbStoryRepository } from '@/repositories/indexedDb/storyRepository'
import type {
  CharacterIllustrationRepository,
  CharacterRepository,
  StoryRepository,
} from '@/repositories/types'
import type {
  Character,
  CharacterIllustration,
  Story,
} from '@/services/types'
import {
  deleteTestDatabase,
  installFakeIndexedDb,
} from '@/test/indexedDb'

let characters: CharacterRepository
let illustrations: CharacterIllustrationRepository
let stories: StoryRepository

beforeEach(() => {
  installFakeIndexedDb()
  characters = createIndexedDbCharacterRepository()
  illustrations = createIndexedDbCharacterIllustrationRepository()
  stories = createIndexedDbStoryRepository()
})

afterEach(async () => {
  vi.restoreAllMocks()
  await deleteTestDatabase()
})

describe('indexedDbCharacterIllustrationRepository', () => {
  it('inserts, reads, updates, and deletes Character Illustration metadata', async () => {
    const story = createStory({ id: 'story-1' })
    const character = createCharacter({
      id: 'character-1',
      storyId: story.id,
    })
    const illustration = createIllustration({
      id: 'illustration-1',
      storyId: story.id,
      characterId: character.id,
    })

    await stories.insertStory(story)
    await characters.insertCharacter(character)
    await illustrations.insertCharacterIllustration(illustration)

    await expect(
      illustrations.findCharacterIllustrationById(illustration.id),
    ).resolves.toEqual(illustration)
    await expect(
      illustrations.findCharacterIllustrationsByCharacterId(character.id),
    ).resolves.toEqual([illustration])

    const updatedIllustration =
      await illustrations.updateCharacterIllustration(illustration.id, {
        label: 'Reference',
        order: 2,
        updatedAt: 250,
      })

    expect(updatedIllustration).toEqual({
      ...illustration,
      label: 'Reference',
      order: 2,
      updatedAt: 250,
    })
    await expect(
      illustrations.deleteCharacterIllustration(illustration.id),
    ).resolves.toBe(true)
    await expect(
      illustrations.findCharacterIllustrationById(illustration.id),
    ).resolves.toBeUndefined()
    await expect(
      illustrations.deleteCharacterIllustration(illustration.id),
    ).resolves.toBe(false)
  })

  it('gets illustrations by Character and Story in user-controlled order', async () => {
    const story = createStory({ id: 'story-1' })
    const character = createCharacter({
      id: 'character-1',
      storyId: story.id,
    })
    const otherCharacter = createCharacter({
      id: 'character-2',
      storyId: story.id,
    })
    const second = createIllustration({
      id: 'illustration-b',
      storyId: story.id,
      characterId: character.id,
      order: 2,
    })
    const first = createIllustration({
      id: 'illustration-a',
      storyId: story.id,
      characterId: character.id,
      order: 1,
    })
    const other = createIllustration({
      id: 'illustration-c',
      storyId: story.id,
      characterId: otherCharacter.id,
      order: 0,
    })

    await stories.insertStory(story)
    await characters.insertCharacter(character)
    await characters.insertCharacter(otherCharacter)
    await illustrations.insertCharacterIllustration(second)
    await illustrations.insertCharacterIllustration(first)
    await illustrations.insertCharacterIllustration(other)

    await expect(
      illustrations.findCharacterIllustrationsByCharacterId(character.id),
    ).resolves.toEqual([first, second])
    await expect(
      illustrations.findCharacterIllustrationsByStoryId(story.id),
    ).resolves.toEqual([other, first, second])
  })

  it('uses creation time and id as stable order fallbacks', async () => {
    const story = createStory({ id: 'story-1' })
    const character = createCharacter({
      id: 'character-1',
      storyId: story.id,
    })
    const third = createIllustration({
      id: 'illustration-c',
      storyId: story.id,
      characterId: character.id,
      order: 1,
      createdAt: 20,
    })
    const second = createIllustration({
      id: 'illustration-b',
      storyId: story.id,
      characterId: character.id,
      order: 1,
      createdAt: 10,
    })
    const first = createIllustration({
      id: 'illustration-a',
      storyId: story.id,
      characterId: character.id,
      order: 1,
      createdAt: 10,
    })

    await stories.insertStory(story)
    await characters.insertCharacter(character)
    await illustrations.insertCharacterIllustration(third)
    await illustrations.insertCharacterIllustration(second)
    await illustrations.insertCharacterIllustration(first)

    await expect(
      illustrations.findCharacterIllustrationsByCharacterId(character.id),
    ).resolves.toEqual([first, second, third])
  })

  it('rejects metadata with missing or mismatched relationships', async () => {
    const story = createStory({ id: 'story-1' })
    const character = createCharacter({
      id: 'character-1',
      storyId: story.id,
    })
    const otherStory = createStory({ id: 'story-2' })

    await stories.insertStory(story)
    await stories.insertStory(otherStory)
    await characters.insertCharacter(character)

    await expect(
      illustrations.insertCharacterIllustration(
        createIllustration({
          id: 'missing-story',
          storyId: 'missing-story',
          characterId: character.id,
        }),
      ),
    ).rejects.toThrow('does not exist')
    await expect(
      illustrations.insertCharacterIllustration(
        createIllustration({
          id: 'missing-character',
          storyId: story.id,
          characterId: 'missing-character',
        }),
      ),
    ).rejects.toThrow('does not exist')
    await expect(
      illustrations.insertCharacterIllustration(
        createIllustration({
          id: 'wrong-story',
          storyId: otherStory.id,
          characterId: character.id,
        }),
      ),
    ).rejects.toThrow('does not belong')
  })

  it('deletes metadata by Character and Story and returns deleted records for file cleanup', async () => {
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
    const illustration = createIllustration({
      id: 'illustration-1',
      storyId: story.id,
      characterId: character.id,
    })
    const otherIllustration = createIllustration({
      id: 'illustration-2',
      storyId: otherStory.id,
      characterId: otherCharacter.id,
    })

    await stories.insertStory(story)
    await stories.insertStory(otherStory)
    await characters.insertCharacter(character)
    await characters.insertCharacter(otherCharacter)
    await illustrations.insertCharacterIllustration(illustration)
    await illustrations.insertCharacterIllustration(otherIllustration)

    await expect(
      illustrations.deleteCharacterIllustrationsByCharacterId(character.id),
    ).resolves.toEqual([illustration])
    await expect(
      illustrations.findCharacterIllustrationsByCharacterId(character.id),
    ).resolves.toEqual([])
    await expect(
      illustrations.deleteCharacterIllustrationsByStoryId(otherStory.id),
    ).resolves.toEqual([otherIllustration])
  })

  it('rejects writes when using a readonly transaction', async () => {
    const db = await openDb()

    try {
      const transaction = db.transaction(
        [STORIES_STORE, CHARACTERS_STORE, CHARACTER_ILLUSTRATIONS_STORE],
        'readonly',
      )
      const done = transactionDone(transaction)
      const readonlyIllustrations =
        createIndexedDbCharacterIllustrationRepository({
          transaction,
        })

      await expect(
        readonlyIllustrations.insertCharacterIllustration(
          createIllustration({
            id: 'illustration-1',
            storyId: 'story-1',
            characterId: 'character-1',
          }),
        ),
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
    properties: [],
    createdAt,
    updatedAt,
  }
}

function createIllustration({
  id,
  storyId,
  characterId,
  fileId = `${id}-file`,
  label = '',
  order = 0,
  createdAt = 100,
  updatedAt = createdAt,
}: Partial<CharacterIllustration> &
  Pick<CharacterIllustration, 'characterId' | 'id' | 'storyId'>): CharacterIllustration {
  return {
    id,
    storyId,
    characterId,
    fileId,
    label,
    order,
    mimeType: 'image/png',
    sizeBytes: 1024,
    width: 640,
    height: 480,
    importMode: 'normalized',
    createdAt,
    updatedAt,
  }
}
