import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChapterPromptBuilderControl } from '@/components/features/shared/ChapterWriting/ChapterPromptBuilderControl'

function mockClipboard() {
  const writeText = vi.fn<(text: string) => Promise<void>>(() =>
    Promise.resolve(),
  )

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })

  return writeText
}

describe('ChapterPromptBuilderControl', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('builds prompts when the story title falls back to an untitled story label', async () => {
    const writeText = mockClipboard()

    render(
      <ChapterPromptBuilderControl
        chapterTitle="First Light"
        draftContent=""
        storyTitle="   "
        templateKind="intro"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Writing Assist' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prompt Builder' }))
    fireEvent.change(screen.getByLabelText('Rough plot'), {
      target: { value: 'Start on the road at dawn.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
    })
    expect(writeText.mock.calls[0]?.[0]).toContain(
      'Start on the road at dawn.',
    )
  })

  it('closes the prompt builder dialog', () => {
    render(
      <ChapterPromptBuilderControl
        chapterTitle="First Light"
        draftContent=""
        templateKind="intro"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Writing Assist' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prompt Builder' }))

    expect(screen.getByRole('dialog', { name: 'Prompt Builder' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close Prompt Builder' }))

    expect(
      screen.queryByRole('dialog', { name: 'Prompt Builder' }),
    ).toBeNull()
  })
})
