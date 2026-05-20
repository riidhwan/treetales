import { createIndexedDbCharacterRepository } from '@/repositories/indexedDb/characterRepository'
import { createIndexedDbRepositoryUnitOfWork } from '@/repositories/indexedDb/unitOfWork'
import type {
  CharacterRepository,
  UpdateCharacterRepositoryInput,
} from '@/repositories/types'
import type {
  Character,
  CharacterProperty,
  CreateCharacterInput,
  UpdateCharacterInput,
} from '@/services/types'

const repositoryUnitOfWork = createIndexedDbRepositoryUnitOfWork()

export async function createCharacter(
  input: CreateCharacterInput,
): Promise<Character> {
  const now = Date.now()
  const character: Character = {
    id: crypto.randomUUID(),
    storyId: input.storyId,
    name: input.name.trim(),
    gender: input.gender,
    properties: normalizeProperties(input.properties),
    createdAt: now,
    updatedAt: now,
  }

  await repositoryUnitOfWork.run(async ({ characters, stories }) => {
    await characters.insertCharacter(character)
    await stories.updateStory(input.storyId, { updatedAt: now })
  })

  return character
}

export async function getCharacterById(
  id: string,
): Promise<Character | undefined> {
  const characterRepository = getCharacterRepository()

  return characterRepository.findCharacterById(id)
}

export async function getCharactersByStoryId(
  storyId: string,
): Promise<Character[]> {
  const characterRepository = getCharacterRepository()

  return characterRepository.findCharactersByStoryId(storyId)
}

export async function updateCharacter(
  id: string,
  input: UpdateCharacterInput,
): Promise<Character | undefined> {
  const now = Date.now()

  return repositoryUnitOfWork.run(async ({ characters, stories }) => {
    const updatedCharacter = await characters.updateCharacter(
      id,
      createUpdateCharacterRepositoryInput(input, now),
    )

    if (!updatedCharacter) {
      return undefined
    }

    await stories.updateStory(updatedCharacter.storyId, { updatedAt: now })

    return updatedCharacter
  })
}

export async function deleteCharacter(id: string): Promise<boolean> {
  const now = Date.now()

  return repositoryUnitOfWork.run(async ({ characters, stories }) => {
    const character = await characters.findCharacterById(id)

    if (!character) {
      return false
    }

    await characters.deleteCharacter(id)
    await stories.updateStory(character.storyId, { updatedAt: now })

    return true
  })
}

function getCharacterRepository(): CharacterRepository {
  return createIndexedDbCharacterRepository()
}

function normalizeProperties(
  properties: readonly CharacterProperty[],
): CharacterProperty[] {
  return properties
    .map((property) => ({
      key: property.key.trim(),
      value: property.value.trim(),
    }))
    .filter((property) => property.key.length > 0)
}

function createUpdateCharacterRepositoryInput(
  input: UpdateCharacterInput,
  updatedAt: number,
): UpdateCharacterRepositoryInput {
  const repositoryInput: UpdateCharacterRepositoryInput = { updatedAt }

  if (input.name !== undefined) {
    repositoryInput.name = input.name.trim()
  }

  if (input.gender !== undefined) {
    repositoryInput.gender = input.gender
  }

  if (input.properties !== undefined) {
    repositoryInput.properties = normalizeProperties(input.properties)
  }

  return repositoryInput
}
