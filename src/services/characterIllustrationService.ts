import {
  CHARACTER_ILLUSTRATION_ACCEPTED_MIME_TYPES,
  CHARACTER_ILLUSTRATION_NORMALIZED_LONGEST_EDGE_PX,
  CHARACTER_ILLUSTRATION_NORMALIZED_MAX_BYTES,
  CHARACTER_ILLUSTRATION_NORMALIZED_QUALITY,
  CHARACTER_ILLUSTRATION_ORIGINAL_MAX_BYTES,
} from '@/config'
import { createIndexedDbCharacterIllustrationRepository } from '@/repositories/indexedDb/characterIllustrationRepository'
import { createIndexedDbCharacterRepository } from '@/repositories/indexedDb/characterRepository'
import { createIndexedDbRepositoryUnitOfWork } from '@/repositories/indexedDb/unitOfWork'
import { createOpfsCharacterIllustrationFileStorage } from '@/repositories/opfs/characterIllustrationFileStorage'
import type {
  CharacterIllustrationFileStorage,
  CharacterIllustrationRepository,
  CharacterRepository,
  RepositoryUnitOfWork,
  UpdateCharacterIllustrationRepositoryInput,
} from '@/repositories/types'
import type {
  CharacterIllustration,
  CharacterIllustrationImportMode,
  ImportCharacterIllustrationInput,
  UpdateCharacterIllustrationInput,
} from '@/services/types'

export interface ProcessedIllustrationFile {
  readonly blob: Blob
  readonly height: number
  readonly mimeType: string
  readonly sizeBytes: number
  readonly width: number
}

export interface CharacterIllustrationServiceDependencies {
  readonly characterIllustrations: CharacterIllustrationRepository
  readonly characters: CharacterRepository
  readonly fileStorage: CharacterIllustrationFileStorage
  readonly processFile: (
    file: File,
    importMode: CharacterIllustrationImportMode,
  ) => Promise<ProcessedIllustrationFile>
  readonly repositoryUnitOfWork: RepositoryUnitOfWork
}

interface DecodedIllustrationImage {
  readonly height: number
  readonly source: CanvasImageSource
  readonly width: number
  close: () => void
}

const repositoryUnitOfWork = createIndexedDbRepositoryUnitOfWork()
const fileStorage = createOpfsCharacterIllustrationFileStorage()

const defaultService = createCharacterIllustrationService({
  characterIllustrations: createIndexedDbCharacterIllustrationRepository(),
  characters: createIndexedDbCharacterRepository(),
  fileStorage,
  processFile: processCharacterIllustrationFile,
  repositoryUnitOfWork,
})

export function createCharacterIllustrationService(
  dependencies: CharacterIllustrationServiceDependencies,
) {
  return {
    importCharacterIllustration: (input: ImportCharacterIllustrationInput) =>
      importCharacterIllustrationWithDependencies(dependencies, input),
    getCharacterIllustrationsByCharacterId: (characterId: string) =>
      dependencies.characterIllustrations.findCharacterIllustrationsByCharacterId(
        characterId,
      ),
    getCharacterIllustrationFile: (fileId: string) =>
      dependencies.fileStorage.readFile(fileId),
    updateCharacterIllustration: (
      id: string,
      input: UpdateCharacterIllustrationInput,
    ) => updateCharacterIllustrationWithDependencies(dependencies, id, input),
    deleteCharacterIllustration: (id: string) =>
      deleteCharacterIllustrationWithDependencies(dependencies, id),
  }
}

export const importCharacterIllustration =
  defaultService.importCharacterIllustration
export const getCharacterIllustrationsByCharacterId =
  defaultService.getCharacterIllustrationsByCharacterId
export const getCharacterIllustrationFile =
  defaultService.getCharacterIllustrationFile
export const updateCharacterIllustration =
  defaultService.updateCharacterIllustration
export const deleteCharacterIllustration =
  defaultService.deleteCharacterIllustration

