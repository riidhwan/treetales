import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/stories.$storyId.chapters.$chapterId.edit'

describe('chapter editor placeholder route', () => {
  it('registers a chapter editor component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })

  it('keeps chapter loading inside the future editor component', () => {
    expect(Route.options.loader).toBeUndefined()
  })
})
