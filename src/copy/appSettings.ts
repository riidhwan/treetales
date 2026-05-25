export const appSettingsCopy = {
  actions: {
    backToLibrary: 'Back to Library',
    cancelReplace: 'Cancel',
    clearGeminiApiKey: 'Clear key',
    open: 'App Settings',
    replaceGeminiApiKey: 'Replace',
    saveGeminiApiKey: 'Save key',
  },
  categories: {
    writingAssist: {
      description: 'Set up writing-related assistance for this browser.',
      title: 'Writing Assist',
    },
  },
  errors: {
    geminiApiKeyRequired: 'Enter a Gemini API key before saving.',
    loadFailure: 'Could not load App Settings.',
    saveFailure: 'Could not save the Gemini API key.',
    clearFailure: 'Could not clear the Gemini API key.',
  },
  geminiApiKey: {
    emptyDescription:
      'Save a Gemini API key now so future Writing Assist features can use it.',
    fieldLabel: 'Gemini API key',
    fieldPlaceholder: 'Paste Gemini API key',
    savedDescription:
      'A Gemini API key is saved for this browser. TreeTales does not show or reveal saved key values.',
    securityNote:
      'Stored only in this browser; someone with access to this browser profile may be able to inspect it.',
    title: 'Gemini API key',
  },
  heading: {
    subtitle: 'Browser-local preferences and credentials for TreeTales.',
    title: 'App Settings',
  },
  loading: 'Loading App Settings...',
  status: {
    cleared: 'Gemini API key cleared.',
    saved: 'Gemini API key saved.',
  },
} as const