async function importCharacterIllustrationWithDependencies(
  dependencies: CharacterIllustrationServiceDependencies,
  input: ImportCharacterIllustrationInput,
): Promise<CharacterIllustration> {
  const importMode = input.importMode ?? 'normalized'
  const processedFile = await dependencies.processFile(input.file, importMode)
  const character = await dependencies.characters.findCharacterById(
    input.characterId,
  )

  if (!character) {
    throw new Error(`Character ${input.characterId} does not exist.`)
  }

  const existingIllustrations =
    await dependencies.characterIllustrations.findCharacterIllustrationsByCharacterId(
      input.characterId,
  )
  const now = Date.now()
  const illustrationId = crypto.randomUUID()
  const fileId = crypto.randomUUID()
  const illustration: CharacterIllustration = {
    id: illustrationId,
    storyId: character.storyId,
    characterId: character.id,
    fileId,
    label: input.label?.trim() ?? '',
    order: nextIllustrationOrder(existingIllustrations),
    mimeType: processedFile.mimeType,
    sizeBytes: processedFile.sizeBytes,
    width: processedFile.width,
    height: processedFile.height,
    importMode,
    createdAt: now,
    updatedAt: now,
  }

  await dependencies.fileStorage.writeFile(fileId, processedFile.blob)

  try {
    await dependencies.repositoryUnitOfWork.run(
      async ({ characterIllustrations, stories }) => {
        await characterIllustrations.insertCharacterIllustration(illustration)
        await stories.updateStory(character.storyId, { updatedAt: now })
      },
    )
  } catch (error) {
    await dependencies.fileStorage.deleteFile(fileId)
    throw error
  }

  return illustration
}

async function updateCharacterIllustrationWithDependencies(
  dependencies: CharacterIllustrationServiceDependencies,
  id: string,
  input: UpdateCharacterIllustrationInput,
): Promise<CharacterIllustration | undefined> {
  const now = Date.now()

  return dependencies.repositoryUnitOfWork.run(
    async ({ characterIllustrations, stories }) => {
      const updatedIllustration =
        await characterIllustrations.updateCharacterIllustration(
          id,
          createUpdateCharacterIllustrationRepositoryInput(input, now),
        )

      if (!updatedIllustration) {
        return undefined
      }

      await stories.updateStory(updatedIllustration.storyId, { updatedAt: now })

      return updatedIllustration
    },
  )
}

async function deleteCharacterIllustrationWithDependencies(
  dependencies: CharacterIllustrationServiceDependencies,
  id: string,
): Promise<boolean> {
  const now = Date.now()
  const illustration =
    await dependencies.characterIllustrations.findCharacterIllustrationById(id)

  if (!illustration) {
    return false
  }

  await dependencies.repositoryUnitOfWork.run(
    async ({ characterIllustrations, stories }) => {
      await characterIllustrations.deleteCharacterIllustration(id)
      await stories.updateStory(illustration.storyId, { updatedAt: now })
    },
  )
  await dependencies.fileStorage.deleteFile(illustration.fileId)

  return true
}

export async function deleteIllustrationFiles(
  illustrations: readonly CharacterIllustration[],
): Promise<void> {
  await Promise.all(
    illustrations.map((illustration) => fileStorage.deleteFile(illustration.fileId)),
  )
}

export async function processCharacterIllustrationFile(
  file: File,
  importMode: CharacterIllustrationImportMode,
): Promise<ProcessedIllustrationFile> {
  assertAcceptedMimeType(file.type)

  if (importMode === 'original') {
    return processOriginalFile(file)
  }

  return processNormalizedFile(file)
}

async function processOriginalFile(file: File): Promise<ProcessedIllustrationFile> {
  if (file.size > CHARACTER_ILLUSTRATION_ORIGINAL_MAX_BYTES) {
    throw new Error('Original-quality Character Illustration files must be 15 MB or smaller.')
  }

  const dimensions = await readImageDimensions(file)

  return {
    blob: file,
    height: dimensions.height,
    mimeType: file.type,
    sizeBytes: file.size,
    width: dimensions.width,
  }
}

