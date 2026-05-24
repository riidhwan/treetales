import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { TextInput } from '@/components/ui/TextInput'
import { commonCopy, storyDashboardCopy } from '@/copy'
import { cn } from '@/lib/utils'

interface Props {
  readonly canCreate: boolean
  readonly description: string
  readonly isConnectedToCallToAction: boolean
  readonly isOpen: boolean
  readonly onCreateStory: () => Promise<unknown>
  readonly onDescriptionChange: (description: string) => void
  readonly onTitleChange: (title: string) => void
  readonly title: string
}

export function NewStoryForm({
  canCreate,
  description,
  isConnectedToCallToAction,
  isOpen,
  onCreateStory,
  onDescriptionChange,
  onTitleChange,
  title,
}: Props) {
  if (!isOpen) {
    return null
  }

  return (
    <form
      aria-label={storyDashboardCopy.form.label}
      className={cn(
        'relative z-0 grid gap-4 border bg-surface-paper/75 p-4 shadow-sm motion-safe:animate-[new-story-form-reveal_160ms_ease-out] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-end',
        isConnectedToCallToAction
          ? '-mt-2 mx-2 rounded-2xl border-border-subtle px-4 pb-4 pt-6 shadow-md sm:mx-3 sm:rounded-xl'
          : 'rounded-2xl border-border-subtle sm:rounded-xl',
      )}
      onSubmit={(event) => {
        event.preventDefault()
        void onCreateStory()
      }}
    >
      <Field label={commonCopy.labels.title}>
        <TextInput
          name="title"
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={storyDashboardCopy.form.placeholders.title}
          value={title}
        />
      </Field>
      <Field label={commonCopy.labels.description}>
        <TextInput
          name="description"
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder={storyDashboardCopy.form.placeholders.description}
          value={description}
        />
      </Field>
      <Button
        className="min-h-11 w-full rounded-lg sm:w-auto"
        disabled={!canCreate}
        type="submit"
        variant="primary"
      >
        <Plus aria-hidden="true" size={18} />
        {storyDashboardCopy.actions.createStory}
      </Button>
    </form>
  )
}
