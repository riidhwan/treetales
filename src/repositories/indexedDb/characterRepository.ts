import { sortByCreatedAt } from '@/lib/sorting'
import type {
  CharacterRepository,
  UpdateCharacterRepositoryInput,
} from '@/repositories/types'
import {
  CHARACTERS_STORE,
  CHARACTER_STORY_ID_INDEX,
  STORIES_STORE,
  abortTransaction,
  requestToPromise,
  typedRequest,
} from '@/repositories/indexedDb/db'
import type { StoreName } from '@/repositories/indexedDb/db'
import {
  type IndexedDbRepositoryOptions,
  withIndexedDbTransaction,
} from '@/repositories/indexedDb/transaction'
import type { Character, Story } from '@/services/types'

export function createIndexedDbCharacterRepository(
  options: IndexedDbRepositoryOptions = {},
): CharacterRepository {
  return {
    insertCharacter: (character) => insertCharacter(options, character),
    findCharacterById: (id) => findCharacterById(options, id),
    findCharactersByStoryId: (storyId) =>
      findCharactersByStoryId(options, storyId),
    updateCharacter: (id, input) => updateCharacter(options, id, input),
    deleteCharacter: (id) => deleteCharacter(options, id),
    deleteCharactersByStoryId: (storyId) =>
      deleteCharactersByStoryId(options, storyId),
  }
}

async function insertCharacter(
  options: IndexedDbRepositoryOptions,
  character: Character,
): Promise<void> {
  await withTransaction(
    options,
    [STORIES_STORE, CHARACTERS_STORE],
    'readwrite',
    async (transaction) => {
      await validateCharacterStory(transaction, character.storyId)
      await requestToPromise(
        typedRequest<IDBValidKey>(
          transaction.objectStore(CHARACTERS_STORE).add(character),
        ),
      )
    },
  )
}

async function findCharacterById(
  options: IndexedDbRepositoryOptions,
  id: string,
): Promise<Character | undefined> {
  return withCharacterStore(options, 'readonly', (store) =>
    requestToPromise(typedRequest<Character | undefined>(store.get(id))),
  )
}

async function findCharactersByStoryId(
  options: IndexedDbRepositoryOptions,
  storyId: string,
): Promise<Character[]> {
  return withCharacterStore(options, 'readonly', async (store) => {
    const characters = await requestToPromise(
      typedRequest<Character[]>(
        store.index(CHARACTER_STORY_ID_INDEX).getAll(storyId),
      ),
    )

    return sortByCreatedAt(characters)
  })
}

async function updateCharacter(
  options: IndexedDbRepositoryOptions,
  id: string,
  input: UpdateCharacterRepositoryInput,
): Promise<Character | undefined> {
  return withTransaction(
    options,
    [STORIES_STORE, CHARACTERS_STORE],
    'readwrite',
    async (transaction) => {
      const charactersStore = transaction.objectStore(CHARACTERS_STORE)
      const character = await requestToPromise(
        typedRequest<Character | undefined>(charactersStore.get(id)),
      )

      if (!character) {
        return undefined
      }

      await validateCharacterStory(transaction, character.storyId)

      const updatedCharacter: Character = {
        ...character,
        ...input,
        updatedAt: input.updatedAt,
      }

      await requestToPromise(
        typedRequest<IDBValidKey>(charactersStore.put(updatedCharacter)),
      )

      return updatedCharacter
    },
  )
}

async function deleteCharacter(
  options: IndexedDbRepositoryOptions,
  id: string,
): Promise<boolean> {
  return withCharacterStore(options, 'readwrite', async (store) => {
    const character = await requestToPromise(
      typedRequest<Character | undefined>(store.get(id)),
    )

    if (!character) {
      return false
    }

    await requestToPromise(typedRequest<undefined>(store.delete(id)))

    return true
  })
}

async function deleteCharactersByStoryId(
  options: IndexedDbRepositoryOptions,
  storyId: string,
): Promise<void> {
  await withCharacterStore(options, 'readwrite', async (store) => {
    const characters = await requestToPromise(
      typedRequest<Character[]>(
        store.index(CHARACTER_STORY_ID_INDEX).getAll(storyId),
      ),
    )

    for (const character of characters) {
      await requestToPromise(
        typedRequest<undefined>(store.delete(character.id)),
      )
    }
  })
}

async function withCharacterStore<T>(
  options: IndexedDbRepositoryOptions,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  return withTransaction(options, [CHARACTERS_STORE], mode, (transaction) =>
    operation(transaction.objectStore(CHARACTERS_STORE)),
  )
}

async function withTransaction<T>(
  options: IndexedDbRepositoryOptions,
  storeNames: readonly StoreName[],
  mode: IDBTransactionMode,
  operation: (transaction: IDBTransaction) => Promise<T>,
): Promise<T> {
  return withIndexedDbTransaction(options, storeNames, mode, operation)
}

async function validateCharacterStory(
  transaction: IDBTransaction,
  storyId: string,
): Promise<void> {
  const story = await requestToPromise(
    typedRequest<Story | undefined>(
      transaction.objectStore(STORIES_STORE).get(storyId),
    ),
  )

  if (!story) {
    abortTransaction(
      transaction,
      new Error(`Story ${storyId} does not exist.`),
    )
  }
}
