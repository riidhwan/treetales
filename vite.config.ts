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
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/*.worker.ts',
          'src/routes/**',
          'src/routeTree.gen.ts',
          'src/test/**',
        ],
        thresholds: {
          branches: 95,
          functions: 97,
          lines: 98,
          statements: 98,
        },
      },
      environment: 'jsdom',
    },
  }
})

export default config
