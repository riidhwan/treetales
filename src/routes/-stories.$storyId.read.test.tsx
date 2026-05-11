import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/stories.$storyId.read'

describe('story reader route', () => {
  it('registers a reader component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })
})
