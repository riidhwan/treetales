import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { createIndexedDbCharacterIllustrationRepository } from '@/repositories/indexedDb/characterIllustrationRepository'
import { createIndexedDbCharacterRepository } from '@/repositories/indexedDb/characterRepository'
import { createIndexedDbRepositoryUnitOfWork } from '@/repositories/indexedDb/unitOfWork'
import type { CharacterIllustrationFileStorage } from '@/repositories/types'
import {
  createCharacterIllustrationService,
  deleteIllustrationFiles,
  processCharacterIllustrationFile,
  type ProcessedIllustrationFile,
} from '@/services/characterIllustrationService'
import { createCharacter } from '@/services/characterService'
import { createStory, getStoryById } from '@/services/storyService'
import type { CharacterIllustrationImportMode } from '@/services/types'
import { deleteTestDatabase, installFakeIndexedDb } from '@/test/indexedDb'

describe('characterIllustrationService', () => {
  beforeAll(() => {
    installFakeIndexedDb()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    await deleteTestDatabase()
  })

  it('imports, reads, updates, and deletes Character Illustrations', async () => {
    let now = 10
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    const fileStorage = createMemoryFileStorage()
    const service = createTestService({
      fileStorage,
      processFile: () =>
        Promise.resolve(createProcessedFile({ blob: createImageBlob(500) })),
    })
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const character = await createCharacter({
      storyId: story.id,
      name: 'Mira',
      gender: 'female',
      properties: [],
    })

    now = 20
    const illustration = await service.importCharacterIllustration({
      characterId: character.id,
      file: createFile('mira.png', 'image/png', 100),
      label: ' First reference ',
    })

    expect(illustration.id).toEqual(expect.any(String))
    expect(illustration.fileId).toEqual(expect.any(String))
    expect(illustration).toMatchObject({
      storyId: story.id,
      characterId: character.id,
      label: 'First reference',
      order: 0,
      mimeType: 'image/png',
      sizeBytes: 500,
      width: 640,
      height: 480,
      importMode: 'normalized',
      createdAt: 20,
      updatedAt: 20,
    })
    await expect(
      service.getCharacterIllustrationFile(illustration.fileId),
    ).resolves.toEqual(createImageBlob(500))
    await expect(
      service.getCharacterIllustrationsByCharacterId(character.id),
    ).resolves.toEqual([illustration])
    await expect(getStoryById(story.id)).resolves.toMatchObject({
      updatedAt: 20,
    })

    now = 30
    await expect(
      service.updateCharacterIllustration(illustration.id, {
        label: 'Updated',
        order: 4,
      }),
    ).resolves.toMatchObject({
      label: 'Updated',
      order: 4,
      updatedAt: 30,
    })

    now = 40
    await expect(
      service.deleteCharacterIllustration(illustration.id),
    ).resolves.toBe(true)
    await expect(
      service.getCharacterIllustrationFile(illustration.fileId),
    ).resolves.toBeUndefined()
    await expect(
      service.deleteCharacterIllustration(illustration.id),
    ).resolves.toBe(false)
  })

  it('appends new illustrations after the highest existing order', async () => {
    const service = createTestService({
      processFile: () =>
        Promise.resolve(createProcessedFile({ blob: createImageBlob(100) })),
    })
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const character = await createCharacter({
      storyId: story.id,
      name: 'Mira',
      gender: 'female',
      properties: [],
    })

    const first = await service.importCharacterIllustration({
      characterId: character.id,
      file: createFile('first.png', 'image/png', 100),
    })
    await service.updateCharacterIllustration(first.id, { order: 8 })
    const second = await service.importCharacterIllustration({
      characterId: character.id,
      file: createFile('second.png', 'image/png', 100),
    })

    expect(second.order).toBe(9)
  })

  it('cleans up written files when metadata import fails', async () => {
    const fileStorage = createMemoryFileStorage()
    const service = createCharacterIllustrationService({
      characterIllustrations: createIndexedDbCharacterIllustrationRepository(),
      characters: createIndexedDbCharacterRepository(),
      fileStorage,
      processFile: () =>
        Promise.resolve(createProcessedFile({ blob: createImageBlob(100) })),
      repositoryUnitOfWork: {
        run: () => Promise.reject(new Error('metadata failed')),
      },
    })
    const story = await createStory({
      title: 'Story',
      description: 'Description',
    })
    const character = await createCharacter({
      storyId: story.id,
      name: 'Mira',
      gender: 'female',
      properties: [],
    })
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000001')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000002')

    await expect(
      service.importCharacterIllustration({
        characterId: character.id,
        file: createFile('mira.png', 'image/png', 100),
      }),
    ).rejects.toThrow('metadata failed')
    await expect(
      fileStorage.readFile('00000000-0000-4000-8000-000000000002'),
    ).resolves.toBeUndefined()
  })

  it('rejects missing Characters before writing files', async () => {
    const fileStorage = createMemoryFileStorage()
    const service = createTestService({
      fileStorage,
      processFile: () =>
        Promise.resolve(createProcessedFile({ blob: createImageBlob(100) })),
    })

    await expect(
      service.importCharacterIllustration({
        characterId: 'missing-character',
        file: createFile('mira.png', 'image/png', 100),
      }),
    ).rejects.toThrow('does not exist')
    await expect(fileStorage.readFile('file-1')).resolves.toBeUndefined()
  })

  it('returns undefined when updating a missing Character Illustration', async () => {
    const service = createTestService({
      processFile: () =>
        Promise.resolve(createProcessedFile({ blob: createImageBlob(100) })),
    })

    await expect(
      service.updateCharacterIllustration('missing-illustration', {
        label: 'Missing',
      }),
    ).resolves.toBeUndefined()
  })

  it('deletes files through the default Character Illustration cleanup helper', async () => {
    const removeEntry = vi.fn(() => Promise.resolve())
    stubDefaultOpfsDirectory(removeEntry)

    await deleteIllustrationFiles([
      {
        id: 'illustration-1',
        storyId: 'story-1',
        characterId: 'character-1',
        fileId: 'file-1',
        label: '',
        order: 0,
        mimeType: 'image/png',
        sizeBytes: 100,
        width: 100,
        height: 100,
        importMode: 'normalized',
        createdAt: 10,
        updatedAt: 10,
      },
    ])

    expect(removeEntry).toHaveBeenCalledWith('file-1')
  })
})

