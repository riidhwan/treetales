import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/stories.$storyId.characters.$characterId'

describe('character detail route', () => {
  it('registers a character detail component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })

  it('keeps story and character loading inside the detail component', () => {
    expect(Route.options.loader).toBeUndefined()
  })
})
