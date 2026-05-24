import { chapterWritingCopy, commonCopy } from '@/copy'

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
  const contextStoryTitle = storyTitle ?? commonCopy.actions.story

  if (isIntroChapter) {
    return chapterWritingCopy.toolbarContext.introChapter(contextStoryTitle)
  }

  return chapterWritingCopy.toolbarContext.branchFrom(
    contextStoryTitle,
    parentChapterTitle ??
      chapterWritingCopy.toolbarContext.fallbackParentChapter,
  )
}