describe('processCharacterIllustrationFile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('rejects unsupported MIME types', async () => {
    await expect(
      processCharacterIllustrationFile(
        createFile('notes.txt', 'text/plain', 100),
        'normalized',
      ),
    ).rejects.toThrow('JPEG, PNG, and WebP')
  })

  it('rejects original-quality imports above 15 MB before decoding', async () => {
    await expect(
      processCharacterIllustrationFile(
        createFile('large.png', 'image/png', 15 * 1024 * 1024 + 1),
        'original',
      ),
    ).rejects.toThrow('15 MB')
  })

  it('preserves exact bytes for original-quality imports', async () => {
    stubImageBitmap({ width: 300, height: 200 })
    const file = createFile('original.webp', 'image/webp', 256)

    await expect(
      processCharacterIllustrationFile(file, 'original'),
    ).resolves.toEqual({
      blob: file,
      height: 200,
      mimeType: 'image/webp',
      sizeBytes: 256,
      width: 300,
    })
  })

  it('resizes normalized imports and rejects oversized processed files', async () => {
    stubImageBitmap({ width: 4096, height: 1024 })
    stubCanvas(createImageBlob(2 * 1024 * 1024 + 1))

    await expect(
      processCharacterIllustrationFile(
        createFile('large.png', 'image/png', 100),
        'normalized',
      ),
    ).rejects.toThrow('2 MB')
  })

  it('returns normalized image metadata from canvas output', async () => {
    stubImageBitmap({ width: 4096, height: 1024 })
    stubCanvas(createImageBlob(1000, 'image/png'))

    await expect(
      processCharacterIllustrationFile(
        createFile('source.png', 'image/png', 100),
        'normalized',
      ),
    ).resolves.toMatchObject({
      height: 512,
      mimeType: 'image/png',
      sizeBytes: 1000,
      width: 2048,
    })
  })

  it('normalizes imports with an image element when bitmap decoding fails', async () => {
    stubImageBitmapFailure()
    const urlMocks = stubImageElement({ width: 1200, height: 900 })
    stubCanvas(createImageBlob(1000, 'image/png'))

    await expect(
      processCharacterIllustrationFile(
        createFile('source.png', 'image/png', 100),
        'normalized',
      ),
    ).resolves.toMatchObject({
      height: 900,
      mimeType: 'image/png',
      sizeBytes: 1000,
      width: 1200,
    })

    expect(urlMocks.createObjectURL).toHaveBeenCalledOnce()
    expect(urlMocks.revokeObjectURL).toHaveBeenCalledWith('blob:source')
  })

  it('rejects undecodable accepted image files with a service-owned message', async () => {
    stubImageBitmapFailure()
    const urlMocks = stubImageElementFailure()

    await expect(
      processCharacterIllustrationFile(
        createFile('source.png', 'image/png', 100),
        'normalized',
      ),
    ).rejects.toThrow('Character Illustration image could not be decoded.')
    expect(urlMocks.revokeObjectURL).toHaveBeenCalledWith('blob:source')
  })

  it('normalizes imports with image element load events when decode is unavailable', async () => {
    stubImageBitmapFailure()
    stubLoadingImageElement({ width: 900, height: 600 })
    stubCanvas(createImageBlob(1000, 'image/png'))

    await expect(
      processCharacterIllustrationFile(
        createFile('source.png', 'image/png', 100),
        'normalized',
      ),
    ).resolves.toMatchObject({
      height: 600,
      width: 900,
    })
  })

  it('rejects image element load failures when decode is unavailable', async () => {
    stubImageBitmapFailure()
    const urlMocks = stubErroredLoadingImageElement()

    await expect(
      processCharacterIllustrationFile(
        createFile('source.png', 'image/png', 100),
        'normalized',
      ),
    ).rejects.toThrow('Character Illustration image could not be decoded.')
    expect(urlMocks.revokeObjectURL).toHaveBeenCalledWith('blob:source')
  })

  it('rejects decoded images with missing dimensions', async () => {
    stubImageBitmapFailure()
    const urlMocks = stubImageElement({ width: 0, height: 0 })

    await expect(
      processCharacterIllustrationFile(
        createFile('source.png', 'image/png', 100),
        'normalized',
      ),
    ).rejects.toThrow('Character Illustration image could not be decoded.')
    expect(urlMocks.revokeObjectURL).toHaveBeenCalledWith('blob:source')
  })

  it('keeps normalized dimensions when the image is already within limits', async () => {
    stubImageBitmap({ width: 800, height: 600 })
    stubCanvas(createImageBlob(1000, ''))

    await expect(
      processCharacterIllustrationFile(
        createFile('source.jpg', 'image/jpeg', 100),
        'normalized',
      ),
    ).resolves.toMatchObject({
      height: 600,
      mimeType: 'image/jpeg',
      sizeBytes: 1000,
      width: 800,
    })
  })

  it('rejects normalized imports when canvas rendering is unavailable', async () => {
    stubImageBitmap({ width: 800, height: 600 })
    stubCanvasContext(null)

    await expect(
      processCharacterIllustrationFile(
        createFile('source.png', 'image/png', 100),
        'normalized',
      ),
    ).rejects.toThrow('normalization is unavailable')
  })

  it('rejects normalized imports when canvas output fails', async () => {
    stubImageBitmap({ width: 800, height: 600 })
    stubCanvas(null)

    await expect(
      processCharacterIllustrationFile(
        createFile('source.png', 'image/png', 100),
        'normalized',
      ),
    ).rejects.toThrow('normalization failed')
  })
})

