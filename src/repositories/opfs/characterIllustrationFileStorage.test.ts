import { afterEach, describe, expect, it, vi } from 'vitest'

import { createOpfsCharacterIllustrationFileStorage } from '@/repositories/opfs/characterIllustrationFileStorage'

describe('opfsCharacterIllustrationFileStorage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('writes, reads, and deletes files in the Character Illustration directory', async () => {
    const blob = new Blob(['image'], { type: 'image/png' })
    const writable = {
      close: vi.fn(() => Promise.resolve()),
      write: vi.fn(() => Promise.resolve()),
    }
    const fileHandle = {
      createWritable: vi.fn(() => Promise.resolve(writable)),
      getFile: vi.fn(() => Promise.resolve(blob)),
    }
    const illustrationDirectory = {
      getFileHandle: vi.fn(() => Promise.resolve(fileHandle)),
      removeEntry: vi.fn(() => Promise.resolve()),
    }
    const rootDirectory = {
      getDirectoryHandle: vi.fn(() => Promise.resolve(illustrationDirectory)),
    }
    stubStorageDirectory(rootDirectory)
    const fileStorage = createOpfsCharacterIllustrationFileStorage()

    await fileStorage.writeFile('file-1', blob)
    await expect(fileStorage.readFile('file-1')).resolves.toBe(blob)
    await fileStorage.deleteFile('file-1')

    expect(rootDirectory.getDirectoryHandle).toHaveBeenCalledWith(
      'character-illustrations',
      { create: true },
    )
    expect(illustrationDirectory.getFileHandle).toHaveBeenCalledWith('file-1', {
      create: true,
    })
    expect(writable.write).toHaveBeenCalledWith(blob)
    expect(writable.close).toHaveBeenCalled()
    expect(illustrationDirectory.removeEntry).toHaveBeenCalledWith('file-1')
  })

  it('closes writable files when writes fail', async () => {
    const writeError = new Error('write failed')
    const writable = {
      close: vi.fn(() => Promise.resolve()),
      write: vi.fn(() => Promise.reject(writeError)),
    }
    const fileHandle = {
      createWritable: vi.fn(() => Promise.resolve(writable)),
    }
    const illustrationDirectory = {
      getFileHandle: vi.fn(() => Promise.resolve(fileHandle)),
    }
    const rootDirectory = {
      getDirectoryHandle: vi.fn(() => Promise.resolve(illustrationDirectory)),
    }
    stubStorageDirectory(rootDirectory)
    const fileStorage = createOpfsCharacterIllustrationFileStorage()

    await expect(
      fileStorage.writeFile('file-1', new Blob(['image'])),
    ).rejects.toThrow('write failed')
    expect(writable.close).toHaveBeenCalled()
  })

  it('treats missing files as absent during reads and deletes', async () => {
    const notFound = new DOMException('missing', 'NotFoundError')
    const illustrationDirectory = {
      getFileHandle: vi.fn(() => Promise.reject(notFound)),
      removeEntry: vi.fn(() => Promise.reject(notFound)),
    }
    const rootDirectory = {
      getDirectoryHandle: vi.fn(() => Promise.resolve(illustrationDirectory)),
    }
    stubStorageDirectory(rootDirectory)
    const fileStorage = createOpfsCharacterIllustrationFileStorage()

    await expect(fileStorage.readFile('missing-file')).resolves.toBeUndefined()
    await expect(fileStorage.deleteFile('missing-file')).resolves.toBeUndefined()
  })

  it('rethrows unexpected read and delete failures', async () => {
    const readError = new Error('read failed')
    const deleteError = new Error('delete failed')
    const illustrationDirectory = {
      getFileHandle: vi.fn(() => Promise.reject(readError)),
      removeEntry: vi.fn(() => Promise.reject(deleteError)),
    }
    const rootDirectory = {
      getDirectoryHandle: vi.fn(() => Promise.resolve(illustrationDirectory)),
    }
    stubStorageDirectory(rootDirectory)
    const fileStorage = createOpfsCharacterIllustrationFileStorage()

    await expect(fileStorage.readFile('file-1')).rejects.toThrow('read failed')
    await expect(fileStorage.deleteFile('file-1')).rejects.toThrow(
      'delete failed',
    )
  })
})

function stubStorageDirectory(rootDirectory: {
  readonly getDirectoryHandle: ReturnType<typeof vi.fn>
}): void {
  vi.stubGlobal('navigator', {
    storage: {
      getDirectory: vi.fn(() => Promise.resolve(rootDirectory)),
    },
  })
}
