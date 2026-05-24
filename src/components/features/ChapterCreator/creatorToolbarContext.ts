interface ToolbarContextOptions {
  readonly isIntroChapter: boolean
  readonly parentChapterTitle?: string
  readonly storyTitle?: string
}

export function getToolbarContext({
  isIntroChapter,
  parentChapterTitle,
  storyTitle,
}: ToolbarContextOptions) {
  const contextStoryTitle = storyTitle ?? 'Story'

  if (isIntroChapter) {
    return `${contextStoryTitle} - Intro Chapter`
  }

  return `${contextStoryTitle} - Branch from ${
    parentChapterTitle ?? 'selected chapter'
  }`
}
