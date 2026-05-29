import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'

describe('Dialog', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a labelled modal surface with an accessible close action', () => {
    const onClose = vi.fn()

    render(
      <Dialog
        eyebrow="Character"
        onClose={onClose}
        title="Mira"
        titleId="character-title"
      >
        <p>Character details</p>
      </Dialog>,
    )

    expect(
      screen.getByRole('dialog', { name: 'Mira' }).getAttribute('aria-modal'),
    ).toBe('true')
    expect(screen.getByText('Character')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders optional footer actions', () => {
    render(
      <Dialog
        footer={<Button variant="primary">Save</Button>}
        onClose={() => undefined}
        title="Edit Mira"
        titleId="edit-title"
      >
        <p>Character form</p>
      </Dialog>,
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
  })

  it('can disable its close action', () => {
    const onClose = vi.fn()

    render(
      <Dialog
        closeDisabled
        onClose={onClose}
        title="Import image"
        titleId="import-title"
      >
        <p>Importing</p>
      </Dialog>,
    )

    const closeButton = screen.getByRole('button', { name: 'Close dialog' })

    expect(closeButton.hasAttribute('disabled')).toBe(true)
    fireEvent.click(closeButton)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders outside the local component container', () => {
    render(
      <div data-testid="local-container">
        <Dialog
          onClose={() => undefined}
          title="Prompt Builder"
          titleId="prompt-title"
        >
          <p>Prompt content</p>
        </Dialog>
      </div>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Prompt Builder' })

    expect(screen.getByTestId('local-container').contains(dialog)).toBe(false)
    expect(document.body.contains(dialog)).toBe(true)
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()

    render(
      <Dialog onClose={onClose} title="Prompt Builder" titleId="prompt-title">
        <p>Prompt content</p>
      </Dialog>,
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ignores unrelated keyboard commands', () => {
    const onClose = vi.fn()

    render(
      <Dialog onClose={onClose} title="Prompt Builder" titleId="prompt-title">
        <p>Prompt content</p>
      </Dialog>,
    )

    fireEvent.keyDown(document, { key: 'Enter' })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('keeps focus on the dialog when no inner controls are focusable', () => {
    render(
      <Dialog onClose={() => undefined} title="Notice" titleId="notice-title">
        <p>Read-only content</p>
      </Dialog>,
    )

    const closeButton = screen.getByRole('button', { name: 'Close dialog' })
    closeButton.setAttribute('disabled', '')
    fireEvent.keyDown(document, { key: 'Tab' })

    expect(document.activeElement).toBe(
      screen.getByRole('dialog', { name: 'Notice' }),
    )
  })

  it('keeps keyboard focus inside the dialog', () => {
    render(
      <Dialog
        footer={<Button>Copy prompt</Button>}
        onClose={() => undefined}
        title="Prompt Builder"
        titleId="prompt-title"
      >
        <Button>First action</Button>
      </Dialog>,
    )

    const firstButton = screen.getByRole('button', { name: 'First action' })
    const closeButton = screen.getByRole('button', { name: 'Close dialog' })
    const copyButton = screen.getByRole('button', { name: 'Copy prompt' })

    copyButton.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(closeButton)

    closeButton.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(copyButton)

    firstButton.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(firstButton)
  })
})
