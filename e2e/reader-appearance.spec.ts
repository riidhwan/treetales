import { expect, test, type Page } from '@playwright/test'

const DISMISSED_KEY = 'treetales.mobileInstallChoiceDismissed'
const READER_APPEARANCE_KEY = 'treetales.readerAppearance'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate((dismissedKey) => {
    window.localStorage.setItem(dismissedKey, 'true')
  }, DISMISSED_KEY)
  await page.reload()
})

test('adjusts reader appearance on desktop and mobile widths', async ({
  page,
}) => {
  await createReadableStory(page)
  await page.setViewportSize({ height: 800, width: 1280 })

  await page.getByRole('button', { name: 'Reader Appearance' }).click()
  await expect(page.getByText('Reader Appearance')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Readerly' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await page.getByRole('button', { name: 'NV Garamond' }).click()
  await page.getByRole('button', { name: 'Increase Font Size' }).click()

  await expect(page.getByText('15 pt')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'NV Garamond' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => readStoredAppearance(page)).toContain(
    '"fontId":"nv-garamond"',
  )

  await expect.poll(() => getReaderContentFontFamily(page)).toContain(
    'NV Garamond',
  )
  await expect.poll(() => isAppearancePanelInsideViewport(page)).toBe(true)

  await page.setViewportSize({ height: 844, width: 390 })
  await expect(page.getByText('Reader Appearance')).toBeVisible()
  await expect.poll(() => isAppearancePanelInsideViewport(page)).toBe(true)
})

async function createReadableStory(page: Page) {
  await page.getByRole('button', { name: 'New Story' }).first().click()
  await page.getByLabel('Title').fill('Reader Settings')
  await page.getByLabel('Description').fill('Appearance controls')
  await page.getByRole('button', { name: 'Create Story' }).click()
  await page.getByRole('button', { name: 'Add Intro Chapter' }).click()

  await expect(page.getByText('Reader Settings - Intro Chapter')).toBeVisible()
  await page.getByLabel('Title').fill('The Reading Room')
  await page
    .getByLabel('Content')
    .fill('The lamps were low, and the page was waiting.')
  await page.getByRole('button', { name: /^save$/i }).click()
  await page.waitForURL(/\/stories\/[^/]+\/chapters\/[^/]+\/edit$/)

  const editUrl = new URL(page.url())
  const editPathPattern = /^\/stories\/([^/]+)\/chapters\/([^/]+)\/edit$/
  const match = editPathPattern.exec(editUrl.pathname)

  if (!match) {
    throw new Error(`Unexpected chapter edit URL: ${editUrl.pathname}`)
  }

  const [, storyId, chapterId] = match
  await page.goto(`/stories/${storyId}/read?chapterId=${chapterId}`)
  await expect(
    page.getByRole('heading', { name: 'The Reading Room' }),
  ).toBeVisible()
}

async function readStoredAppearance(page: Page) {
  return page.evaluate((storageKey) => {
    return window.localStorage.getItem(storageKey) ?? ''
  }, READER_APPEARANCE_KEY)
}

async function getReaderContentFontFamily(page: Page) {
  return page.getByText('The lamps were low').evaluate((content) => {
    const contentContainer = content.parentElement

    return contentContainer
      ? window.getComputedStyle(contentContainer).fontFamily
      : ''
  })
}

async function isAppearancePanelInsideViewport(page: Page) {
  return page.locator('#reader-appearance-panel').evaluate((panel) => {
    const panelBox = panel.getBoundingClientRect()

    return panelBox.left >= 0 && panelBox.right <= window.innerWidth
  })
}
