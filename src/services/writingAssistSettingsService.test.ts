import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createIndexedDbAppSettingsRepository } from '@/repositories/indexedDb/appSettingsRepository'
import {
  GEMINI_API_KEY_SETTING_ID,
  clearGeminiApiKey,
  getWritingAssistSettings,
  saveGeminiApiKey,
} from '@/services/writingAssistSettingsService'
import {
  deleteTestDatabase,
  installFakeIndexedDb,
} from '@/test/indexedDb'

describe('writingAssistSettingsService', () => {
  beforeEach(() => {
    installFakeIndexedDb()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await deleteTestDatabase()
  })

  it('reports whether a Gemini API key is saved', async () => {
    await expect(getWritingAssistSettings()).resolves.toEqual({
      hasGeminiApiKey: false,
    })

    await saveGeminiApiKey(' test-key ')

    await expect(getWritingAssistSettings()).resolves.toEqual({
      hasGeminiApiKey: true,
    })
  })

  it('trims and stores the Gemini API key under the stable setting id', async () => {
    const repository = createIndexedDbAppSettingsRepository()

    await saveGeminiApiKey(' test-key ')

    await expect(
      repository.findSettingById(GEMINI_API_KEY_SETTING_ID),
    ).resolves.toEqual({
      id: GEMINI_API_KEY_SETTING_ID,
      value: 'test-key',
    })
  })

  it('rejects blank Gemini API keys', async () => {
    await expect(saveGeminiApiKey('   ')).rejects.toThrow(
      'Gemini API key is required.',
    )
  })

  it('clears the Gemini API key setting', async () => {
    await saveGeminiApiKey('test-key')

    await expect(clearGeminiApiKey()).resolves.toBe(true)
    await expect(clearGeminiApiKey()).resolves.toBe(false)
    await expect(getWritingAssistSettings()).resolves.toEqual({
      hasGeminiApiKey: false,
    })
  })
})
