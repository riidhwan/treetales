import { promptBuilderCopy } from '@/copy'

export type PromptBuilderTemplateKind = 'branch' | 'intro'

interface PromptBuilderValues {
  readonly chapterTitle: string
  readonly draftContent: string
  readonly parentChapterContent?: string
  readonly parentChapterTitle?: string
  readonly roughPlot: string
  readonly storyTitle: string
}

const PROMPT_BUILDER_TEMPLATES: Record<PromptBuilderTemplateKind, string> = {
  branch: promptBuilderCopy.templates.branch,
  intro: promptBuilderCopy.templates.intro,
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
