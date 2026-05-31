import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import {
  DISMISSED_KEY,
  openAppWithMobileInstallChoiceAvailable,
} from '../support/app'

interface DispatchInstallPromptOptions {
  readonly outcome: 'accepted' | 'dismissed'
}

declare global {
  interface Window {
    __installPromptCalls?: number
  }
}

const { Given, When, Then } = createBdd()

Given('the mobile install choice has not been dismissed', async ({ page }) => {
  await openAppWithMobileInstallChoiceAvailable(page)
})

Given('I am viewing the mobile install choice', async ({ page }) => {
  await expect(page.getByText(/add treetales to your home screen/i)).toBeVisible()
})

Then('the install action is disabled', async ({ page }) => {
  await expect(page.getByRole('button', { name: /install app/i })).toBeDisabled()
})

When('I try the disabled install action', async ({ page }) => {
  await page.getByRole('button', { name: /install app/i }).click({ force: true })
})

Then(
  'TreeTales keeps waiting for the native install prompt',
  async ({ page }) => {
    await expect(
      page.getByText(
        /checking whether your browser can show its install prompt/i,
      ),
    ).toBeVisible()
  },
)

Then('TreeTales does not show manual install instructions', async ({ page }) => {
  await expect(
    page.getByText(/open your browser menu and choose add to home screen/i),
  ).toBeHidden()
})

When(
  'the browser install prompt becomes available and will be accepted',
  async ({ page }) => {
    await dispatchBeforeInstallPrompt(page, { outcome: 'accepted' })
  },
)

When(
  'the browser install prompt becomes available and will be dismissed',
  async ({ page }) => {
    await dispatchBeforeInstallPrompt(page, { outcome: 'dismissed' })
  },
)

When('I choose to install the app', async ({ page }) => {
  const installButton = page.getByRole('button', { name: /install app/i })

  await expect(installButton).toBeEnabled()
  await installButton.click()
})

Then('TreeTales calls the browser install prompt once', async ({ page }) => {
  await expect
    .poll(async () => page.evaluate(() => window.__installPromptCalls ?? 0))
    .toBe(1)
})

Then('TreeTales opens the Story dashboard', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Your stories' })).toBeVisible()
})

Then(
  'TreeTales remembers that the mobile install choice was accepted',
  async ({ page }) => {
    await expect
      .poll(
        () =>
          page.evaluate((dismissedKey) => {
            return window.localStorage.getItem(dismissedKey)
          }, DISMISSED_KEY),
        {
          message: 'accepted install choice should be remembered',
        },
      )
      .toBe('true')
  },
)

Then(
  'TreeTales keeps the mobile install choice visible after dismissal',
  async ({ page }) => {
    await expect(
      page.getByText(
        /installation was dismissed. you can try again or continue/i,
      ),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Your stories' }),
    ).toBeHidden()
  },
)

Then('TreeTales has not remembered the mobile install choice', async ({ page }) => {
  const dismissedChoice = await page.evaluate((dismissedKey) => {
    return window.localStorage.getItem(dismissedKey)
  }, DISMISSED_KEY)

  expect(dismissedChoice).toBeNull()
})

async function dispatchBeforeInstallPrompt(
  page: Page,
  { outcome }: DispatchInstallPromptOptions,
) {
  await page.evaluate((selectedOutcome) => {
    window.__installPromptCalls = 0

    const event = new Event('beforeinstallprompt', {
      cancelable: true,
    })

    Object.defineProperties(event, {
      prompt: {
        value: () => {
          window.__installPromptCalls = (window.__installPromptCalls ?? 0) + 1
          return Promise.resolve()
        },
      },
      userChoice: {
        value: Promise.resolve({
          outcome: selectedOutcome,
          platform: 'web',
        }),
      },
    })

    window.dispatchEvent(event)
  }, outcome)
}
