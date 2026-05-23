import { useId, useState } from 'react'
import { Copy, Sparkles, X } from 'lucide-react'

import {
  type PromptBuilderTemplateKind,
  buildPromptBuilderPrompt,
} from '@/components/features/promptBuilderTemplates'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { TextArea } from '@/components/ui/TextArea'

interface ParentChapterContext {
  readonly content: string
  readonly title: string
}

interface Props {
  readonly chapterTitle: string
  readonly draftContent: string
  readonly isPromptBuilderDisabled?: boolean
  readonly parentChapter?: ParentChapterContext
  readonly promptBuilderDisabledReason?: string
  readonly storyTitle?: string
  readonly templateKind: PromptBuilderTemplateKind
}

export function ChapterPromptBuilderControl({
  chapterTitle,
  draftContent,
  isPromptBuilderDisabled = false,
  parentChapter,
  promptBuilderDisabledReason = 'Prompt Builder unavailable',
  storyTitle,
  templateKind,
}: Props) {
  const dialogTitleId = useId()
  const menuId = useId()
  const [copyStatus, setCopyStatus] = useState<string | undefined>()
  const [fallbackPrompt, setFallbackPrompt] = useState<string | undefined>()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPromptBuilderOpen, setIsPromptBuilderOpen] = useState(false)
  const [roughPlot, setRoughPlot] = useState('')

  const prompt = buildPromptBuilderPrompt(templateKind, {
    chapterTitle: chapterTitle.trim() || 'Untitled chapter',
    draftContent,
    parentChapterContent: parentChapter?.content,
    parentChapterTitle: parentChapter?.title,
    roughPlot,
    storyTitle: storyTitle?.trim() || 'Untitled story',
  })

  async function copyPrompt() {
    setCopyStatus(undefined)
    setFallbackPrompt(undefined)

    try {
      await navigator.clipboard.writeText(prompt)
      setCopyStatus('Prompt copied.')
    } catch {
      setFallbackPrompt(prompt)
      setCopyStatus('Could not copy prompt.')
    }
  }

  function openPromptBuilder() {
    if (isPromptBuilderDisabled) {
      return
    }

    setCopyStatus(undefined)
    setFallbackPrompt(undefined)
    setIsMenuOpen(false)
    setIsPromptBuilderOpen(true)
  }

  return (
    <div className="relative">
      <Button
        aria-controls={menuId}
        aria-expanded={isMenuOpen}
        aria-label="Writing Assist"
        className="px-3"
        onClick={() => setIsMenuOpen((current) => !current)}
        size="sm"
        title="Writing Assist"
      >
        <Sparkles aria-hidden="true" size={16} />
      </Button>

      {isMenuOpen ? (
        <div
          className="fixed left-3 right-3 top-14 z-30 rounded-md border border-tt-line bg-tt-paper p-2 text-tt-ink shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-64"
          id={menuId}
          role="menu"
        >
          <button
            className="flex min-h-10 w-full items-center rounded px-3 text-left text-sm font-semibold text-tt-ink transition hover:bg-tt-gold-soft/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-gold disabled:cursor-not-allowed disabled:text-tt-muted/55 disabled:hover:bg-transparent"
            disabled={isPromptBuilderDisabled}
            onClick={openPromptBuilder}
            title={
              isPromptBuilderDisabled
                ? promptBuilderDisabledReason
                : 'Prompt Builder'
            }
            type="button"
          >
            Prompt Builder
          </button>
          <button
            className="mt-1 flex min-h-10 w-full items-center justify-between gap-3 rounded px-3 text-left text-sm font-semibold text-tt-muted/60"
            disabled
            title="Coming later"
            type="button"
          >
            <span>Write with LLM</span>
            <span className="text-xs font-medium">Coming later</span>
          </button>
        </div>
      ) : null}

      {isPromptBuilderOpen ? (
        <div className="fixed inset-0 z-40 bg-tt-ink/35 px-3 py-4 sm:px-6">
          <section
            aria-labelledby={dialogTitleId}
            aria-modal="true"
            className="mx-auto flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col rounded-md border border-tt-line bg-tt-paper shadow-xl"
            role="dialog"
          >
            <header className="flex items-center justify-between gap-3 border-b border-tt-line px-4 py-3">
              <h2
                className="text-base font-semibold text-tt-ink"
                id={dialogTitleId}
              >
                Prompt Builder
              </h2>
              <IconButton
                label="Close Prompt Builder"
                onClick={() => setIsPromptBuilderOpen(false)}
                size="xs"
              >
                <X aria-hidden="true" size={15} />
              </IconButton>
            </header>

            <div className="grid gap-4 overflow-y-auto p-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-tt-ink">
                  Rough plot
                </span>
                <TextArea
                  className="min-h-44"
                  name="roughPlot"
                  onChange={(event) => setRoughPlot(event.target.value)}
                  placeholder="Sketch the chapter beats, choices, tone, or ending you want..."
                  value={roughPlot}
                />
              </label>

              {fallbackPrompt ? (
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-tt-ink">
                    Generated prompt
                  </span>
                  <TextArea
                    className="min-h-44 font-mono text-sm"
                    name="generatedPrompt"
                    readOnly
                    value={fallbackPrompt}
                  />
                </label>
              ) : null}

              {copyStatus ? (
                <p
                  className="text-sm font-medium text-tt-muted"
                  role={fallbackPrompt ? 'alert' : 'status'}
                >
                  {copyStatus}
                </p>
              ) : null}
            </div>

            <footer className="flex justify-end border-t border-tt-line px-4 py-3">
              <Button onClick={() => void copyPrompt()} variant="primary">
                <Copy aria-hidden="true" size={16} />
                Copy prompt
              </Button>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  )
}
