export const promptBuilderCopy = {
  actions: {
    copyPrompt: 'Copy prompt',
    trigger: 'Writing Assist',
  },
  defaultDisabledReason: 'Prompt Builder unavailable',
  fallbackValues: {
    storyTitle: 'Untitled story',
  },
  fields: {
    generatedPrompt: 'Generated prompt',
    roughPlot: 'Rough plot',
    roughPlotPlaceholder:
      'Sketch the chapter beats, choices, tone, or ending you want...',
  },
  menu: {
    comingLater: 'Coming later',
    promptBuilder: 'Prompt Builder',
    writeWithLlm: 'Write with LLM',
  },
  status: {
    copied: 'Prompt copied.',
    copyFailed: 'Could not copy prompt.',
  },
  templates: {
    branch: `You are a writer of a "Choose Your Own Adventure" book. The chapter you write will treat the reader as the main character (e.g instead of writing "I had a dream", you should write "You had a dream"). You will write a story based on the \`plot\` described below. Write in markdown codeblock.

<previous_story note="this is just a reference of what happened before the plot">
{{parentChapterContent}}
</previous_story>

<plot>
{{roughPlot}}
</plot>`,
    intro: `You are a writer of a "Choose Your Own Adventure" book. The chapter you write will treat the reader as the main character (e.g instead of writing "I had a dream", you should write "You had a dream"). You will write a story based on the \`plot\` described below. Write in markdown codeblock.

<plot>
{{roughPlot}}
</plot>`,
  },
  title: 'Prompt Builder',
  titleCloseLabel: 'Close Prompt Builder',
} as const
