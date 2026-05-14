import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { NotFoundPage } from '@/components/features/NotFoundPage'

describe('NotFoundPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a TreeTales not-found state with a dashboard path', () => {
    render(<NotFoundPage />)

    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeTruthy()
    expect(screen.getByText('This branch does not exist.')).toBeTruthy()
    expect(
      screen
        .getByRole('link', { name: /back to dashboard/i })
        .getAttribute('href'),
    ).toBe('/')
  })
})
