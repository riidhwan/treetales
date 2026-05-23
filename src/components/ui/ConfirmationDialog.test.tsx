import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'

describe('ConfirmationDialog', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the default primary confirmation actions', () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()

    render(
      <ConfirmationDialog
        confirmLabel="Continue"
        message="Continue with this action?"
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="Continue?"
        titleId="confirmation-title"
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Continue?' })).toBeTruthy()
    expect(screen.getByText('Continue with this action?')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
