import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/settings'

describe('settings route', () => {
  it('registers the App Settings component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })
})
