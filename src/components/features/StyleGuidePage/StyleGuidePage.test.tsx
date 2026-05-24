import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { StyleGuidePage } from '@/components/features/StyleGuidePage'

describe('StyleGuidePage', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a maintainer style-guide surface with tokens and primitives', () => {
    render(<StyleGuidePage />)

    expect(
      screen.getByRole('heading', { name: 'TreeTales Style Guide' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('navigation', { name: 'Style guide' }),
    ).toBeTruthy()
    expect(screen.getByText('background.app')).toBeTruthy()
    expect(screen.getByText('Local Primitives')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Primary action' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: /Story title/ })).toBeTruthy()
  })

  it('renders the not-found state when the dev surface is disabled', () => {
    render(<StyleGuidePage isEnabled={false} />)

    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('heading', { name: 'TreeTales Style Guide' }),
    ).toBeNull()
  })
})
