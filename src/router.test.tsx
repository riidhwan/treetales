import { describe, expect, it } from 'vitest'

import { NotFoundPage } from '@/components/features/NotFoundPage'
import { getRouter } from '@/router'

describe('getRouter', () => {
  it('creates a configured router instance', () => {
    const router = getRouter()

    expect(router.options.defaultNotFoundComponent).toBe(NotFoundPage)
    expect(router.options.scrollRestoration).toBe(true)
    expect(router.options.defaultPreload).toBe('intent')
    expect(router.options.defaultPreloadStaleTime).toBe(0)
  })
})
