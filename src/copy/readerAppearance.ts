export const readerAppearanceCopy = {
  actions: {
    decreaseFontSize: 'Decrease Font Size',
    increaseFontSize: 'Increase Font Size',
    reset: 'Reset Reader Appearance',
  },
  labels: {
    font: 'Font',
    fontSize: 'Font Size',
    trigger: 'Reader Appearance',
  },
  values: {
    fontSize: (fontSizePt: number) => `${fontSizePt} pt`,
  },
} as const
