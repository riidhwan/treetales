import { Minus, Plus, RotateCcw, Type } from 'lucide-react'

import { READER_FONT_OPTIONS, type ReaderFontId } from '@/config'
import type { ReaderAppearance } from '@/hooks/useReaderAppearance'
import { IconButton } from '@/components/ui/IconButton'

const READER_APPEARANCE_PANEL_ID = 'reader-appearance-panel'

interface Props {
  readonly canDecreaseFontSize: boolean
  readonly canIncreaseFontSize: boolean
  readonly isPanelOpen: boolean
  readonly onDecreaseFontSize: () => void
  readonly onIncreaseFontSize: () => void
  readonly onOpenChange: (isOpen: boolean) => void
  readonly onResetReaderAppearance: () => void
  readonly onSelectReaderFont: (fontId: ReaderFontId) => void
  readonly readerAppearance: ReaderAppearance
}

export function ReaderAppearanceControl({
  canDecreaseFontSize,
  canIncreaseFontSize,
  isPanelOpen,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onOpenChange,
  onResetReaderAppearance,
  onSelectReaderFont,
  readerAppearance,
}: Props) {
  return (
    <div className="relative">
      <IconButton
        aria-controls={READER_APPEARANCE_PANEL_ID}
        aria-expanded={isPanelOpen}
        label="Reader Appearance"
        onClick={() => onOpenChange(!isPanelOpen)}
        size="sm"
      >
        <Type aria-hidden="true" size={16} />
      </IconButton>
      {isPanelOpen ? (
        <ReaderAppearancePanel
          canDecreaseFontSize={canDecreaseFontSize}
          canIncreaseFontSize={canIncreaseFontSize}
          onDecreaseFontSize={onDecreaseFontSize}
          onIncreaseFontSize={onIncreaseFontSize}
          onResetReaderAppearance={onResetReaderAppearance}
          onSelectReaderFont={onSelectReaderFont}
          panelId={READER_APPEARANCE_PANEL_ID}
          readerAppearance={readerAppearance}
        />
      ) : null}
    </div>
  )
}

interface ReaderAppearancePanelProps {
  readonly canDecreaseFontSize: boolean
  readonly canIncreaseFontSize: boolean
  readonly onDecreaseFontSize: () => void
  readonly onIncreaseFontSize: () => void
  readonly onResetReaderAppearance: () => void
  readonly onSelectReaderFont: (fontId: ReaderFontId) => void
  readonly panelId: string
  readonly readerAppearance: ReaderAppearance
}

function ReaderAppearancePanel({
  canDecreaseFontSize,
  canIncreaseFontSize,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onResetReaderAppearance,
  onSelectReaderFont,
  panelId,
  readerAppearance,
}: ReaderAppearancePanelProps) {
  return (
    <div
      className="fixed left-3 right-3 top-14 z-30 rounded-md border border-tt-line bg-tt-paper p-3 text-tt-ink shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[22rem]"
      id={panelId}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Reader Appearance</h2>
        <IconButton
          label="Reset Reader Appearance"
          onClick={onResetReaderAppearance}
          size="xs"
        >
          <RotateCcw aria-hidden="true" size={14} />
        </IconButton>
      </div>

      <section className="mt-3" aria-labelledby="reader-font-options-label">
        <h3
          className="text-xs font-semibold uppercase text-tt-muted"
          id="reader-font-options-label"
        >
          Font
        </h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {READER_FONT_OPTIONS.map((fontOption) => (
            <button
              aria-pressed={readerAppearance.fontId === fontOption.id}
              className="min-h-11 rounded-md border border-tt-line bg-tt-paper-deep/35 px-3 text-left text-sm transition hover:bg-tt-gold-soft/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-gold aria-pressed:border-tt-moss aria-pressed:bg-tt-moss-soft aria-pressed:text-tt-moss-dark"
              key={fontOption.id}
              onClick={() => onSelectReaderFont(fontOption.id)}
              style={{
                fontFamily: `"${fontOption.cssFamily}", Georgia, serif`,
              }}
              type="button"
            >
              {fontOption.displayName}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4" aria-labelledby="reader-font-size-label">
        <div className="flex items-center justify-between gap-3">
          <h3
            className="text-xs font-semibold uppercase text-tt-muted"
            id="reader-font-size-label"
          >
            Font Size
          </h3>
          <p className="min-w-12 text-right text-sm font-semibold text-tt-muted">
            {readerAppearance.fontSizePt} pt
          </p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <IconButton
            disabled={!canDecreaseFontSize}
            label="Decrease Font Size"
            onClick={onDecreaseFontSize}
            size="sm"
          >
            <Minus aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            disabled={!canIncreaseFontSize}
            label="Increase Font Size"
            onClick={onIncreaseFontSize}
            size="sm"
          >
            <Plus aria-hidden="true" size={16} />
          </IconButton>
        </div>
      </section>
    </div>
  )
}
