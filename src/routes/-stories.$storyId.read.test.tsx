import { describe, expect, it } from 'vitest'

import { Route } from '@/routes/stories.$storyId.read'

interface ReaderSearch {
  readonly chapterId: string | undefined
}

describe('story reader route', () => {
  it('registers a reader component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })

  it('validates optional chapter search params', () => {
    const validateSearch = Route.options.validateSearch

    expect(validateSearch).toBeTypeOf('function')

    if (typeof validateSearch !== 'function') {
      throw new Error('Expected validateSearch to be callable.')
    }

    const validateReaderSearch = validateSearch as (
      search: Record<string, unknown>,
    ) => ReaderSearch

    expect(validateReaderSearch({ chapterId: 'chapter-1' })).toEqual({
      chapterId: 'chapter-1',
    })
    expect(validateReaderSearch({ chapterId: '' })).toEqual({
      chapterId: undefined,
    })
    expect(validateReaderSearch({ chapterId: 7 })).toEqual({
      chapterId: undefined,
    })
    expect(validateReaderSearch({})).toEqual({
      chapterId: undefined,
    })
  })
})
