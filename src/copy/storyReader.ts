export const storyReaderCopy = {
  actions: {
    addBranch: 'Add Branch',
    addIntroChapter: 'Add Intro Chapter',
    editChapter: 'Edit Chapter',
    parentChapter: 'Parent Chapter',
    storyDetails: 'Story Details',
  },
  branch: {
    heading: 'What happens next?',
    terminal: 'The End',
  },
  document: {
    blank: 'This chapter is blank.',
    label: 'Chapter document',
  },
  missingChapter: {
    body: 'This chapter is not part of the selected story.',
    title: 'Chapter not found',
  },
  noIntroChapter: {
    body: 'Add an Intro Chapter to give this Story a place to begin.',
    title: 'No Intro Chapter yet',
  },
  toolbar: {
    label: 'Reader actions',
  },
} as const
