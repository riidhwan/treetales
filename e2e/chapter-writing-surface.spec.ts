import { expect, test, type Page } from '@playwright/test'

const DISMISSED_KEY = 'treetales.mobileInstallChoiceDismissed'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate((dismissedKey) => {
    window.localStorage.setItem(dismissedKey, 'true')
  }, DISMISSED_KEY)
  await page.reload()
})

test('uses the page as the chapter writing scroll container', async ({
  page,
}) => {
  const longContent = Array.from(
    { length: 80 },
    (_, index) =>
      `Paragraph ${index + 1}: The road keeps bending through the trees.`,
  ).join('\n\n')

  await page.getByRole('button', { name: 'New Story' }).first().click()
  await page.getByLabel('Title').fill('Long Road')
  await page.getByLabel('Description').fill('A long writing surface test')
  await page.getByRole('button', { name: 'Create Story' }).click()
  await page.getByRole('button', { name: 'Add Intro Chapter' }).click()

  await expect(page.getByText('Long Road - Intro Chapter')).toBeVisible()
  await page.getByLabel('Title').fill('The Opening Path')
  await page.getByLabel('Content').fill(longContent)

  await expect(
    page.locator('section[aria-label="Chapter document"]'),
  ).toBeVisible()
  await expect.poll(() => hasFullWidthPaper(page)).toBe(true)
  await expect.poll(() => hasTightTextInset(page)).toBe(true)
  await expect.poll(() => hasNoInnerContentScroll(page)).toBe(true)
  await expect.poll(() => hasPageScroll(page)).toBe(true)

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect.poll(() => isTitleScrolledOutOfView(page)).toBe(true)

  await page.getByRole('button', { name: /^save$/i }).click()
  await page.waitForURL(/\/chapters\/[^/]+\/edit$/)

  await expect(page.getByLabel('Content')).toHaveValue(longContent)
  await expect.poll(() => hasNoInnerContentScroll(page)).toBe(true)
  await expect.poll(() => hasPageScroll(page)).toBe(true)
})

test('keeps page scroll stable while typing near the bottom', async ({
  page,
}) => {
  const longContent = Array.from(
    { length: 120 },
    (_, index) =>
      `Paragraph ${index + 1}: The road keeps bending through the trees.`,
  ).join('\n\n')

  await page.getByRole('button', { name: 'New Story' }).first().click()
  await page.getByLabel('Title').fill('Long Road')
  await page.getByLabel('Description').fill('A long writing surface test')
  await page.getByRole('button', { name: 'Create Story' }).click()
  await page.getByRole('button', { name: 'Add Intro Chapter' }).click()

  await expect(page.getByText('Long Road - Intro Chapter')).toBeVisible()
  await page.getByLabel('Title').fill('The Opening Path')
  await page.getByLabel('Content').fill(longContent)

  const content = page.getByLabel('Content')

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await content.focus()
  await content.evaluate((element) => {
    const textArea = element as HTMLTextAreaElement

    textArea.selectionStart = textArea.value.length
    textArea.selectionEnd = textArea.value.length
  })

  const beforeScrollY = await page.evaluate(() => window.scrollY)

  await page.keyboard.type('!')

  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBe(beforeScrollY)
})

async function hasFullWidthPaper(page: Page) {
  const box = await page
    .locator('section[aria-label="Chapter document"]')
    .boundingBox()

  if (!box) {
    return false
  }

  return page.evaluate(
    ({ left, width }) =>
      Math.abs(left) <= 1 && width >= window.innerWidth - 1,
    {
      left: box.x,
      width: box.width,
    },
  )
}

async function hasNoInnerContentScroll(page: Page) {
  return page.getByLabel('Content').evaluate((textArea) => {
    const overflowY = window.getComputedStyle(textArea).overflowY

    return (
      overflowY === 'hidden' &&
      textArea.scrollHeight - textArea.clientHeight <= 1
    )
  })
}

async function hasTightTextInset(page: Page) {
  return page.getByLabel('Content').evaluate((textArea) => {
    const { left } = textArea.getBoundingClientRect()

    return left <= 10
  })
}

async function hasPageScroll(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollHeight > window.innerHeight,
  )
}

async function isTitleScrolledOutOfView(page: Page) {
  return page.getByLabel('Title').evaluate((titleInput) => {
    const { bottom } = titleInput.getBoundingClientRect()

    return bottom < 0
  })
}
