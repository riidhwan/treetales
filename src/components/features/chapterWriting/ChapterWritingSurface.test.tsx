import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  ChapterWritingSurface,
  countMarkdownWords,
} from '@/components/features/chapterWriting'

describe('countMarkdownWords', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('counts readable prose while ignoring markdown targets and fenced code', () => {
    const markdown = [
      '# The Crossing',
      '',
      'Read [the old road](https://example.com/old-road) before `turning back`.',
      '',
      '![Map label](https://example.com/map.png)',
      '',
      '```ts',
      'const hiddenWords = "do not count";',
      '```',
      '',
      '<https://example.com/hidden>',
    ].join('\n')

    expect(countMarkdownWords(markdown)).toBe(11)
  })

  it('keeps incomplete markdown links as visible prose', () => {
    expect(countMarkdownWords('Follow [the broken path and keep moving')).toBe(
      7,
    )
    expect(countMarkdownWords('Follow [the sign](without an ending')).toBe(6)
  })

  it('keeps the window position stable when the writing surface grows upward', () => {
    let scrollYReads = 0
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => {
        scrollYReads += 1
        return scrollYReads === 1 ? 12 : 4
      },
    })
    Object.defineProperty(window, 'scrollX', {
      configurable: true,
      value: 3,
    })
    Object.defineProperty(HTMLTextAreaElement.prototype, 'offsetHeight', {
      configurable: true,
      get: () => 10,
    })
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => 24,
    })
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {
      return undefined
    })

    render(
      <ChapterWritingSurface
        canSubmit
        content="One"
        contentPlaceholder="Write this chapter in markdown..."
        isSubmitting={false}
        mode="write"
        navigationActions={<span>Navigation</span>}
        onContentChange={vi.fn()}
        onModeChange={vi.fn()}
        onSubmit={vi.fn()}
        onTitleChange={vi.fn()}
        primaryActionIcon={<span aria-hidden="true" />}
        primaryActionLabel="Save"
        readerFontFamily="Readerly"
        readerFontSizePt={14}
        submittingActionLabel="Saving..."
        title="Title"
        titlePlaceholder="Untitled chapter"
        toolbarContext="Story - Chapter"
      />,
    )

    expect(screen.getByText('1 word')).toBeTruthy()
    expect(scrollTo).toHaveBeenCalledWith(3, 12)
  })
})