async function processNormalizedFile(
  file: File,
): Promise<ProcessedIllustrationFile> {
  const image = await decodeIllustrationImage(file)

  try {
    const { width, height } = getNormalizedDimensions(image.width, image.height)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Character Illustration normalization is unavailable.')
    }

    context.drawImage(image.source, 0, 0, width, height)

    const blob = await canvasToBlob(
      canvas,
      file.type,
      CHARACTER_ILLUSTRATION_NORMALIZED_QUALITY,
    )

    if (blob.size > CHARACTER_ILLUSTRATION_NORMALIZED_MAX_BYTES) {
      throw new Error(
        'Normalized Character Illustration files must be 2 MB or smaller after processing.',
      )
    }

    return {
      blob,
      height,
      mimeType: blob.type || file.type,
      sizeBytes: blob.size,
      width,
    }
  } finally {
    image.close()
  }
}

async function readImageDimensions(
  file: File,
): Promise<Pick<ProcessedIllustrationFile, 'height' | 'width'>> {
  const image = await decodeIllustrationImage(file)

  try {
    return {
      height: image.height,
      width: image.width,
    }
  } finally {
    image.close()
  }
}

async function decodeIllustrationImage(file: File): Promise<DecodedIllustrationImage> {
  try {
    const bitmap = await createImageBitmap(file)

    return {
      height: bitmap.height,
      source: bitmap,
      width: bitmap.width,
      close: () => {
        bitmap.close()
      },
    }
  } catch {
    return decodeIllustrationImageElement(file)
  }
}

async function decodeIllustrationImageElement(
  file: File,
): Promise<DecodedIllustrationImage> {
  const objectUrl = URL.createObjectURL(file)
  const image = new Image()

  try {
    await decodeImageElementFromObjectUrl(image, objectUrl)

    const width = image.naturalWidth || image.width
    const height = image.naturalHeight || image.height

    if (width <= 0 || height <= 0) {
      throw new Error('Character Illustration image could not be decoded.')
    }

    return {
      height,
      source: image,
      width,
      close: () => {
        URL.revokeObjectURL(objectUrl)
      },
    }
  } catch {
    URL.revokeObjectURL(objectUrl)
    throw new Error('Character Illustration image could not be decoded.')
  }
}

function decodeImageElementFromObjectUrl(
  image: HTMLImageElement,
  objectUrl: string,
): Promise<void> {
  if (typeof image.decode === 'function') {
    image.src = objectUrl
    return image.decode()
  }

  return new Promise((resolve, reject) => {
    image.onload = () => {
      resolve()
    }
    image.onerror = () => {
      reject(new Error('Character Illustration image could not be decoded.'))
    }
    image.src = objectUrl
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Character Illustration normalization failed.'))
          return
        }

        resolve(blob)
      },
      mimeType,
      quality,
    )
  })
}

function getNormalizedDimensions(
  width: number,
  height: number,
): Pick<ProcessedIllustrationFile, 'height' | 'width'> {
  const longestEdge = Math.max(width, height)

  if (longestEdge <= CHARACTER_ILLUSTRATION_NORMALIZED_LONGEST_EDGE_PX) {
    return { width, height }
  }

  const scale = CHARACTER_ILLUSTRATION_NORMALIZED_LONGEST_EDGE_PX / longestEdge

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

function assertAcceptedMimeType(mimeType: string): void {
  if (!isAcceptedMimeType(mimeType)) {
    throw new Error('Character Illustration import accepts JPEG, PNG, and WebP images.')
  }
}

function isAcceptedMimeType(
  mimeType: string,
): mimeType is (typeof CHARACTER_ILLUSTRATION_ACCEPTED_MIME_TYPES)[number] {
  return CHARACTER_ILLUSTRATION_ACCEPTED_MIME_TYPES.some(
    (acceptedMimeType) => acceptedMimeType === mimeType,
  )
}

function createUpdateCharacterIllustrationRepositoryInput(
  input: UpdateCharacterIllustrationInput,
  updatedAt: number,
): UpdateCharacterIllustrationRepositoryInput {
  const repositoryInput: UpdateCharacterIllustrationRepositoryInput = { updatedAt }

  if (input.label !== undefined) {
    repositoryInput.label = input.label.trim()
  }

  if (input.order !== undefined) {
    repositoryInput.order = input.order
  }

  return repositoryInput
}

function nextIllustrationOrder(
  illustrations: readonly CharacterIllustration[],
): number {
  if (illustrations.length === 0) {
    return 0
  }

  return Math.max(...illustrations.map((illustration) => illustration.order)) + 1
}
