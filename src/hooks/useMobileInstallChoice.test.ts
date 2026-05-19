import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  MOBILE_INSTALL_CHOICE_DISMISSED_KEY,
  useMobileInstallChoice,
} from '@/hooks/useMobileInstallChoice'

interface MatchMediaOptions {
  readonly isMobile: boolean
  readonly isStandalone?: boolean
}

interface BeforeInstallPromptChoice {
  readonly outcome: 'accepted' | 'dismissed'
  readonly platform: string
}

interface TestBeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<BeforeInstallPromptChoice>
  prompt: () => Promise<void>
}

function installMatchMedia({
  isMobile,
  isStandalone = false,
}: MatchMediaOptions) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query.includes('display-mode') ? isStandalone : isMobile,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  })
}

function installUserAgent(userAgent: string) {
  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    value: userAgent,
  })
}

function installStandaloneFlag(isStandalone: boolean) {
  Object.defineProperty(window.navigator, 'standalone', {
    configurable: true,
    value: isStandalone,
  })
}

function createBeforeInstallPromptEvent({
  outcome = 'accepted',
  prompt = vi.fn(() => Promise.resolve()),
}: {
  readonly outcome?: BeforeInstallPromptChoice['outcome']
  readonly prompt?: () => Promise<void>
} = {}) {
  const event = new Event('beforeinstallprompt', {
    cancelable: true,
  }) as TestBeforeInstallPromptEvent

  Object.defineProperties(event, {
    prompt: {
      value: prompt,
    },
    userChoice: {
      value: Promise.resolve({
        outcome,
        platform: 'web',
      }),
    },
  })

  return event
}

describe('useMobileInstallChoice', () => {
  beforeEach(() => {
    window.localStorage.clear()
    installMatchMedia({ isMobile: true })
    installStandaloneFlag(false)
    installUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    )
  })

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('uses guidance when media query APIs are unavailable but the user agent is mobile', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: undefined,
    })

    const { result } = renderHook(() => useMobileInstallChoice())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
    expect(result.current.shouldShowInstallChoice).toBe(true)
    expect(result.current.installStatus).toBe('guidance')
  })

  it('skips the install choice when iOS reports standalone app mode', async () => {
    installStandaloneFlag(true)

    const { result } = renderHook(() => useMobileInstallChoice())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
    expect(result.current.shouldShowInstallChoice).toBe(false)
  })

  it('marks the choice accepted when the appinstalled event fires', async () => {
    installUserAgent(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/125.0.0.0 Mobile Safari/537.36',
    )
    const { result } = renderHook(() => useMobileInstallChoice())

    await waitFor(() => {
      expect(result.current.installStatus).toBe('pending')
    })

    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })

    await waitFor(() => {
      expect(result.current.shouldShowInstallChoice).toBe(false)
    })
    expect(result.current.installStatus).toBe('accepted')
    expect(window.localStorage.getItem(MOBILE_INSTALL_CHOICE_DISMISSED_KEY)).toBe(
      'true',
    )
  })

  it('shows an error when the native install prompt fails', async () => {
    installUserAgent(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/125.0.0.0 Mobile Safari/537.36',
    )
    const { result } = renderHook(() => useMobileInstallChoice())
    const prompt = vi.fn(() => Promise.reject(new Error('prompt failed')))
    const promptEvent = createBeforeInstallPromptEvent({ prompt })

    await waitFor(() => {
      expect(result.current.installStatus).toBe('pending')
    })

    act(() => {
      window.dispatchEvent(promptEvent)
    })

    await waitFor(() => {
      expect(result.current.canInstallNatively).toBe(true)
    })

    await act(async () => {
      await result.current.installApp()
    })

    expect(prompt).toHaveBeenCalled()
    expect(result.current.installStatus).toBe('error')
    expect(result.current.shouldShowInstallChoice).toBe(true)
  })

  it('keeps Android native install pending until the browser prompt is ready', async () => {
    installUserAgent(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/125.0.0.0 Mobile Safari/537.36',
    )
    const { result } = renderHook(() => useMobileInstallChoice())

    await waitFor(() => {
      expect(result.current.installStatus).toBe('pending')
    })

    await act(async () => {
      await result.current.installApp()
    })

    expect(result.current.installStatus).toBe('pending')
    expect(result.current.shouldShowInstallChoice).toBe(true)
  })

  it('shows the install choice for mobile viewport and coarse pointer without a mobile user agent', async () => {
    installUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36',
    )
    installMatchMedia({ isMobile: true })

    const { result } = renderHook(() => useMobileInstallChoice())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
    expect(result.current.shouldShowInstallChoice).toBe(true)
  })

  it('continues to mobile site even when dismissed preference storage fails', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage full')
    })
    const { result } = renderHook(() => useMobileInstallChoice())

    await waitFor(() => {
      expect(result.current.shouldShowInstallChoice).toBe(true)
    })

    act(() => {
      result.current.continueToMobileSite()
    })

    expect(result.current.shouldShowInstallChoice).toBe(false)
  })

  it('shows the install choice when dismissed preference storage cannot be read', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })

    const { result } = renderHook(() => useMobileInstallChoice())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
    expect(result.current.shouldShowInstallChoice).toBe(true)
  })
})
