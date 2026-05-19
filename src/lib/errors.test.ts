import { describe, expect, it } from 'vitest'

import { getErrorMessage } from '@/lib/errors'

describe('getErrorMessage', () => {
  it('returns Error messages unchanged', () => {
    expect(getErrorMessage(new Error('Could not save chapter.'))).toBe(
      'Could not save chapter.',
    )
  })

  it('uses a default message for non-Error thrown values', () => {
    expect(getErrorMessage('failed')).toBe(
      'Something went wrong. Please try again.',
    )
  })
})
