import type {
  CharacterIllustrationRepository,
  UpdateCharacterIllustrationRepositoryInput,
} from '@/repositories/types'
import {
  CHARACTERS_STORE,
  CHARACTER_ILLUSTRATIONS_STORE,
  CHARACTER_ILLUSTRATION_CHARACTER_ID_INDEX,
  CHARACTER_ILLUSTRATION_STORY_ID_INDEX,
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
import type { Character, CharacterIllustration, Story } from '@/services/types'

export function createIndexedDbCharacterIllustrationRepository(
  options: IndexedDbRepositoryOptions = {},
): CharacterIllustrationRepository {
  return {
    insertCharacterIllustration: (illustration) =>
      insertCharacterIllustration(options, illustration),
    findCharacterIllustrationById: (id) =>
      findCharacterIllustrationById(options, id),
    findCharacterIllustrationsByCharacterId: (characterId) =>
      findCharacterIllustrationsByCharacterId(options, characterId),
    findCharacterIllustrationsByStoryId: (storyId) =>
      findCharacterIllustrationsByStoryId(options, storyId),
    updateCharacterIllustration: (id, input) =>
      updateCharacterIllustration(options, id, input),
    deleteCharacterIllustration: (id) =>
      deleteCharacterIllustration(options, id),
    deleteCharacterIllustrationsByCharacterId: (characterId) =>
      deleteCharacterIllustrationsByCharacterId(options, characterId),
    deleteCharacterIllustrationsByStoryId: (storyId) =>
      deleteCharacterIllustrationsByStoryId(options, storyId),
  }
}

async function insertCharacterIllustration(
  options: IndexedDbRepositoryOptions,
  illustration: CharacterIllustration,
): Promise<void> {
  await withTransaction(
    options,
    [STORIES_STORE, CHARACTERS_STORE, CHARACTER_ILLUSTRATIONS_STORE],
    'readwrite',
    async (transaction) => {
      await validateIllustrationRelationships(transaction, illustration)
      await requestToPromise(
        typedRequest<IDBValidKey>(
          transaction
            .objectStore(CHARACTER_ILLUSTRATIONS_STORE)
            .add(illustration),
        ),
      )
    },
  )
}

async function findCharacterIllustrationById(
  options: IndexedDbRepositoryOptions,
  id: string,
): Promise<CharacterIllustration | undefined> {
  return withIllustrationStore(options, 'readonly', (store) =>
    requestToPromise(
      typedRequest<CharacterIllustration | undefined>(store.get(id)),
    ),
  )
}

async function findCharacterIllustrationsByCharacterId(
  options: IndexedDbRepositoryOptions,
  characterId: string,
): Promise<CharacterIllustration[]> {
  return withIllustrationStore(options, 'readonly', async (store) => {
    const illustrations = await requestToPromise(
      typedRequest<CharacterIllustration[]>(
        store.index(CHARACTER_ILLUSTRATION_CHARACTER_ID_INDEX).getAll(characterId),
      ),
    )

    return sortIllustrations(illustrations)
  })
}

async function findCharacterIllustrationsByStoryId(
  options: IndexedDbRepositoryOptions,
  storyId: string,
): Promise<CharacterIllustration[]> {
  return withIllustrationStore(options, 'readonly', async (store) => {
    const illustrations = await requestToPromise(
      typedRequest<CharacterIllustration[]>(
        store.index(CHARACTER_ILLUSTRATION_STORY_ID_INDEX).getAll(storyId),
      ),
    )

    return sortIllustrations(illustrations)
  })
}

async function updateCharacterIllustration(
  options: IndexedDbRepositoryOptions,
  id: string,
  input: UpdateCharacterIllustrationRepositoryInput,
): Promise<CharacterIllustration | undefined> {
  return withTransaction(
    options,
    [STORIES_STORE, CHARACTERS_STORE, CHARACTER_ILLUSTRATIONS_STORE],
    'readwrite',
    async (transaction) => {
      const illustrationsStore = transaction.objectStore(
        CHARACTER_ILLUSTRATIONS_STORE,
      )
      const illustration = await requestToPromise(
        typedRequest<CharacterIllustration | undefined>(
          illustrationsStore.get(id),
        ),
      )

      if (!illustration) {
        return undefined
      }

      await validateIllustrationRelationships(transaction, illustration)

      const updatedIllustration: CharacterIllustration = {
        ...illustration,
        ...input,
        updatedAt: input.updatedAt,
      }

      await requestToPromise(
        typedRequest<IDBValidKey>(illustrationsStore.put(updatedIllustration)),
      )

      return updatedIllustration
    },
  )
}

async function deleteCharacterIllustration(
  options: IndexedDbRepositoryOptions,
  id: string,
): Promise<boolean> {
  return withIllustrationStore(options, 'readwrite', async (store) => {
    const illustration = await requestToPromise(
      typedRequest<CharacterIllustration | undefined>(store.get(id)),
    )

    if (!illustration) {
      return false
    }

    await requestToPromise(typedRequest<undefined>(store.delete(id)))

    return true
  })
}

async function deleteCharacterIllustrationsByCharacterId(
  options: IndexedDbRepositoryOptions,
  characterId: string,
): Promise<CharacterIllustration[]> {
  return deleteIllustrationsByIndex(
    options,
    CHARACTER_ILLUSTRATION_CHARACTER_ID_INDEX,
    characterId,
  )
}

async function deleteCharacterIllustrationsByStoryId(
  options: IndexedDbRepositoryOptions,
  storyId: string,
): Promise<CharacterIllustration[]> {
  return deleteIllustrationsByIndex(
    options,
    CHARACTER_ILLUSTRATION_STORY_ID_INDEX,
    storyId,
  )
}

async function deleteIllustrationsByIndex(
  options: IndexedDbRepositoryOptions,
  indexName: string,
  value: string,
): Promise<CharacterIllustration[]> {
  return withIllustrationStore(options, 'readwrite', async (store) => {
    const illustrations = await requestToPromise(
      typedRequest<CharacterIllustration[]>(store.index(indexName).getAll(value)),
    )

    for (const illustration of illustrations) {
      await requestToPromise(
        typedRequest<undefined>(store.delete(illustration.id)),
      )
    }

    return illustrations
  })
}

async function withIllustrationStore<T>(
  options: IndexedDbRepositoryOptions,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  return withTransaction(
    options,
    [CHARACTER_ILLUSTRATIONS_STORE],
    mode,
    (transaction) => operation(transaction.objectStore(CHARACTER_ILLUSTRATIONS_STORE)),
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

async function validateIllustrationRelationships(
  transaction: IDBTransaction,
  illustration: CharacterIllustration,
): Promise<void> {
  const story = await requestToPromise(
    typedRequest<Story | undefined>(
      transaction.objectStore(STORIES_STORE).get(illustration.storyId),
    ),
  )

  if (!story) {
    abortTransaction(
      transaction,
      new Error(`Story ${illustration.storyId} does not exist.`),
    )
  }

  const character = await requestToPromise(
    typedRequest<Character | undefined>(
      transaction.objectStore(CHARACTERS_STORE).get(illustration.characterId),
    ),
  )

  if (!character) {
    abortTransaction(
      transaction,
      new Error(`Character ${illustration.characterId} does not exist.`),
    )
  }

  if (character.storyId !== illustration.storyId) {
    abortTransaction(
      transaction,
      new Error(
        `Character ${illustration.characterId} does not belong to Story ${illustration.storyId}.`,
      ),
    )
  }
}

function sortIllustrations(
  illustrations: readonly CharacterIllustration[],
): CharacterIllustration[] {
  return [...illustrations].sort(
    (first, second) =>
      first.order - second.order ||
      first.createdAt - second.createdAt ||
      first.id.localeCompare(second.id),
  )
}
