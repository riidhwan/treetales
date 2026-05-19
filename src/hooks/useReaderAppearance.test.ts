import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  READER_APPEARANCE_STORAGE_KEY,
  MAX_READER_FONT_SIZE_PT,
  MIN_READER_FONT_SIZE_PT,
} from '@/config'
import { useReaderAppearance } from '@/hooks/useReaderAppearance'

describe('useReaderAppearance', () => {
  afterEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('loads stored reader appearance and persists later changes', async () => {
    window.localStorage.setItem(
      READER_APPEARANCE_STORAGE_KEY,
      JSON.stringify({ fontId: 'nv-jost', fontSizePt: 18 }),
    )

    const { result } = renderHook(() => useReaderAppearance())

    await waitFor(() => {
      expect(result.current.readerAppearance).toEqual({
        fontId: 'nv-jost',
        fontSizePt: 18,
      })
    })
    expect(result.current.selectedFontFamily).toBe('NV Jost')

    act(() => {
      result.current.setReaderFont('nv-garamond')
      result.current.increaseFontSize()
    })

    await waitFor(() => {
      expect(window.localStorage.getItem(READER_APPEARANCE_STORAGE_KEY)).toBe(
        JSON.stringify({ fontId: 'nv-garamond', fontSizePt: 19 }),
      )
    })
  })

  it('ignores invalid stored reader appearance values', async () => {
    window.localStorage.setItem(
      READER_APPEARANCE_STORAGE_KEY,
      JSON.stringify({ fontId: 'unknown-font', fontSizePt: 'large' }),
    )

    const { result } = renderHook(() => useReaderAppearance())

    await waitFor(() => {
      expect(result.current.readerAppearance).toEqual({
        fontId: 'readerly',
        fontSizePt: 14,
      })
    })
  })

  it('ignores stored values that are not reader appearance records', async () => {
    window.localStorage.setItem(READER_APPEARANCE_STORAGE_KEY, 'null')

    const { result } = renderHook(() => useReaderAppearance())

    await waitFor(() => {
      expect(result.current.readerAppearance).toEqual({
        fontId: 'readerly',
        fontSizePt: 14,
      })
    })
  })

  it('ignores stored font ids that are not strings', async () => {
    window.localStorage.setItem(
      READER_APPEARANCE_STORAGE_KEY,
      JSON.stringify({ fontId: 42, fontSizePt: 16 }),
    )

    const { result } = renderHook(() => useReaderAppearance())

    await waitFor(() => {
      expect(result.current.readerAppearance).toEqual({
        fontId: 'readerly',
        fontSizePt: 14,
      })
    })
  })

  it('clamps stored and adjusted font sizes to the supported range', async () => {
    window.localStorage.setItem(
      READER_APPEARANCE_STORAGE_KEY,
      JSON.stringify({ fontId: 'readerly', fontSizePt: 99 }),
    )

    const { result } = renderHook(() => useReaderAppearance())

    await waitFor(() => {
      expect(result.current.readerAppearance.fontSizePt).toBe(
        MAX_READER_FONT_SIZE_PT,
      )
    })
    expect(result.current.canIncreaseFontSize).toBe(false)

    act(() => {
      result.current.increaseFontSize()
    })

    expect(result.current.readerAppearance.fontSizePt).toBe(
      MAX_READER_FONT_SIZE_PT,
    )

    act(() => {
      result.current.resetReaderAppearance()
    })

    await waitFor(() => {
      expect(result.current.readerAppearance.fontSizePt).toBe(14)
    })

    for (let step = 0; step < 10; step += 1) {
      act(() => {
        result.current.decreaseFontSize()
      })
    }

    expect(result.current.readerAppearance.fontSizePt).toBe(
      MIN_READER_FONT_SIZE_PT,
    )
    expect(result.current.canDecreaseFontSize).toBe(false)
  })

  it('falls back to defaults when storage cannot be read or written', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage full')
    })

    const { result } = renderHook(() => useReaderAppearance())

    await waitFor(() => {
      expect(result.current.readerAppearance).toEqual({
        fontId: 'readerly',
        fontSizePt: 14,
      })
    })

    act(() => {
      result.current.setReaderFont('cartisse')
      result.current.increaseFontSize()
    })

    expect(result.current.readerAppearance).toEqual({
      fontId: 'cartisse',
      fontSizePt: 15,
    })
  })
})
