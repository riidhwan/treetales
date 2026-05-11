import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/index'

describe('home route', () => {
  it('registers a dashboard component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })
})
