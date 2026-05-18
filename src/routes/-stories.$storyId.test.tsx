import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/stories.$storyId'

describe('story detail route', () => {
  it('registers an outlet layout so nested story routes can render', () => {
    const routeSource = readFileSync(
      path.join(process.cwd(), 'src/routes/stories.$storyId.tsx'),
      'utf8',
    )

    expect(routeSource).toContain("import { createFileRoute, Outlet }")
    expect(routeSource).toContain('component: Outlet')
  })

  it('keeps story loading outside the parent layout route', () => {
    expect(Route.options.loader).toBeUndefined()
  })
})
