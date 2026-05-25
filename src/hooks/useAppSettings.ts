import { useEffect, useState } from 'react'

import { appSettingsCopy } from '@/copy'
import {
  clearGeminiApiKey,
  getWritingAssistSettings,
  saveGeminiApiKey,
  type WritingAssistSettings,
} from '@/services/writingAssistSettingsService'

type AppSettingsStatus = 'error' | 'loading' | 'ready'
type GeminiApiKeyFormMode = 'entry' | 'saved' | 'replace'

export interface AppSettingsServices {
  readonly clearGeminiApiKey: () => Promise<boolean>
  readonly getWritingAssistSettings: () => Promise<WritingAssistSettings>
  readonly saveGeminiApiKey: (apiKey: string) => Promise<void>
}

export interface AppSettingsControls {
  readonly canClearGeminiApiKey: boolean
  readonly canSaveGeminiApiKey: boolean
  readonly errorMessage: string
  readonly geminiApiKeyDraft: string
  readonly geminiApiKeyError: string
  readonly geminiApiKeyFormMode: GeminiApiKeyFormMode
  readonly hasGeminiApiKey: boolean
  readonly status: AppSettingsStatus
  readonly statusMessage: string
  readonly cancelReplacingGeminiApiKey: () => void
  readonly clearSavedGeminiApiKey: () => Promise<void>
  readonly saveGeminiApiKeyDraft: () => Promise<void>
  readonly setGeminiApiKeyDraft: (apiKey: string) => void
  readonly startReplacingGeminiApiKey: () => void
}

export const DEFAULT_APP_SETTINGS_SERVICES: AppSettingsServices = {
  clearGeminiApiKey,
  getWritingAssistSettings,
  saveGeminiApiKey,
}

interface UseAppSettingsInput {
  readonly services?: AppSettingsServices
}

export function useAppSettings({
  services = DEFAULT_APP_SETTINGS_SERVICES,
}: UseAppSettingsInput = {}): AppSettingsControls {
  const [status, setStatus] = useState<AppSettingsStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [hasGeminiApiKey, setHasGeminiApiKey] = useState(false)
  const [geminiApiKeyDraft, setGeminiApiKeyDraft] = useState('')
  const [geminiApiKeyError, setGeminiApiKeyError] = useState('')
  const [geminiApiKeyFormMode, setGeminiApiKeyFormMode] =
    useState<GeminiApiKeyFormMode>('entry')
  const [statusMessage, setStatusMessage] = useState('')

  const canSaveGeminiApiKey =
    status === 'ready' &&
    geminiApiKeyFormMode !== 'saved' &&
    geminiApiKeyDraft.trim().length > 0
  const canClearGeminiApiKey = status === 'ready' && hasGeminiApiKey

  useEffect(() => {
    let isMounted = true

    async function loadSettings() {
      try {
        const writingAssistSettings =
          await services.getWritingAssistSettings()

        if (!isMounted) {
          return
        }

        setHasGeminiApiKey(writingAssistSettings.hasGeminiApiKey)
        setGeminiApiKeyFormMode(
          writingAssistSettings.hasGeminiApiKey ? 'saved' : 'entry',
        )
        setStatus('ready')
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          getAppSettingsDisplayErrorMessage(error, appSettingsCopy.errors.loadFailure),
        )
        setStatus('error')
      }
    }

    void loadSettings()

    return () => {
      isMounted = false
    }
  }, [services])

  function updateGeminiApiKeyDraft(apiKey: string) {
    setGeminiApiKeyDraft(apiKey)
    setGeminiApiKeyError('')
    setStatusMessage('')
  }

  function startReplacingGeminiApiKey() {
    setGeminiApiKeyDraft('')
    setGeminiApiKeyError('')
    setStatusMessage('')
    setGeminiApiKeyFormMode('replace')
  }

  function cancelReplacingGeminiApiKey() {
    setGeminiApiKeyDraft('')
    setGeminiApiKeyError('')
    setStatusMessage('')
    setGeminiApiKeyFormMode(hasGeminiApiKey ? 'saved' : 'entry')
  }

  async function saveGeminiApiKeyDraft() {
    const trimmedApiKey = geminiApiKeyDraft.trim()

    if (trimmedApiKey.length === 0) {
      setGeminiApiKeyError(appSettingsCopy.errors.geminiApiKeyRequired)
      return
    }

    try {
      await services.saveGeminiApiKey(trimmedApiKey)
      setHasGeminiApiKey(true)
      setGeminiApiKeyDraft('')
      setGeminiApiKeyError('')
      setGeminiApiKeyFormMode('saved')
      setStatusMessage(appSettingsCopy.status.saved)
    } catch (error) {
      setGeminiApiKeyError(
        getAppSettingsDisplayErrorMessage(error, appSettingsCopy.errors.saveFailure),
      )
    }
  }

  async function clearSavedGeminiApiKey() {
    try {
      await services.clearGeminiApiKey()
      setHasGeminiApiKey(false)
      setGeminiApiKeyDraft('')
      setGeminiApiKeyError('')
      setGeminiApiKeyFormMode('entry')
      setStatusMessage(appSettingsCopy.status.cleared)
    } catch (error) {
      setGeminiApiKeyError(
        getAppSettingsDisplayErrorMessage(error, appSettingsCopy.errors.clearFailure),
      )
    }
  }

  return {
    canClearGeminiApiKey,
    canSaveGeminiApiKey,
    cancelReplacingGeminiApiKey,
    clearSavedGeminiApiKey,
    errorMessage,
    geminiApiKeyDraft,
    geminiApiKeyError,
    geminiApiKeyFormMode,
    hasGeminiApiKey,
    saveGeminiApiKeyDraft,
    setGeminiApiKeyDraft: updateGeminiApiKeyDraft,
    startReplacingGeminiApiKey,
    status,
    statusMessage,
  }
}

export function getAppSettingsDisplayErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  return error instanceof Error ? error.message : fallbackMessage
}
