import { Save } from 'lucide-react'
import type { SyntheticEvent } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { TextArea } from '@/components/ui/TextArea'
import { TextInput } from '@/components/ui/TextInput'

interface Props {
  readonly canSave: boolean
  readonly description: string
  readonly errorMessage?: string
  readonly isSaving: boolean
  readonly onDescriptionChange: (description: string) => void
  readonly onSave: (event: SyntheticEvent<HTMLFormElement>) => void
  readonly onTitleChange: (title: string) => void
  readonly successMessage?: string
  readonly title: string
}

export function StoryEditorReadyState({
  canSave,
  description,
  errorMessage,
  isSaving,
  onDescriptionChange,
  onSave,
  onTitleChange,
  successMessage,
  title,
}: Props) {
  return (
    <>
      {errorMessage ? (
        <Alert role="alert" variant="error">
          {errorMessage}
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert role="status" variant="success">
          {successMessage}
        </Alert>
      ) : null}

      <form
        className="rounded-2xl border border-border-subtle bg-surface-paper/70 p-5 shadow-sm sm:p-7"
        onSubmit={onSave}
      >
        <div className="grid gap-6">
          <Field className="text-base" label="Title">
            <TextInput
              className="min-h-14 rounded-xl px-4 text-lg"
              name="title"
              onChange={(event) => onTitleChange(event.target.value)}
              value={title}
            />
          </Field>
          <Field className="text-base" label="Description">
            <TextArea
              className="min-h-72 rounded-xl px-4 py-4"
              name="description"
              onChange={(event) => onDescriptionChange(event.target.value)}
              value={description}
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            className="min-h-14 rounded-xl px-6 text-base shadow-md"
            disabled={!canSave}
            type="submit"
            variant="primary"
          >
            <Save aria-hidden="true" size={18} />
            {isSaving ? 'Saving...' : 'Save Story'}
          </Button>
        </div>
      </form>
    </>
  )
}
