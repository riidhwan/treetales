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
    createExampleStory: vi.fn(),
    createStory: vi.fn(),
    deleteStory: vi.fn(),
    getChaptersByStoryId: vi.fn(() => Promise.resolve([])),
    getStories: vi.fn(() => Promise.resolve([])),
  }
}

function renderHomeExperience() {
  return render(
    <HomeExperience
      onEditStory={vi.fn()}
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
  })

  afterEach(() => {
    cleanup()
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
      await screen.findByRole('heading', { name: 'Story dashboard' }),
    ).toBeTruthy()
  })

  it('skips the install choice after continue was chosen before', async () => {
    window.localStorage.setItem(MOBILE_INSTALL_CHOICE_DISMISSED_KEY, 'true')

    renderHomeExperience()

    expect(
      await screen.findByRole('heading', { name: 'Story dashboard' }),
    ).toBeTruthy()
    expect(screen.queryByText(/add treetales to your home screen/i)).toBe(null)
  })

  it('skips the install choice in standalone app mode', async () => {
    installMatchMedia({ isMobile: true, isStandalone: true })

    renderHomeExperience()

    expect(
      await screen.findByRole('heading', { name: 'Story dashboard' }),
    ).toBeTruthy()
  })

  it('shows fallback install guidance when no native prompt is available', async () => {
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
      await screen.findByRole('heading', { name: 'Story dashboard' }),
    ).toBeTruthy()
  })
})
