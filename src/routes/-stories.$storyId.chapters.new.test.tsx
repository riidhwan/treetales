import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/stories.$storyId.chapters.new'

describe('intro chapter creator route', () => {
  it('registers a chapter creator component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })

  it('keeps intro chapter creation loading inside the creator component', () => {
    expect(Route.options.loader).toBeUndefined()
  })

  it('uses browser history for the intro chapter creation Back action', () => {
    const routeSource = readFileSync(
      resolve(process.cwd(), 'src/routes/stories.$storyId.chapters.new.tsx'),
      'utf8',
    )

    expect(routeSource).toMatch(
      /onGoBack=\{\(\) => router\.history\.back\(\)\}/,
    )
  })
})
