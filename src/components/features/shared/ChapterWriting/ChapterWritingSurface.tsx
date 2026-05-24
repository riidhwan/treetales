import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { ReactNode, SyntheticEvent } from 'react'
import { Eye, Pencil } from 'lucide-react'

import { ChapterDocumentShell } from '@/components/domain/ChapterDocumentShell'
import { ModeButton } from '@/components/features/shared/ChapterWriting/ModeButton'
import { Button } from '@/components/ui/Button'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { TextArea } from '@/components/ui/TextArea'
import { Toolbar, ToolbarContext } from '@/components/ui/Toolbar'
import { chapterWritingCopy, commonCopy } from '@/copy'

export type ChapterWritingMode = 'preview' | 'write'

interface Props {
  readonly canSubmit: boolean
  readonly content: string
  readonly contentPlaceholder: string
  readonly isSubmitting: boolean
  readonly mode: ChapterWritingMode
  readonly navigationActions: ReactNode
  readonly onContentChange: (content: string) => void
  readonly onModeChange: (mode: ChapterWritingMode) => void
  readonly onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void
  readonly onTitleBlur?: () => void
  readonly onTitleChange: (title: string) => void
  readonly primaryActionIcon: ReactNode
  readonly primaryActionLabel: string
  readonly readerFontFamily: string
  readonly readerFontSizePt: number
  readonly secondaryActions?: ReactNode
  readonly submittingActionLabel: string
  readonly title: string
  readonly titleError?: string
  readonly titlePlaceholder: string
  readonly toolbarContext: string
}

export function ChapterWritingSurface({
  canSubmit,
  content,
  contentPlaceholder,
  isSubmitting,
  mode,
  navigationActions,
  onContentChange,
  onModeChange,
  onSubmit,
  onTitleBlur,
  onTitleChange,
  primaryActionIcon,
  primaryActionLabel,
  readerFontFamily,
  readerFontSizePt,
  secondaryActions,
  submittingActionLabel,
  title,
  titleError,
  titlePlaceholder,
  toolbarContext,
}: Props) {
  const wordCount = countMarkdownWords(content)
  const contentTextAreaRef = useRef<HTMLTextAreaElement>(null)
  const readerDocumentStyle: CSSProperties = {
    fontFamily: `"${readerFontFamily}", Georgia, serif`,
    fontSize: `${readerFontSizePt}pt`,
  }

  useEffect(() => {
    const textArea = contentTextAreaRef.current

    if (!textArea) {
      return
    }

    const previousScrollY = window.scrollY
    const previousHeight = textArea.offsetHeight

    textArea.style.height = 'auto'

    const nextHeight = textArea.scrollHeight

    textArea.style.height = `${nextHeight}px`

    if (nextHeight >= previousHeight && window.scrollY < previousScrollY) {
      window.scrollTo(window.scrollX, previousScrollY)
    }
  }, [content, mode, readerFontFamily, readerFontSizePt])

  return (
    <form className="min-h-screen pb-24 sm:pb-20" onSubmit={onSubmit}>
      <Toolbar
        context={<ToolbarContext>{toolbarContext}</ToolbarContext>}
        label={chapterWritingCopy.surface.toolbarLabel}
        leading={navigationActions}
        primary={
          <Button
            disabled={!canSubmit}
            size="sm"
            type="submit"
            variant="primary"
          >
            {primaryActionIcon}
            {isSubmitting ? submittingActionLabel : primaryActionLabel}
          </Button>
        }
        trailing={secondaryActions}
      />

      <section className="mx-auto w-full max-w-5xl px-0 py-0 sm:px-6 sm:py-6 lg:py-10">
        <ChapterDocumentShell
          aria-label={chapterWritingCopy.surface.documentLabel}
          className="px-2 py-5"
        >
          <label className="block px-2 sm:px-0" style={readerDocumentStyle}>
            <span className="sr-only">{commonCopy.labels.title}</span>
            <input
              aria-invalid={Boolean(titleError)}
              className="w-full border-0 bg-transparent p-0 text-[1.875em] font-bold leading-tight text-text-primary outline-none placeholder:text-text-muted/55 focus:ring-0 sm:text-[2.25em]"
              name="title"
              onBlur={onTitleBlur}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder={titlePlaceholder}
              value={title}
            />
          </label>
          {titleError ? (
            <p className="mt-2 px-2 text-sm font-medium text-action-destructive sm:px-0">
              {titleError}
            </p>
          ) : null}

          <div className="mt-5 sm:mt-6">
            {mode === 'preview' ? (
              <section
                aria-label={chapterWritingCopy.surface.contentPreviewLabel}
                className="min-h-[calc(100vh-18rem)] px-2 sm:px-0"
              >
                <MarkdownContent
                  className="space-y-5"
                  content={content}
                  emptyFallback={commonCopy.messages.nothingToPreview}
                  style={readerDocumentStyle}
                />
              </section>
            ) : (
              <label className="block">
                <span className="sr-only">{commonCopy.labels.content}</span>
                <TextArea
                  ref={contentTextAreaRef}
                  className="min-h-[calc(100vh-15rem)] w-full resize-none overflow-hidden border-0 p-0 leading-8 shadow-none outline-none focus:border-transparent! focus:ring-0! sm:min-h-[calc(100vh-18rem)]"
                  name="content"
                  onChange={(event) => onContentChange(event.target.value)}
                  placeholder={contentPlaceholder}
                  style={readerDocumentStyle}
                  value={content}
                />
              </label>
            )}
          </div>
        </ChapterDocumentShell>
      </section>

      <div
        aria-label={chapterWritingCopy.surface.editorModeLabel}
        className="fixed bottom-14 left-1/2 z-30 flex -translate-x-1/2 rounded-md border border-border-subtle bg-surface-paper p-1 shadow-lg sm:bottom-4"
        role="group"
      >
        <ModeButton
          isSelected={mode === 'write'}
          label={commonCopy.actions.write}
          onClick={() => onModeChange('write')}
        >
          <Pencil aria-hidden="true" size={15} />
        </ModeButton>
        <ModeButton
          isSelected={mode === 'preview'}
          label={commonCopy.actions.preview}
          onClick={() => onModeChange('preview')}
        >
          <Eye aria-hidden="true" size={15} />
        </ModeButton>
      </div>

      <p className="fixed bottom-4 right-3 z-30 rounded-md border border-border-subtle bg-surface-paper/95 px-2 py-1 text-xs font-medium text-text-muted shadow-sm sm:right-5">
        {chapterWritingCopy.surface.wordCount(wordCount)}
      </p>
    </form>
  )
}