function createTestService({
  fileStorage = createMemoryFileStorage(),
  processFile,
}: {
  readonly fileStorage?: CharacterIllustrationFileStorage
  readonly processFile: (
    file: File,
    importMode: CharacterIllustrationImportMode,
  ) => Promise<ProcessedIllustrationFile>
}) {
  return createCharacterIllustrationService({
    characterIllustrations: createIndexedDbCharacterIllustrationRepository(),
    characters: createIndexedDbCharacterRepository(),
    fileStorage,
    processFile,
    repositoryUnitOfWork: createIndexedDbRepositoryUnitOfWork(),
  })
}

function createMemoryFileStorage(): CharacterIllustrationFileStorage {
  const files = new Map<string, Blob>()

  return {
    writeFile: (fileId, blob) => {
      files.set(fileId, blob)
      return Promise.resolve()
    },
    readFile: (fileId) => Promise.resolve(files.get(fileId)),
    deleteFile: (fileId) => {
      files.delete(fileId)
      return Promise.resolve()
    },
  }
}

function createProcessedFile({
  blob,
  height = 480,
  mimeType = blob.type || 'image/png',
  width = 640,
}: Partial<ProcessedIllustrationFile> &
  Pick<ProcessedIllustrationFile, 'blob'>): ProcessedIllustrationFile {
  return {
    blob,
    height,
    mimeType,
    sizeBytes: blob.size,
    width,
  }
}

