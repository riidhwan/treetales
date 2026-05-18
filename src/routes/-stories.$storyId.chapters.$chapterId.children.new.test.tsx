import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/stories.$storyId.chapters.$chapterId.children.new'

describe('chapter creator route', () => {
  it('registers a chapter creator component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })

  it('keeps chapter creation loading inside the creator component', () => {
    expect(Route.options.loader).toBeUndefined()
  })

  it('does not wire a separate parent chapter navigation action', () => {
    const routeSource = readFileSync(
      resolve(
        process.cwd(),
        'src/routes/stories.$storyId.chapters.$chapterId.children.new.tsx',
      ),
      'utf8',
    )

    expect(routeSource).not.toContain('onOpenParentChapter')
  })

  it('uses browser history for the chapter creation Back action', () => {
    const routeSource = readFileSync(
      resolve(
        process.cwd(),
        'src/routes/stories.$storyId.chapters.$chapterId.children.new.tsx',
      ),
      'utf8',
    )

    expect(routeSource).toMatch(
      /onGoBack=\{\(\) => router\.history\.back\(\)\}/,
    )
  })
})
