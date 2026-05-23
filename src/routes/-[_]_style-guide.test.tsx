import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/[_]_style-guide'

describe('style guide route', () => {
  it('registers the dev style-guide component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })
})
