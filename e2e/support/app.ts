import { expect, type Page } from '@playwright/test'

export const DISMISSED_KEY = 'treetales.mobileInstallChoiceDismissed'

export async function openAppWithMobileInstallChoiceDismissed(page: Page) {
  await page.goto('/')
  await page.evaluate((dismissedKey) => {
    window.localStorage.setItem(dismissedKey, 'true')
  }, DISMISSED_KEY)
  await page.reload()
}

export async function openAppWithMobileInstallChoiceAvailable(page: Page) {
  await page.goto('/')
  await page.evaluate((dismissedKey) => {
    window.localStorage.removeItem(dismissedKey)
  }, DISMISSED_KEY)
  await page.reload()
}

export async function createReadableStory(page: Page) {
  await page.getByRole('button', { name: 'New Story' }).first().click()
  await page.getByLabel('Title').fill('Reader Settings')
  await page.getByLabel('Description').fill('Appearance controls')
  await page.getByRole('button', { name: 'Create Story' }).click()
  await openReaderForCurrentStory(page)
  await page.getByRole('button', { name: 'Add Intro Chapter' }).click()

  await expect(page.getByText('Reader Settings - Intro Chapter')).toBeVisible()
  await page.getByLabel('Title').fill('The Reading Room')
  await page
    .getByLabel('Content')
    .fill('The lamps were low, and the page was waiting.')
  await page.getByRole('button', { name: /^save$/i }).click()
  await expect(
    page.getByRole('heading', { name: 'The Reading Room' }),
  ).toBeVisible()
}

export async function startIntroChapterCreation(page: Page) {
  await page.getByRole('button', { name: 'New Story' }).first().click()
  await page.getByLabel('Title').fill('Long Road')
  await page.getByLabel('Description').fill('A long writing surface test')
  await page.getByRole('button', { name: 'Create Story' }).click()
  await openReaderForCurrentStory(page)
  await page.getByRole('button', { name: 'Add Intro Chapter' }).click()

  await expect(page.getByText('Long Road - Intro Chapter')).toBeVisible()
}

export function buildLongChapterContent(paragraphCount: number) {
  return Array.from(
    { length: paragraphCount },
    (_, index) =>
      `Paragraph ${index + 1}: The road keeps bending through the trees.`,
  ).join('\n\n')
}

async function openReaderForCurrentStory(page: Page) {
  await page.waitForURL(/\/stories\/[^/]+\/edit$/)

  const editUrl = new URL(page.url())
  const editPathPattern = /^\/stories\/([^/]+)\/edit$/
  const match = editPathPattern.exec(editUrl.pathname)

  if (!match) {
    throw new Error(`Unexpected story edit URL: ${editUrl.pathname}`)
  }

  const [, storyId] = match
  await page.goto(`/stories/${storyId}/read`)
}
