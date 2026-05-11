import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/stories.$storyId.edit'

describe('story editor route', () => {
  it('registers an editor component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })
})
