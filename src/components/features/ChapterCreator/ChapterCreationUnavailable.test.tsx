import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChapterCreationUnavailable } from '@/components/features/ChapterCreator/ChapterCreationUnavailable'

describe('ChapterCreationUnavailable', () => {
  it('uses a fallback title when the existing intro chapter title is unavailable', () => {
    render(<ChapterCreationUnavailable status="intro-chapter-exists" />)

    expect(screen.getByText('Intro chapter exists')).toBeTruthy()
    expect(
      screen.getByText('This story already has an intro chapter.'),
    ).toBeTruthy()
  })

  it('renders nothing for an error state without a message', () => {
    const view = render(<ChapterCreationUnavailable status="error" />)

    expect(view.container.textContent).toBe('')
  })
})
