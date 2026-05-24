import { ChevronLeft } from 'lucide-react'
import type { SyntheticEvent } from 'react'

import {
  type StoryEditorServices,
  useStoryEditor,
} from '@/hooks/useStoryEditor'
import { storyEditorCopy } from '@/copy'

import { StoryEditorContent } from './StoryEditor/StoryEditorContent'

interface Props {
  readonly onOpenDashboard: () => void
  readonly onOpenStory: (storyId: string) => void
  readonly services?: StoryEditorServices
  readonly storyId: string
}

export function StoryEditor({
  onOpenDashboard,
  onOpenStory,
  services,
  storyId,
}: Props) {
  const {
    canSave,
    description,
    errorMessage,
    isSaving,
    saveStory,
    setDescription,
    setTitle,
    status,
    successMessage,
    title,
  } = useStoryEditor({ services, storyId })

  function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    void saveStory()
  }

  return (
    <main className="min-h-screen bg-background-app text-text-primary">
      <header className="border-b border-border-subtle/70 bg-surface-paper/35">
        <nav
          aria-label={storyEditorCopy.navigation.label}
          className="mx-auto flex min-h-16 w-full max-w-3xl items-center justify-between px-5 sm:px-8"
        >
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-md text-base font-medium text-action-primary transition hover:text-action-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            onClick={() => onOpenStory(storyId)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={22} />
            {storyEditorCopy.navigation.story}
          </button>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-10 sm:px-8">
        <header>
          <h1 className="text-sm font-semibold uppercase tracking-wide text-action-primary">
            {storyEditorCopy.heading}
          </h1>
        </header>

        <StoryEditorContent
          canSave={canSave}
          description={description}
          errorMessage={errorMessage}
          isSaving={isSaving}
          onDescriptionChange={setDescription}
          onOpenDashboard={onOpenDashboard}
          onSave={handleSave}
          onTitleChange={setTitle}
          status={status}
          successMessage={successMessage}
          title={title}
        />
      </section>
    </main>
  )
}
