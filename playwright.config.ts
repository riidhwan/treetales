import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

const testDir = defineBddConfig({
  features: 'e2e/features/**/*.feature',
  steps: 'e2e/steps/**/*.ts',
  outputDir: '.features-gen',
})

export default defineConfig({
  testDir,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    reuseExistingServer: !process.env.CI,
    url: 'http://127.0.0.1:3000',
  },
  projects: [
    {
      name: 'android-edge',
      use: {
        ...devices['Pixel 7'],
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/125.0.0.0 Mobile Safari/537.36 EdgA/125.0.0.0',
      },
    },
  ],
})
