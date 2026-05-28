export const storyDetailCopy = {
  actions: {
    addCharacter: 'Add Character',
    addIllustration: 'Add Character Illustration',
    deleteCharacter: 'Delete Character',
    deleteIllustration: 'Delete Character Illustration',
    deleteStory: 'Delete Story',
    discardChanges: 'Discard Changes',
    importIllustration: 'Import Illustration',
    read: 'Read',
    saveStory: 'Save Story',
    savingCharacter: 'Saving character...',
    uploadingIllustration: 'Importing...',
    untitledStory: 'Untitled story',
    viewCharacter: (characterName: string) => `View ${characterName}`,
  },
  character: {
    addProperty: 'Add Property',
    closeDialog: 'Close character dialog',
    customProperties: 'Custom properties',
    deleteDialog: {
      message: (characterName: string) =>
        `Delete "${characterName}"? This cannot be undone.`,
      title: 'Delete Character?',
    },
    details: {
      gender: 'Gender',
      name: 'Name',
    },
    discardDialog: {
      message: 'Discard unsaved character changes?',
      title: 'Discard Character Changes?',
    },
    empty: {
      body: 'Add character cards for the people in this story.',
      title: 'No characters yet',
    },
    eyebrow: 'Character',
    gender: {
      female: 'Female',
      male: 'Male',
    },
    heading: 'Characters',
    labels: {
      gender: 'Gender',
      key: 'Key',
      name: 'Name',
      value: 'Value',
    },
    loading: 'Loading characters...',
    missing: 'Character could not be found.',
    moveDown: (propertyKey: string) => `Move ${propertyKey || 'property'} down`,
    moveUp: (propertyKey: string) => `Move ${propertyKey || 'property'} up`,
    noCustomProperties: 'No custom properties yet.',
    propertyCountMore: (count: number) => `+${count} more`,
    propertyFallback: 'property',
    placeholders: {
      key: 'age',
      name: 'Mira',
      value: '32',
    },
  },
  characterDetail: {
    backToStory: 'Story Detail',
    deleteWarning:
      'Deleting this Character permanently removes it from this Story. This cannot be undone.',
    illustrations: {
      deleteDialog: {
        message:
          'Delete this Character Illustration? This removes the stored image from this browser.',
        title: 'Delete Character Illustration?',
      },
      empty: 'No Character Illustrations yet.',
      fileHelp: 'JPEG, PNG, or WebP. Normalized import is recommended.',
      fileLabel: 'Image file',
      filePlaceholder: 'Choose an image',
      heading: 'Character Illustrations',
      label: 'Label',
      labelPlaceholder: 'Scene reference',
      loading: 'Loading Character Illustrations...',
      modeLabel: 'Preserve original quality',
      moveDown: (label: string) =>
        `Move ${label || 'Character Illustration'} down`,
      moveUp: (label: string) =>
        `Move ${label || 'Character Illustration'} up`,
      normalizedNote:
        'Normalized imports resize large images and strip source metadata.',
      originalNote:
        'Original quality stores the uploaded file exactly as-is.',
      saveLabel: (label: string) =>
        `Save label for ${label || 'Character Illustration'}`,
      unnamed: 'Unlabelled Character Illustration',
    },
    loading: 'Loading character...',
    navigationLabel: 'Character detail navigation',
  },
  deleteDialog: {
    message: (storyTitle: string) =>
      `Delete "${storyTitle}"? This cannot be undone.`,
    title: 'Delete Story?',
  },
  maintenance: {
    body:
      'Deleting this Story will permanently remove all Chapters and Characters. This cannot be undone.',
    title: 'Danger Zone',
  },
  navigation: {
    label: 'Story detail navigation',
  },
  storySummary: {
    add: 'Add',
    empty: 'No description yet - tap to add one.',
    title: 'Story summary',
  },
} as const
