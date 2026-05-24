export const storyDashboardCopy = {
  actions: {
    addExampleStory: 'Add Example Story',
    beginNewStory: 'Begin a new story',
    createStory: 'Create Story',
    newStory: 'New Story',
    openStory: (storyTitle: string) => `Open ${storyTitle}`,
  },
  empty: {
    body: 'Start with an example or open a blank page for a branching tale of your own.',
    title: 'No stories yet',
  },
  form: {
    label: 'New story',
    placeholders: {
      description: 'A short premise for the story',
      title: 'Forest Gate',
    },
  },
  header: {
    ariaTitle: 'Your stories',
    kicker: 'Your Library',
    subtitle: 'Every branch, every choice, all your worlds right here.',
    titleFirstLine: 'Your',
    titleSecondLine: 'stories',
  },
  loading: 'Loading stories...',
  newStoryCta: {
    subtitle: 'Branch it, shape it, make it yours',
    title: 'Begin a new story',
  },
  savedStoriesHeading: 'Saved stories',
} as const
