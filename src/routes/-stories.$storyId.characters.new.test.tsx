import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/stories.$storyId.characters.new'

describe('character creation route', () => {
  it('registers a Character creation component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })

  it('keeps story loading inside the creation component', () => {
    expect(Route.options.loader).toBeUndefined()
  })
})
