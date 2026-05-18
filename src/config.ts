export type ReaderFontId =
  | 'cartisse'
  | 'nv-bitter'
  | 'nv-charis'
  | 'nv-garamond'
  | 'nv-jost'
  | 'nv-legible-next'
  | 'nv-palatium'
  | 'readerly'
  | 'sourcerer'

export interface ReaderFontOption {
  readonly cssFamily: string
  readonly displayName: string
  readonly id: ReaderFontId
}

export const READER_FONT_OPTIONS: readonly ReaderFontOption[] = [
  {
    cssFamily: 'Readerly',
    displayName: 'Readerly',
    id: 'readerly',
  },
  {
    cssFamily: 'Sourcerer',
    displayName: 'Sourcerer',
    id: 'sourcerer',
  },
  {
    cssFamily: 'Cartisse',
    displayName: 'Cartisse',
    id: 'cartisse',
  },
  {
    cssFamily: 'NV Charis',
    displayName: 'NV Charis',
    id: 'nv-charis',
  },
  {
    cssFamily: 'NV Garamond',
    displayName: 'NV Garamond',
    id: 'nv-garamond',
  },
  {
    cssFamily: 'NV Jost',
    displayName: 'NV Jost',
    id: 'nv-jost',
  },
  {
    cssFamily: 'NV Bitter',
    displayName: 'NV Bitter',
    id: 'nv-bitter',
  },
  {
    cssFamily: 'NV Legible Next',
    displayName: 'NV Legible Next',
    id: 'nv-legible-next',
  },
  {
    cssFamily: 'NV Palatium',
    displayName: 'NV Palatium',
    id: 'nv-palatium',
  },
]

export const DEFAULT_READER_FONT_ID: ReaderFontId = 'readerly'
export const DEFAULT_READER_FONT_SIZE_PT = 14
export const MAX_READER_FONT_SIZE_PT = 24
export const MIN_READER_FONT_SIZE_PT = 10
export const READER_FONT_SIZE_STEP_PT = 1
export const READER_APPEARANCE_STORAGE_KEY = 'treetales.readerAppearance'
