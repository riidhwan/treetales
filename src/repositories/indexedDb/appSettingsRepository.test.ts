import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createIndexedDbAppSettingsRepository } from '@/repositories/indexedDb/appSettingsRepository'
import {
  deleteTestDatabase,
  installFakeIndexedDb,
} from '@/test/indexedDb'

describe('createIndexedDbAppSettingsRepository', () => {
  beforeEach(() => {
    installFakeIndexedDb()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await deleteTestDatabase()
  })

  it('writes, reads, replaces, and deletes settings by stable id', async () => {
    const repository = createIndexedDbAppSettingsRepository()

    await expect(
      repository.findSettingById('writingAssist.geminiApiKey'),
    ).resolves.toBeUndefined()

    await repository.putSetting({
      id: 'writingAssist.geminiApiKey',
      value: 'first-key',
    })

    await expect(
      repository.findSettingById('writingAssist.geminiApiKey'),
    ).resolves.toEqual({
      id: 'writingAssist.geminiApiKey',
      value: 'first-key',
    })

    await repository.putSetting({
      id: 'writingAssist.geminiApiKey',
      value: 'second-key',
    })

    await expect(
      repository.findSettingById('writingAssist.geminiApiKey'),
    ).resolves.toEqual({
      id: 'writingAssist.geminiApiKey',
      value: 'second-key',
    })
    await expect(
      repository.deleteSetting('writingAssist.geminiApiKey'),
    ).resolves.toBe(true)
    await expect(
      repository.findSettingById('writingAssist.geminiApiKey'),
    ).resolves.toBeUndefined()
    await expect(
      repository.deleteSetting('writingAssist.geminiApiKey'),
    ).resolves.toBe(false)
  })
})
