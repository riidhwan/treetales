export type PromptBuilderTemplateKind = 'branch' | 'intro'

interface PromptBuilderValues {
  readonly chapterTitle: string
  readonly draftContent: string
  readonly parentChapterContent?: string
  readonly parentChapterTitle?: string
  readonly roughPlot: string
  readonly storyTitle: string
}

const INTRO_CHAPTER_PROMPT_TEMPLATE = `You are a writer of a "Choose Your Own Adventure" book. The chapter you write will treat the reader as the main character (e.g instead of writing "I had a dream", you should write "You had a dream"). You will write a story based on the \`plot\` described below. Write in markdown codeblock.

<plot>
{{roughPlot}}
</plot>`

const BRANCH_CHAPTER_PROMPT_TEMPLATE = `You are a writer of a "Choose Your Own Adventure" book. The chapter you write will treat the reader as the main character (e.g instead of writing "I had a dream", you should write "You had a dream"). You will write a story based on the \`plot\` described below. Write in markdown codeblock.

<previous_story note="this is just a reference of what happened before the plot">
{{parentChapterContent}}
</previous_story>

<plot>
{{roughPlot}}
</plot>`

const PROMPT_BUILDER_TEMPLATES: Record<PromptBuilderTemplateKind, string> = {
  branch: BRANCH_CHAPTER_PROMPT_TEMPLATE,
  intro: INTRO_CHAPTER_PROMPT_TEMPLATE,
}

/** Builds the copy-paste LLM prompt for the selected chapter authoring case. */
export function buildPromptBuilderPrompt(
  kind: PromptBuilderTemplateKind,
  values: PromptBuilderValues,
) {
  const template = PROMPT_BUILDER_TEMPLATES[kind]
  const replacements: Record<string, string> = {
    chapterTitle: values.chapterTitle,
    draftContent: values.draftContent,
    parentChapterContent: values.parentChapterContent ?? '',
    parentChapterTitle: values.parentChapterTitle ?? '',
    roughPlot: values.roughPlot,
    storyTitle: values.storyTitle,
  }

  return Object.entries(replacements).reduce(
    (prompt, [placeholder, value]) =>
      prompt.replaceAll(`{{${placeholder}}}`, value),
    template,
  )
}
