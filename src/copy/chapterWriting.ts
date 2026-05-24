export const chapterWritingCopy = {
  actions: {
    discardChanges: 'Discard Changes',
    parentChapter: 'Parent Chapter',
    storyReader: 'Story Reader',
  },
  creation: {
    actionsLabel: 'Chapter creation actions',
    loadingParentChapter: 'Loading parent chapter...',
    missingParentChapter: {
      body: 'This chapter is not part of the selected story.',
      title: 'Parent chapter not found',
    },
    navigationWarning: 'Discard this chapter draft?',
  },
  editor: {
    actionsLabel: 'Chapter editor actions',
    loadingChapter: 'Loading chapter...',
    missingChapter: {
      body: 'This chapter is not part of the selected story.',
      title: 'Chapter not found',
    },
    navigationWarning: 'Discard unsaved chapter changes?',
  },
  existingIntroChapter: {
    body: 'This story already has an intro chapter.',
    fallbackTitle: 'Intro chapter exists',
  },
  fields: {
    contentPlaceholder: 'Write this chapter in markdown...',
    titleRequired: 'Chapter title is required.',
    untitledChapter: 'Untitled chapter',
  },
  promptBuilder: {
    parentChapterUnavailable: 'Parent Chapter unavailable',
  },
  status: {
    saved: 'Chapter saved.',
  },
  surface: {
    contentPreviewLabel: 'Content preview',
    documentLabel: 'Chapter document',
    editorModeLabel: 'Editor mode',
    toolbarLabel: 'Chapter writing actions',
    wordCount: (wordCount: number) =>
      `${wordCount} ${wordCount === 1 ? 'word' : 'words'}`,
  },
  toolbarContext: {
    branchFrom: (storyTitle: string, parentChapterTitle: string) =>
      `${storyTitle} - Branch from ${parentChapterTitle}`,
    fallbackParentChapter: 'selected chapter',
    introChapter: (storyTitle: string) => `${storyTitle} - Intro Chapter`,
  },
  warningDialog: {
    title: 'Discard Chapter Changes?',
  },
} as const
