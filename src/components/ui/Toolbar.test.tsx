import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Toolbar, ToolbarContext } from '@/components/ui/Toolbar'

describe('Toolbar', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a labelled toolbar navigation surface', () => {
    render(
      <Toolbar
        context={<ToolbarContext>Draft chapter</ToolbarContext>}
        label="Chapter actions"
        leading={<button type="button">Back</button>}
        primary={<button type="button">Save</button>}
        trailing={<button type="button">Dashboard</button>}
      />,
    )

    expect(screen.getByRole('navigation', { name: 'Chapter actions' }))
      .toBeTruthy()
    expect(screen.getByText('Draft chapter')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeTruthy()
  })

  it('keeps action-only toolbars aligned without context text', () => {
    render(
      <Toolbar
        label="Reader actions"
        trailing={<button type="button">Story Details</button>}
      />,
    )

    expect(screen.getByRole('navigation', { name: 'Reader actions' }))
      .toBeTruthy()
    expect(screen.getByRole('button', { name: 'Story Details' })).toBeTruthy()
  })
})
