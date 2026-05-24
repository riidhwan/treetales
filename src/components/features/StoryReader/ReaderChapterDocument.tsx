import type { CSSProperties } from 'react'

import { NextChapterControls } from '@/components/features/StoryReader/NextChapterControls'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import type { Chapter, Story } from '@/services/types'

interface Props {
  readonly currentChapter: Chapter
  readonly nextChapters: Chapter[]
  readonly onCreateChildChapter: (parentChapterId: string) => void
  readonly onSelectNextChapter: (chapter: Chapter) => void
  readonly readerDocumentStyle: CSSProperties
  readonly story: Story
}

export function ReaderChapterDocument({
  currentChapter,
  nextChapters,
  onCreateChildChapter,
  onSelectNextChapter,
  readerDocumentStyle,
  story,
}: Props) {
  return (
    <article
      aria-label="Chapter document"
      className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-[52rem] border-border-subtle bg-surface-paper px-4 py-6 shadow-sm sm:min-h-[calc(100vh-10rem)] sm:border sm:px-8 sm:py-8 lg:px-8"
    >
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-action-primary">
          {story.title}
        </p>
        <div style={readerDocumentStyle}>
          <h1 className="mt-2 text-[1.875em] font-bold leading-tight sm:text-[2.25em]">
            {currentChapter.title}
          </h1>
        </div>
      </header>

      <MarkdownContent
        className="space-y-5 py-8"
        content={currentChapter.content}
        emptyFallback="This chapter is blank."
        style={readerDocumentStyle}
      />

      <footer className="border-t border-border-subtle pt-5">
        <NextChapterControls
          nextChapters={nextChapters}
          onCreateChildChapter={() => onCreateChildChapter(currentChapter.id)}
          onSelectChapter={onSelectNextChapter}
        />
      </footer>
    </article>
  )
}
