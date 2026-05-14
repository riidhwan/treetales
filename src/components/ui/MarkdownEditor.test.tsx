import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MarkdownEditor } from '@/components/ui/MarkdownEditor'

describe('MarkdownEditor', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('edits markdown by default and reports raw value changes', () => {
    const onChange = vi.fn()

    render(
      <MarkdownEditor
        label="Content"
        name="content"
        onChange={onChange}
        value="Opening line."
      />,
    )

    expect(screen.getByLabelText('Content')).toHaveProperty(
      'value',
      'Opening line.',
    )
    expect(screen.queryByRole('region', { name: 'Content preview' })).toBeNull()

    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: '## New opening' },
    })

    expect(onChange).toHaveBeenCalledWith('## New opening')
  })

  it('toggles between editor and rendered preview', () => {
    const onChange = vi.fn()
    const value = ['## New opening', '', 'Choose **carefully**.'].join('\n')

    render(
      <MarkdownEditor
        label="Content"
        name="content"
        onChange={onChange}
        value={value}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    const preview = screen.getByRole('region', { name: 'Content preview' })
    expect(
      within(preview).getByRole('heading', { name: 'New opening' }),
    ).toBeTruthy()
    expect(within(preview).getByText('carefully').tagName).toBe('STRONG')
    expect(screen.queryByLabelText('Content')).toBeNull()
    expect(
      screen.getByRole('button', { name: 'Edit' }).getAttribute('aria-pressed'),
    ).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByLabelText('Content')).toHaveProperty(
      'value',
      value,
    )
    expect(
      screen
        .getByRole('button', { name: 'Preview' })
        .getAttribute('aria-pressed'),
    ).toBe('false')
  })

  it('shows an empty preview fallback', () => {
    render(
      <MarkdownEditor
        label="Content"
        name="content"
        onChange={vi.fn()}
        value=""
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    expect(screen.getByText('Nothing to preview yet.')).toBeTruthy()
  })
})
