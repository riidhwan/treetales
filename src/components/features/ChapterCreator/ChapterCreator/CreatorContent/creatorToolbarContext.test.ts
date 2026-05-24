import { describe, expect, it } from 'vitest'

import { getToolbarContext } from './creatorToolbarContext'

describe('getToolbarContext', () => {
  it('uses a generic story title when the story title is unavailable', () => {
    expect(
      getToolbarContext({
        isIntroChapter: true,
      }),
    ).toBe('Story - Intro Chapter')
  })

  it('uses a generic parent chapter label when the parent title is unavailable', () => {
    expect(
      getToolbarContext({
        isIntroChapter: false,
        storyTitle: 'The Old Road',
      }),
    ).toBe('The Old Road - Branch from selected chapter')
  })
})
