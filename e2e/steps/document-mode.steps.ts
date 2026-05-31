import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import {
  buildLongChapterContent,
  createReadableStory,
  openAppWithMobileInstallChoiceDismissed,
  startIntroChapterCreation,
} from '../support/app'

const READER_APPEARANCE_KEY = 'treetales.readerAppearance'

const { Given, When, Then } = createBdd()

let chapterContent = ''
let writingPosition = 0

Given('the mobile install choice is dismissed', async ({ page }) => {
  await openAppWithMobileInstallChoiceDismissed(page)
})

Given('I am reading an Intro Chapter', async ({ page }) => {
  await createReadableStory(page)
})

Given('I am creating an Intro Chapter for a Story', async ({ page }) => {
  await startIntroChapterCreation(page)
})

When('I set the viewport to desktop width', async ({ page }) => {
  await page.setViewportSize({ height: 800, width: 1280 })
})

When('I set the viewport to mobile width', async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 })
})

When('I open Reader Appearance', async ({ page }) => {
  await page.getByRole('button', { name: 'Reader Appearance' }).click()
  await expect(page.getByText('Reader Appearance')).toBeVisible()
})

Then('the Readerly font option is selected', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Readerly' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

When(
  'I choose the Reader Appearance font {string}',
  async ({ page }, fontName: string) => {
    await page.getByRole('button', { name: fontName }).click()
  },
)

When('I increase the Reader Appearance font size', async ({ page }) => {
  await page.getByRole('button', { name: 'Increase Font Size' }).click()
})

Then('Reader Appearance shows {string}', async ({ page }, sizeLabel: string) => {
  await expect(page.getByText(sizeLabel)).toBeVisible()
})

Then(
  'the {string} font option is selected',
  async ({ page }, fontName: string) => {
    await expect(page.getByRole('button', { name: fontName })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  },
)

Then(
  'the selected Reader Appearance is remembered by this browser',
  async ({ page }) => {
    await expect.poll(() => readStoredAppearance(page)).toContain(
      '"fontId":"nv-garamond"',
    )
  },
)

Then(
  'the Chapter Document uses the {string} font',
  async ({ page }, fontName: string) => {
    await expect.poll(() => getReaderContentFontFamily(page)).toContain(fontName)
  },
)

Then('the Reader Appearance panel is inside the viewport', async ({ page }) => {
  await expect.poll(() => isAppearancePanelInsideViewport(page)).toBe(true)
})

When('I fill the Chapter title', async ({ page }) => {
  await page.getByLabel('Title').fill('The Opening Path')
})

When(
  'I fill the Chapter content with {int} paragraphs',
  async ({ page }, paragraphCount: number) => {
    chapterContent = buildLongChapterContent(paragraphCount)
    await page.getByLabel('Content').fill(chapterContent)
  },
)

Then('the Chapter Document has no inner scroll container', async ({ page }) => {
  await expect(page.locator('section[aria-label="Chapter document"]')).toBeVisible()
  await expect.poll(() => hasNoInnerContentScroll(page)).toBe(true)
})

Then('the page can scroll', async ({ page }) => {
  await expect.poll(() => hasPageScroll(page)).toBe(true)
})

When('I scroll to the bottom of the page', async ({ page }) => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
})

Then('the Chapter title has scrolled out of view', async ({ page }) => {
  await expect.poll(() => isTitleScrolledOutOfView(page)).toBe(true)
})

When('I save the Chapter and reopen it for editing', async ({ page }) => {
  await page.getByRole('button', { name: /^save$/i }).click()
  await expect(
    page.getByRole('heading', { name: 'The Opening Path' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Edit Chapter' }).click()
  await page.waitForURL(/\/chapters\/[^/]+\/edit$/)
})

Then('the Chapter content is preserved', async ({ page }) => {
  await expect(page.getByLabel('Content')).toHaveValue(chapterContent)
})

When('I move my writing position to the bottom', async ({ page }) => {
  const content = page.getByLabel('Content')

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await content.focus()
  await content.evaluate((element) => {
    const textArea = element as HTMLTextAreaElement

    textArea.selectionStart = textArea.value.length
    textArea.selectionEnd = textArea.value.length
  })

  writingPosition = await page.evaluate(() => window.scrollY)
})

When('I type near the bottom', async ({ page }) => {
  await page.keyboard.type('!')
})

Then('my writing position stays stable', async ({ page }) => {
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(writingPosition)
})

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

async function hasNoInnerContentScroll(page: Page) {
  return page.getByLabel('Content').evaluate((textArea) => {
    const overflowY = window.getComputedStyle(textArea).overflowY

    return (
      overflowY === 'hidden' &&
      textArea.scrollHeight - textArea.clientHeight <= 1
    )
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
