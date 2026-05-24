export const DASHBOARD_DISPLAY_FONT = '"NV Garamond", Georgia, serif'
export const DASHBOARD_ITALIC_FONT =
  '"NV Garamond", "NV Palatium", Georgia, serif'

const STORY_ROW_ACCENT_CLASSES = [
  'bg-tt-moss',
  'bg-tt-gold',
  'bg-tt-oxblood',
] as const

export function getStoryRowAccentClass(index: number) {
  return STORY_ROW_ACCENT_CLASSES[index % STORY_ROW_ACCENT_CLASSES.length]
}
