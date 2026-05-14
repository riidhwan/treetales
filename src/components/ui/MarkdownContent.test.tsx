import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { MarkdownContent } from '@/components/ui/MarkdownContent'

describe('MarkdownContent', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders markdown blocks and inline formatting', () => {
    render(
      <MarkdownContent
        content={[
          '# Chapter Heading',
          '',
          'Read the [map](https://example.com/map "Map title") before **leaving**.',
          '',
          '> Keep your lantern covered.',
          '',
          '- First path',
          '- Second path',
          '',
          '1. North',
          '2. East',
          '',
          'Use `chalk` on the stone.',
          '',
          '---',
          '',
          '```',
          'signal-fire',
          '```',
        ].join('\n')}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Chapter Heading' }))
      .toBeTruthy()
    expect(screen.getByRole('link', { name: 'map' })).toHaveProperty(
      'href',
      'https://example.com/map',
    )
    expect(screen.getByText('leaving').tagName).toBe('STRONG')
    expect(screen.getByText('Keep your lantern covered.').closest('blockquote'))
      .toBeTruthy()
    expect(screen.getByText('First path').tagName).toBe('LI')
    expect(screen.getByText('North').tagName).toBe('LI')
    expect(screen.getByText('chalk').tagName).toBe('CODE')
    expect(screen.getByText('signal-fire').tagName).toBe('CODE')
  })

  it('renders GFM tables and does not render raw HTML', () => {
    render(
      <MarkdownContent
        content={[
          '| Choice | Result |',
          '| --- | --- |',
          '| Left | Forest |',
          '',
          '<h2>Unsafe heading</h2>',
        ].join('\n')}
      />,
    )

    const table = screen.getByRole('table')

    expect(within(table).getByRole('columnheader', { name: 'Choice' }))
      .toBeTruthy()
    expect(within(table).getByRole('cell', { name: 'Forest' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Unsafe heading' })).toBeNull()
  })

  it('renders fallback content when content is empty', () => {
    render(
      <MarkdownContent
        content=""
        emptyFallback="Nothing to preview yet."
      />,
    )

    expect(screen.getByText('Nothing to preview yet.')).toBeTruthy()
  })

  it('renders nothing when there is no content or fallback', () => {
    const view = render(<MarkdownContent content="" />)

    expect(view.container.innerHTML).toBe('')
  })
})