function createFile(name: string, mimeType: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type: mimeType })
}

function createImageBlob(size: number, mimeType = 'image/png'): Blob {
  return new Blob([new Uint8Array(size)], { type: mimeType })
}

function stubImageBitmap({
  width,
  height,
}: {
  readonly width: number
  readonly height: number
}): void {
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(() =>
      Promise.resolve({
      width,
      height,
      close: vi.fn(),
    }),
    ),
  )
}

function stubImageBitmapFailure(): void {
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(() =>
      Promise.reject(new DOMException('The source image could not be decoded.')),
    ),
  )
}

function stubImageElement({
  width,
  height,
}: {
  readonly width: number
  readonly height: number
}): {
  readonly createObjectURL: ReturnType<typeof vi.fn>
  readonly revokeObjectURL: ReturnType<typeof vi.fn>
} {
  const createObjectURL = vi.fn(() => 'blob:source')
  const revokeObjectURL = vi.fn()

  vi.stubGlobal('URL', {
    createObjectURL,
    revokeObjectURL,
  })
  vi.stubGlobal(
    'Image',
    class StubImage {
      height = height
      width = width
      src = ''

      decode() {
        return Promise.resolve()
      }
    },
  )

  return { createObjectURL, revokeObjectURL }
}

function stubLoadingImageElement({
  width,
  height,
}: {
  readonly width: number
  readonly height: number
}): {
  readonly createObjectURL: ReturnType<typeof vi.fn>
  readonly revokeObjectURL: ReturnType<typeof vi.fn>
} {
  const createObjectURL = vi.fn(() => 'blob:source')
  const revokeObjectURL = vi.fn()

  vi.stubGlobal('URL', {
    createObjectURL,
    revokeObjectURL,
  })
  vi.stubGlobal(
    'Image',
    class StubImage {
      height = height
      onerror: (() => void) | null = null
      onload: (() => void) | null = null
      width = width

      set src(_src: string) {
        this.onload?.()
      }
    },
  )

  return { createObjectURL, revokeObjectURL }
}

function stubErroredLoadingImageElement(): {
  readonly createObjectURL: ReturnType<typeof vi.fn>
  readonly revokeObjectURL: ReturnType<typeof vi.fn>
} {
  const createObjectURL = vi.fn(() => 'blob:source')
  const revokeObjectURL = vi.fn()

  vi.stubGlobal('URL', {
    createObjectURL,
    revokeObjectURL,
  })
  vi.stubGlobal(
    'Image',
    class StubImage {
      height = 0
      onerror: (() => void) | null = null
      onload: (() => void) | null = null
      width = 0

      set src(_src: string) {
        this.onerror?.()
      }
    },
  )

  return { createObjectURL, revokeObjectURL }
}

function stubImageElementFailure(): {
  readonly createObjectURL: ReturnType<typeof vi.fn>
  readonly revokeObjectURL: ReturnType<typeof vi.fn>
} {
  const createObjectURL = vi.fn(() => 'blob:source')
  const revokeObjectURL = vi.fn()

  vi.stubGlobal('URL', {
    createObjectURL,
    revokeObjectURL,
  })
  vi.stubGlobal(
    'Image',
    class StubImage {
      height = 0
      width = 0
      src = ''

      decode() {
        return Promise.reject(new Error('Image decode failed.'))
      }
    },
  )

  return { createObjectURL, revokeObjectURL }
}

function stubCanvas(blob: Blob | null): void {
  const context = {
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D
  stubCanvasContext(context, blob)
}

function stubCanvasContext(
  context: CanvasRenderingContext2D | null,
  blob: Blob | null = createImageBlob(100),
): void {
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toBlob: vi.fn((callback: BlobCallback) => callback(blob)),
  } as unknown as HTMLCanvasElement

  vi.spyOn(document, 'createElement').mockReturnValue(canvas)
}

function stubDefaultOpfsDirectory(
  removeEntry: (fileId: string) => Promise<void>,
): void {
  const illustrationDirectory = {
    removeEntry,
  }
  const rootDirectory = {
    getDirectoryHandle: vi.fn(() => Promise.resolve(illustrationDirectory)),
  }

  vi.stubGlobal('navigator', {
    storage: {
      getDirectory: vi.fn(() => Promise.resolve(rootDirectory)),
    },
  })
}
