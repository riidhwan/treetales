import type { SyntheticEvent } from 'react'

import { useStoryEditor } from '@/hooks/useStoryEditor'
import { Alert } from '@/components/ui/Alert'

import { StoryEditorReadyState } from '@/components/features/StoryEditor/StoryEditorReadyState'
import { StoryEditorUnavailableState } from '@/components/features/StoryEditor/StoryEditorUnavailableState'

interface Props {
  readonly canSave: boolean
  readonly description: string
  readonly errorMessage?: string
  readonly isSaving: boolean
  readonly onDescriptionChange: (description: string) => void
  readonly onOpenDashboard: () => void
  readonly onSave: (event: SyntheticEvent<HTMLFormElement>) => void
  readonly onTitleChange: (title: string) => void
  readonly status: ReturnType<typeof useStoryEditor>['status']
  readonly successMessage?: string
  readonly title: string
}

export function StoryEditorContent({
  canSave,
  description,
  errorMessage,
  isSaving,
  onDescriptionChange,
  onOpenDashboard,
  onSave,
  onTitleChange,
  status,
  successMessage,
  title,
}: Props) {
  if (status === 'loading') {
    return <Alert className="shadow-sm">Loading story...</Alert>
  }

  if (status === 'missing-story') {
    return (
      <StoryEditorUnavailableState
        description="This story may have been deleted or is unavailable in this browser."
        onOpenDashboard={onOpenDashboard}
        title="Story not found"
      />
    )
  }

  if (status === 'error') {
    return (
      <StoryEditorUnavailableState
        errorMessage={errorMessage}
        onOpenDashboard={onOpenDashboard}
        title="Story unavailable"
      />
    )
  }

  return (
    <StoryEditorReadyState
      canSave={canSave}
      description={description}
      errorMessage={errorMessage}
      isSaving={isSaving}
      onDescriptionChange={onDescriptionChange}
      onSave={onSave}
      onTitleChange={onTitleChange}
      successMessage={successMessage}
      title={title}
    />
  )
}
