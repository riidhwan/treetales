import type { CSSProperties } from 'react'

import { ChapterDocumentShell } from '@/components/domain/ChapterDocumentShell'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { storyReaderCopy } from '@/copy'
import type { Chapter, Story } from '@/services/types'

import { NextChapterControls } from './ReaderChapterDocument/NextChapterControls'

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
    <ChapterDocumentShell
      aria-label={storyReaderCopy.document.label}
      as="article"
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
        emptyFallback={storyReaderCopy.document.blank}
        style={readerDocumentStyle}
      />

      <footer className="border-t border-border-subtle pt-5">
        <NextChapterControls
          nextChapters={nextChapters}
          onCreateChildChapter={() => onCreateChildChapter(currentChapter.id)}
          onSelectChapter={onSelectNextChapter}
        />
      </footer>
    </ChapterDocumentShell>
  )
}
