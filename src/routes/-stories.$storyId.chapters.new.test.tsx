import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/stories.$storyId.chapters.new'

describe('intro chapter creator route', () => {
  it('registers a chapter creator component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })

  it('keeps intro chapter creation loading inside the creator component', () => {
    expect(Route.options.loader).toBeUndefined()
  })
})
