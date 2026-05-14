import { expect, test, type Page } from '@playwright/test'

const DISMISSED_KEY = 'treetales.mobileInstallChoiceDismissed'

interface DispatchInstallPromptOptions {
  readonly outcome: 'accepted' | 'dismissed'
}

declare global {
  interface Window {
    __installPromptCalls?: number
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate((dismissedKey) => {
    window.localStorage.removeItem(dismissedKey)
  }, DISMISSED_KEY)
  await page.reload()
})

test('keeps Android Edge users waiting for the native install prompt event', async ({
  page,
}) => {
  await expect(
    page.getByText(/add treetales to your home screen/i),
  ).toBeVisible()

  const installButton = page.getByRole('button', { name: /install app/i })
  await expect(installButton).toBeDisabled()
  await installButton.click({ force: true })

  await expect(
    page.getByText(/checking whether your browser can show its install prompt/i),
  ).toBeVisible()
  await expect(
    page.getByText(/open your browser menu and choose add to home screen/i),
  ).toBeHidden()
})

test('calls the deferred browser install prompt from the install button', async ({
  page,
}) => {
  await expect(
    page.getByText(/add treetales to your home screen/i),
  ).toBeVisible()

  await dispatchBeforeInstallPrompt(page, { outcome: 'accepted' })
  const installButton = page.getByRole('button', { name: /install app/i })
  await expect(installButton).toBeEnabled()
  await installButton.click()

  await expect
    .poll(async () => page.evaluate(() => window.__installPromptCalls ?? 0))
    .toBe(1)
  await expect(page.getByRole('heading', { name: 'Story dashboard' })).toBeVisible()
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
})

test('keeps the install choice visible after the native prompt is dismissed', async ({
  page,
}) => {
  await expect(
    page.getByText(/add treetales to your home screen/i),
  ).toBeVisible()

  await dispatchBeforeInstallPrompt(page, { outcome: 'dismissed' })
  const installButton = page.getByRole('button', { name: /install app/i })
  await expect(installButton).toBeEnabled()
  await installButton.click()

  await expect
    .poll(async () => page.evaluate(() => window.__installPromptCalls ?? 0))
    .toBe(1)
  await expect(
    page.getByText(/installation was dismissed. you can try again or continue/i),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Story dashboard' }),
  ).toBeHidden()
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
