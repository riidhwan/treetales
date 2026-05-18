import { useEffect, useMemo, useState } from 'react'

import {
  DEFAULT_READER_FONT_ID,
  DEFAULT_READER_FONT_SIZE_PT,
  MAX_READER_FONT_SIZE_PT,
  MIN_READER_FONT_SIZE_PT,
  READER_APPEARANCE_STORAGE_KEY,
  READER_FONT_OPTIONS,
  READER_FONT_SIZE_STEP_PT,
  type ReaderFontId,
} from '@/config'

export interface ReaderAppearance {
  readonly fontId: ReaderFontId
  readonly fontSizePt: number
}

export interface ReaderAppearanceControls {
  readonly canDecreaseFontSize: boolean
  readonly canIncreaseFontSize: boolean
  readonly decreaseFontSize: () => void
  readonly increaseFontSize: () => void
  readonly readerAppearance: ReaderAppearance
  readonly resetReaderAppearance: () => void
  readonly selectedFontFamily: string
  readonly setReaderFont: (fontId: ReaderFontId) => void
}

const DEFAULT_READER_APPEARANCE: ReaderAppearance = {
  fontId: DEFAULT_READER_FONT_ID,
  fontSizePt: DEFAULT_READER_FONT_SIZE_PT,
}

export function useReaderAppearance(): ReaderAppearanceControls {
  const [readerAppearance, setReaderAppearance] = useState<ReaderAppearance>(
    DEFAULT_READER_APPEARANCE,
  )

  const selectedFontFamily = useMemo(
    () =>
      READER_FONT_OPTIONS.find(
        (fontOption) => fontOption.id === readerAppearance.fontId,
      )?.cssFamily ?? READER_FONT_OPTIONS[0].cssFamily,
    [readerAppearance.fontId],
  )

  const canDecreaseFontSize =
    readerAppearance.fontSizePt > MIN_READER_FONT_SIZE_PT
  const canIncreaseFontSize =
    readerAppearance.fontSizePt < MAX_READER_FONT_SIZE_PT

  useEffect(() => {
    const storedReaderAppearance = readStoredReaderAppearance()

    if (storedReaderAppearance) {
      setReaderAppearance(storedReaderAppearance)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(
      READER_APPEARANCE_STORAGE_KEY,
      JSON.stringify(readerAppearance),
    )
  }, [readerAppearance])

  function setReaderFont(fontId: ReaderFontId) {
    setReaderAppearance((currentAppearance) => ({
      ...currentAppearance,
      fontId,
    }))
  }

  function decreaseFontSize() {
    setReaderAppearance((currentAppearance) => ({
      ...currentAppearance,
      fontSizePt: clampFontSize(
        currentAppearance.fontSizePt - READER_FONT_SIZE_STEP_PT,
      ),
    }))
  }

  function increaseFontSize() {
    setReaderAppearance((currentAppearance) => ({
      ...currentAppearance,
      fontSizePt: clampFontSize(
        currentAppearance.fontSizePt + READER_FONT_SIZE_STEP_PT,
      ),
    }))
  }

  function resetReaderAppearance() {
    setReaderAppearance(DEFAULT_READER_APPEARANCE)
  }

  return {
    canDecreaseFontSize,
    canIncreaseFontSize,
    decreaseFontSize,
    increaseFontSize,
    readerAppearance,
    resetReaderAppearance,
    selectedFontFamily,
    setReaderFont,
  }
}

function readStoredReaderAppearance(): ReaderAppearance | undefined {
  const storedValue = window.localStorage.getItem(
    READER_APPEARANCE_STORAGE_KEY,
  )

  if (!storedValue) {
    return undefined
  }

  try {
    return parseReaderAppearance(JSON.parse(storedValue))
  } catch {
    return undefined
  }
}

function parseReaderAppearance(value: unknown): ReaderAppearance | undefined {
  if (!isReaderAppearanceRecord(value)) {
    return undefined
  }

  const fontId = parseReaderFontId(value.fontId)
  const fontSizePt = parseFontSize(value.fontSizePt)

  if (!fontId || fontSizePt === undefined) {
    return undefined
  }

  return {
    fontId,
    fontSizePt,
  }
}

function isReaderAppearanceRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseReaderFontId(value: unknown): ReaderFontId | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  return READER_FONT_OPTIONS.some((fontOption) => fontOption.id === value)
    ? (value as ReaderFontId)
    : undefined
}

function parseFontSize(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return undefined
  }

  return clampFontSize(value)
}

function clampFontSize(fontSizePt: number): number {
  return Math.min(
    MAX_READER_FONT_SIZE_PT,
    Math.max(MIN_READER_FONT_SIZE_PT, fontSizePt),
  )
}
