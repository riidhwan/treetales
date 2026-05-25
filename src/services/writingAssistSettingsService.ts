import { createIndexedDbAppSettingsRepository } from '@/repositories/indexedDb/appSettingsRepository'
import type { AppSettingsRepository } from '@/repositories/types'

export const GEMINI_API_KEY_SETTING_ID = 'writingAssist.geminiApiKey'

export interface WritingAssistSettings {
  readonly hasGeminiApiKey: boolean
}

export async function getWritingAssistSettings(): Promise<WritingAssistSettings> {
  const settingsRepository = getAppSettingsRepository()
  const geminiApiKey = await settingsRepository.findSettingById(
    GEMINI_API_KEY_SETTING_ID,
  )

  return {
    hasGeminiApiKey: Boolean(geminiApiKey?.value),
  }
}

export async function saveGeminiApiKey(apiKey: string): Promise<void> {
  const trimmedApiKey = apiKey.trim()

  if (trimmedApiKey.length === 0) {
    throw new Error('Gemini API key is required.')
  }

  const settingsRepository = getAppSettingsRepository()

  await settingsRepository.putSetting({
    id: GEMINI_API_KEY_SETTING_ID,
    value: trimmedApiKey,
  })
}

export async function clearGeminiApiKey(): Promise<boolean> {
  const settingsRepository = getAppSettingsRepository()

  return settingsRepository.deleteSetting(GEMINI_API_KEY_SETTING_ID)
}

function getAppSettingsRepository(): AppSettingsRepository {
  return createIndexedDbAppSettingsRepository()
}
