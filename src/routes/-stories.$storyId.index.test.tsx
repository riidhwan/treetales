import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/stories.$storyId.index'

describe('story detail index route', () => {
  it('registers a detail component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })

  it('keeps story loading inside the detail component', () => {
    expect(Route.options.loader).toBeUndefined()
  })
})
