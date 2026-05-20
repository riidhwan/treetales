import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  createCharacter,
  deleteCharacter,
  getCharacterById,
  getCharactersByStoryId,
  updateCharacter,
} from '@/services/characterService'
import { createStory, getStoryById } from '@/services/storyService'
import { deleteTestDatabase, installFakeIndexedDb } from '@/test/indexedDb'

describe('characterService', () => {
  beforeAll(() => {
    installFakeIndexedDb()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await deleteTestDatabase()
  })

  it('creates, reads, updates, and deletes characters', async () => {
    let now = 10
    vi.spyOn(Date, 'now').mockImplementation(() => now)

    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    now = 20
    const character = await createCharacter({
      storyId: story.id,
      name: ' Mira ',
      gender: 'female',
      properties: [
        { key: ' age ', value: ' 32 ' },
        { key: ' ', value: 'ignored' },
        { key: 'description', value: ' line one\nline two ' },
      ],
    })

    expect(character).toMatchObject({
      storyId: story.id,
      name: 'Mira',
      gender: 'female',
      properties: [
        { key: 'age', value: '32' },
        { key: 'description', value: 'line one\nline two' },
      ],
      createdAt: 20,
      updatedAt: 20,
    })
    await expect(getCharacterById(character.id)).resolves.toEqual(character)
    await expect(getStoryById(story.id)).resolves.toMatchObject({
      updatedAt: 20,
    })

    now = 30
    const updatedCharacter = await updateCharacter(character.id, {
      name: 'Mira',
      gender: 'male',
      properties: [{ key: ' role ', value: ' guide ' }],
    })

    expect(updatedCharacter).toEqual({
      ...character,
      name: 'Mira',
      gender: 'male',
      properties: [{ key: 'role', value: 'guide' }],
      updatedAt: 30,
    })
    await expect(getStoryById(story.id)).resolves.toMatchObject({
      updatedAt: 30,
    })

    now = 40
    await expect(deleteCharacter(character.id)).resolves.toBe(true)
    await expect(getCharacterById(character.id)).resolves.toBeUndefined()
    await expect(getStoryById(story.id)).resolves.toMatchObject({
      updatedAt: 40,
    })
    await expect(deleteCharacter(character.id)).resolves.toBe(false)
  })

  it('gets characters by story id', async () => {
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const otherStory = await createStory({
      title: 'Other',
      description: 'Description',
    })
    const character = await createCharacter({
      storyId: story.id,
      name: 'Mira',
      gender: 'female',
      properties: [],
    })
    const otherCharacter = await createCharacter({
      storyId: otherStory.id,
      name: 'Tomas',
      gender: 'male',
      properties: [],
    })

    await expect(getCharactersByStoryId(story.id)).resolves.toEqual([
      character,
    ])
    await expect(getCharactersByStoryId(otherStory.id)).resolves.toEqual([
      otherCharacter,
    ])
  })

  it('updates a character without replacing omitted fields', async () => {
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const character = await createCharacter({
      storyId: story.id,
      name: 'Mira',
      gender: 'female',
      properties: [{ key: 'age', value: '32' }],
    })

    const updatedCharacter = await updateCharacter(character.id, {})

    expect(updatedCharacter).toMatchObject({
      name: 'Mira',
      gender: 'female',
      properties: [{ key: 'age', value: '32' }],
    })
  })

  it('rejects characters for missing stories', async () => {
    await expect(
      createCharacter({
        storyId: 'missing-story',
        name: 'Mira',
        gender: 'female',
        properties: [],
      }),
    ).rejects.toThrow('does not exist')
  })

  it('returns undefined when updating a missing character', async () => {
    await expect(
      updateCharacter('missing-character', { name: 'No one' }),
    ).resolves.toBeUndefined()
  })
})
