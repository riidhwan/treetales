import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/stories.$storyId.chapters.$chapterId.children.new'

describe('chapter creator route', () => {
  it('registers a chapter creator component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })

  it('keeps chapter creation loading inside the creator component', () => {
    expect(Route.options.loader).toBeUndefined()
  })
})