export function countMarkdownWords(markdown: string) {
  const prose = replaceMarkdownLinksWithLabels(markdown)
    .replace(/<https?:\/\/[^>\s]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[\s>*-]+/gm, '')
    .replace(/[*_~#>`()]/g, ' ')
    .replaceAll('[', ' ')
    .replaceAll(']', ' ')

  return prose
    .split(/[^A-Za-z0-9'-]+/)
    .filter((word) => /[A-Za-z0-9]/.test(word)).length
}

function replaceMarkdownLinksWithLabels(markdown: string) {
  let prose = ''
  let index = 0

  while (index < markdown.length) {
    const labelStart = markdown.indexOf('[', index)

    if (labelStart === -1) {
      prose += markdown.slice(index)
      break
    }

    const labelEnd = markdown.indexOf(']', labelStart + 1)
    const targetStart = labelEnd === -1 ? -1 : labelEnd + 1

    if (labelEnd === -1 || markdown.at(targetStart) !== '(') {
      prose += markdown.slice(index, labelStart + 1)
      index = labelStart + 1
      continue
    }

    const targetEnd = markdown.indexOf(')', targetStart + 1)

    if (targetEnd === -1) {
      prose += markdown.slice(index, labelStart + 1)
      index = labelStart + 1
      continue
    }

    const isImage = labelStart > 0 && markdown.at(labelStart - 1) === '!'
    prose += markdown.slice(index, isImage ? labelStart - 1 : labelStart)
    prose += markdown.slice(labelStart + 1, labelEnd)
    index = targetEnd + 1
  }

  return prose
}
