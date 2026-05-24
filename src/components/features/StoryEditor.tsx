import { ChevronLeft, Home, Save } from 'lucide-react'

import {
  type StoryEditorServices,
  useStoryEditor,
} from '@/hooks/useStoryEditor'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { TextArea } from '@/components/ui/TextArea'
import { TextInput } from '@/components/ui/TextInput'

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

  function handleSave(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    saveStory().catch(() => undefined)
  }

  let editorContent: React.ReactNode

  if (status === 'loading') {
    editorContent = (
      <Alert className="shadow-sm">Loading story...</Alert>
    )
  } else if (status === 'missing-story') {
    editorContent = (
      <section className="rounded-lg border border-border-subtle bg-surface-paper p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          This story may have been deleted or is unavailable in this browser.
        </p>
        <Button
          className="mt-5"
          onClick={onOpenDashboard}
          size="sm"
        >
          <Home aria-hidden="true" size={16} />
          Dashboard
        </Button>
      </section>
    )
  } else if (status === 'error') {
    editorContent = (
      <section className="rounded-lg border border-border-subtle bg-surface-paper p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Story unavailable</h1>
        <Alert className="mt-4" role="alert" variant="error">
          {errorMessage}
        </Alert>
        <Button
          className="mt-5"
          onClick={onOpenDashboard}
          size="sm"
        >
          <Home aria-hidden="true" size={16} />
          Dashboard
        </Button>
      </section>
    )
  } else {
    editorContent = (
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
          onSubmit={handleSave}
        >
          <div className="grid gap-6">
            <Field className="text-base" label="Title">
              <TextInput
                className="min-h-14 rounded-xl px-4 text-lg"
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </Field>
            <Field className="text-base" label="Description">
              <TextArea
                className="min-h-72 rounded-xl px-4 py-4"
                name="description"
                onChange={(event) => setDescription(event.target.value)}
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

  return (
    <main className="min-h-screen bg-background-app text-text-primary">
      <header className="border-b border-border-subtle/70 bg-surface-paper/35">
        <nav
          aria-label="Story editor navigation"
          className="mx-auto flex min-h-16 w-full max-w-3xl items-center justify-between px-5 sm:px-8"
        >
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-md text-base font-medium text-action-primary transition hover:text-action-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            onClick={() => onOpenStory(storyId)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={22} />
            Story
          </button>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-10 sm:px-8">
        <header>
          <h1 className="text-sm font-semibold uppercase tracking-wide text-action-primary">
            Story editor
          </h1>
        </header>

        {editorContent}
      </section>
    </main>
  )
}
