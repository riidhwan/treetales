export const styleGuideCopy = {
  alerts: {
    error: 'Error state uses restrained oxblood roles.',
    neutral: 'Neutral state preserves the current experience mode.',
    success: 'Success state uses the moss soft role.',
  },
  documentPreview: {
    body:
      'Markdown rendering belongs to Chapter Document content, while app chrome keeps the TreeTales interface typography.',
    content: [
      '# A Quiet Branch',
      '',
      'The path narrows, and the orchard keeps its own account.',
      '',
      '- Branch choices stay narrative before they become navigation.',
      '- Reader Appearance owns this document typography in product flows.',
    ],
    title: 'Document Preview',
  },
  form: {
    summary: 'Story summary',
    summaryValue:
      'A quiet branching tale about a family orchard that remembers every choice.',
    title: 'Story title',
    titleHelp: 'Field wraps the label, help text, and control rhythm.',
    titleValue: 'The Glass Orchard',
  },
  header: {
    body:
      'A dev-only check surface for the current local UI primitives, semantic tokens, and documented component boundaries. It is not linked from product navigation.',
    kicker: 'Maintainer surface',
    title: 'TreeTales Style Guide',
  },
  primitives: {
    body:
      'Shared UI belongs in `src/components/ui` only when it stays business-agnostic and enforces repeated behavior.',
    buttons: {
      delete: 'Delete',
      primary: 'Primary action',
      secondary: 'Secondary action',
    },
    iconButtons: {
      deleteStory: 'Delete story',
      editChapter: 'Edit chapter',
      readStory: 'Read story',
    },
    title: 'Local Primitives',
  },
  surfaces: {
    body:
      'Surface names are design contracts first. They do not imply a generic wrapper component.',
    items: [
      {
        description: 'Full-page parchment field for the app shell.',
        name: 'App Background',
      },
      {
        description: 'Unframed rhythm for Library and Management Mode.',
        name: 'Workbench',
      },
      {
        description: 'Chapter title and content surface owned by Document Mode.',
        name: 'Paper Document',
      },
      {
        description:
          'Repeated Story, Character, or form objects with a real boundary.',
        name: 'Bounded Object',
      },
      {
        description: 'Focused modal work with labelled task hierarchy.',
        name: 'Dialog Surface',
      },
      {
        description: 'Explicit destructive area with clear consequences.',
        name: 'Danger Surface',
      },
    ],
    title: 'Surface Boundaries',
  },
  title: 'Style guide',
  toolbarContext: 'Dev style guide - local primitives and semantic tokens',
  tokens: {
    body:
      'Generic primitives and settled feature surfaces should use these role-based aliases before reaching for raw palette tokens.',
    title: 'Semantic Tokens',
  },
} as const
