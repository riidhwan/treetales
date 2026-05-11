import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig(({ mode }) => {
  const isTest = mode === 'test' || process.env.VITEST === 'true'

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
      !isTest &&
        cloudflare({
          viteEnvironment: {
            name: 'ssr',
          },
        }),
    ],
    test: {
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/routes/**',
          'src/routeTree.gen.ts',
        ],
        thresholds: {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
      environment: 'jsdom',
    },
  }
})

export default config
