export const storyDashboardCopy = {
  actions: {
    beginNewStory: 'Begin a new story',
    createStory: 'Create Story',
    newStory: 'New Story',
    openStarterStory: (starterTitle: string) => `Start ${starterTitle}`,
    openStory: (storyTitle: string) => `Open ${storyTitle}`,
  },
  empty: {
    body: 'Create a blank Story when you are ready to branch out from the starters.',
    title: 'No Saved Stories yet',
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
  starterSection: {
    heading: 'Built-in Example Stories',
    loadingAction: 'Opening...',
    primaryIntro:
      'Choose a starter to create an editable Example Story Copy in your library.',
    secondaryIntro:
      'Start another editable copy from a built-in branching Story.',
    sourcePrefix: 'Source',
    unavailable: 'That Built-in Example Story is unavailable.',
  },
} as const
