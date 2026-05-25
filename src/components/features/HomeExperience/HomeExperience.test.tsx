import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HomeExperience } from '@/components/features/HomeExperience'
import {
  MOBILE_INSTALL_CHOICE_DISMISSED_KEY,
} from '@/hooks/useMobileInstallChoice'
import type { StoryDashboardServices } from '@/hooks/useStoryDashboard'

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

function createServices(): StoryDashboardServices {
  return {
    createOrReuseExampleStoryCopy: vi.fn(),
    createStory: vi.fn(),
    getStories: vi.fn(() => Promise.resolve([])),
    listBuiltInExampleStories: vi.fn(() => []),
  }
}

function renderHomeExperience() {
  return render(
    <HomeExperience
      onOpenAppSettings={vi.fn()}
      onEditStory={vi.fn()}
      onOpenStory={vi.fn()}
      onReadStory={vi.fn()}
      services={createServices()}
    />,
  )
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

function createBeforeInstallPromptEvent(
  outcome: BeforeInstallPromptChoice['outcome'],
) {
  const event = new Event('beforeinstallprompt', {
    cancelable: true,
  }) as TestBeforeInstallPromptEvent

  Object.defineProperties(event, {
    prompt: {
      value: vi.fn(() => Promise.resolve()),
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

describe('HomeExperience', () => {
  beforeEach(() => {
    window.localStorage.clear()
    installMatchMedia({ isMobile: true })
    installUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    )
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows the mobile install choice on a first mobile browser visit', async () => {
    renderHomeExperience()

    expect(
      await screen.findByText(/add treetales to your home screen/i),
    ).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Install TreeTales' })).toBe(
      null,
    )
    expect(
      screen.getByRole('button', { name: /install app/i }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /continue to mobile site/i }),
    ).toBeTruthy()
  })

  it('stores the continue choice and opens the dashboard', async () => {
    renderHomeExperience()

    fireEvent.click(
      await screen.findByRole('button', {
        name: /continue to mobile site/i,
      }),
    )

    expect(
      window.localStorage.getItem(MOBILE_INSTALL_CHOICE_DISMISSED_KEY),
    ).toBe('true')
    expect(
      await screen.findByRole('heading', { name: 'Your stories' }),
    ).toBeTruthy()
  })

  it('skips the install choice after continue was chosen before', async () => {
    window.localStorage.setItem(MOBILE_INSTALL_CHOICE_DISMISSED_KEY, 'true')

    renderHomeExperience()

    expect(
      await screen.findByRole('heading', { name: 'Your stories' }),
    ).toBeTruthy()
    expect(screen.queryByText(/add treetales to your home screen/i)).toBe(null)
  })

  it('skips the install choice in standalone app mode', async () => {
    installMatchMedia({ isMobile: true, isStandalone: true })

    renderHomeExperience()

    expect(
      await screen.findByRole('heading', { name: 'Your stories' }),
    ).toBeTruthy()
  })

  it.each([
    [
      'Chrome',
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/125.0.0.0 Mobile Safari/537.36',
    ],
    [
      'Edge',
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/125.0.0.0 Mobile Safari/537.36 EdgA/125.0.0.0',
    ],
  ])(
    'does not show manual guidance for Android %s before native prompt readiness',
    async (_browserName, userAgent) => {
      installUserAgent(userAgent)

      renderHomeExperience()

      const installButton = await screen.findByRole('button', {
        name: /install app/i,
      })
      fireEvent.click(installButton)

      expect(installButton).toHaveProperty('disabled', true)
      expect(
        screen.queryByText(
          /open your browser menu and choose add to home screen or install app/i,
        ),
      ).toBe(null)
      expect(
        screen.getByText(
          /checking whether your browser can show its install prompt/i,
        ),
      ).toBeTruthy()
    },
  )

  it('shows fallback install guidance when unsupported browsers have no native prompt', async () => {
    renderHomeExperience()

    fireEvent.click(
      await screen.findByRole('button', { name: /install app/i }),
    )

    expect(
      await screen.findByText(
        /open your browser menu and choose add to home screen or install app/i,
      ),
    ).toBeTruthy()
  })

  it('uses the deferred native install prompt when available', async () => {
    installUserAgent(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/125.0.0.0 Mobile Safari/537.36',
    )
    renderHomeExperience()
    const installPromptEvent = createBeforeInstallPromptEvent('accepted')

    await screen.findByText(/add treetales to your home screen/i)
    act(() => {
      window.dispatchEvent(installPromptEvent)
    })
    fireEvent.click(screen.getByRole('button', { name: /install app/i }))

    await waitFor(() => {
      expect(installPromptEvent.prompt).toHaveBeenCalled()
    })
    expect(
      window.localStorage.getItem(MOBILE_INSTALL_CHOICE_DISMISSED_KEY),
    ).toBe('true')
    expect(
      await screen.findByRole('heading', { name: 'Your stories' }),
    ).toBeTruthy()
  })

  it('keeps the install choice visible when native installation is dismissed', async () => {
    installUserAgent(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/125.0.0.0 Mobile Safari/537.36',
    )
    renderHomeExperience()
    const installPromptEvent = createBeforeInstallPromptEvent('dismissed')

    await screen.findByText(/add treetales to your home screen/i)
    act(() => {
      window.dispatchEvent(installPromptEvent)
    })
    fireEvent.click(screen.getByRole('button', { name: /install app/i }))

    await waitFor(() => {
      expect(installPromptEvent.prompt).toHaveBeenCalled()
    })
    expect(
      window.localStorage.getItem(MOBILE_INSTALL_CHOICE_DISMISSED_KEY),
    ).toBe(null)
    expect(
      await screen.findByText(
        /installation was dismissed. you can try again or continue/i,
      ),
    ).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Your stories' })).toBe(
      null,
    )
  })
})
