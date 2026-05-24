export const mobileInstallChoiceCopy = {
  actions: {
    continueToMobileSite: 'Continue to Mobile Site',
    installApp: 'Install App',
  },
  body:
    'Add TreeTales to your home screen for a focused app experience, or continue in your mobile browser.',
  status: {
    dismissed:
      'Installation was dismissed. You can try again or continue to the mobile site.',
    error:
      'Installation could not start. Use your browser menu to add TreeTales to your home screen.',
    guidance:
      'Open your browser menu and choose Add to Home Screen or Install App.',
    pending:
      'TreeTales is checking whether your browser can show its install prompt.',
  },
} as const
