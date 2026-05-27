import type { CharacterIllustrationFileStorage } from '@/repositories/types'

const DIRECTORY_NAME = 'character-illustrations'

export function createOpfsCharacterIllustrationFileStorage(): CharacterIllustrationFileStorage {
  return {
    writeFile,
    readFile,
    deleteFile,
  }
}

async function writeFile(fileId: string, blob: Blob): Promise<void> {
  const directory = await getIllustrationDirectory()
  const handle = await directory.getFileHandle(fileId, { create: true })
  const writable = await handle.createWritable()

  try {
    await writable.write(blob)
  } finally {
    await writable.close()
  }
}

async function readFile(fileId: string): Promise<Blob | undefined> {
  const directory = await getIllustrationDirectory()

  try {
    const handle = await directory.getFileHandle(fileId)
    return handle.getFile()
  } catch (error) {
    if (isNotFoundError(error)) {
      return undefined
    }

    throw error
  }
}

async function deleteFile(fileId: string): Promise<void> {
  const directory = await getIllustrationDirectory()

  try {
    await directory.removeEntry(fileId)
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error
    }
  }
}

async function getIllustrationDirectory(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory()

  return root.getDirectoryHandle(DIRECTORY_NAME, { create: true })
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'NotFoundError'
}
