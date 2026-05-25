import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getAppSettingsDisplayErrorMessage,
  useAppSettings,
  type AppSettingsServices,
} from '@/hooks/useAppSettings'
import type { WritingAssistSettings } from '@/services/writingAssistSettingsService'

function deferred<TValue>() {
  let resolve!: (value: TValue) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<TValue>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, reject, resolve }
}

function createServices(
  getWritingAssistSettings: () => Promise<WritingAssistSettings>,
): AppSettingsServices {
  return {
    clearGeminiApiKey: vi.fn(() => Promise.resolve(false)),
    getWritingAssistSettings,
    saveGeminiApiKey: vi.fn(() => Promise.resolve()),
  }
}

describe('useAppSettings', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('ignores settings load success after unmount', async () => {
    const pendingSettings = deferred<WritingAssistSettings>()
    const services = createServices(() => pendingSettings.promise)
    const { unmount } = renderHook(() => useAppSettings({ services }))

    unmount()
    pendingSettings.resolve({ hasGeminiApiKey: true })

    await expect(pendingSettings.promise).resolves.toEqual({
      hasGeminiApiKey: true,
    })
  })

  it('ignores settings load failure after unmount', async () => {
    const pendingSettings = deferred<WritingAssistSettings>()
    const services = createServices(() => pendingSettings.promise)
    const { unmount } = renderHook(() => useAppSettings({ services }))
    const loadError = new Error('Load failed.')

    unmount()
    pendingSettings.reject(loadError)

    await expect(pendingSettings.promise).rejects.toBe(loadError)
  })

  it('keeps the entry form when cancelling replacement without a saved key', async () => {
    const services = createServices(() =>
      Promise.resolve({ hasGeminiApiKey: false }),
    )
    const { result } = renderHook(() => useAppSettings({ services }))

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    act(() => {
      result.current.cancelReplacingGeminiApiKey()
    })

    expect(result.current.geminiApiKeyFormMode).toBe('entry')
  })

  it('uses fallback copy for non-Error failures', () => {
    expect(
      getAppSettingsDisplayErrorMessage(
        undefined,
        'Could not load App Settings.',
      ),
    ).toBe('Could not load App Settings.')
  })
})
