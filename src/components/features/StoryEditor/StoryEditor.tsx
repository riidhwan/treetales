import type { SyntheticEvent } from 'react'

import { ManagementTopBar } from '@/components/features/shared/ManagementTopBar'
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
      <ManagementTopBar
        label={storyEditorCopy.navigation.label}
        onBack={() => onOpenStory(storyId)}
        previousLabel={storyEditorCopy.navigation.story}
      />

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
