import type { ReactNode, SyntheticEvent } from 'react'
import { ArrowLeft, Home, Save } from 'lucide-react'

import {
  type ChapterEditorServices,
  useChapterEditor,
} from '@/hooks/useChapterEditor'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'
import { TextInput } from '@/components/ui/TextInput'

interface Props {
  readonly chapterId: string
  readonly onOpenDashboard: () => void
  readonly onOpenStoryEditor: (storyId: string) => void
  readonly services?: ChapterEditorServices
  readonly storyId: string
}

export function ChapterEditor({
  chapterId,
  onOpenDashboard,
  onOpenStoryEditor,
  services,
  storyId,
}: Props) {
  const {
    canSave,
    content,
    errorMessage,
    isSaving,
    saveChapter,
    setContent,
    setTitle,
    status,
    story,
    successMessage,
    title,
  } = useChapterEditor({ chapterId, services, storyId })

  function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    saveChapter().catch(() => undefined)
  }

  let editorContent: ReactNode

  if (status === 'loading') {
    editorContent = (
      <Alert className="shadow-sm">Loading chapter...</Alert>
    )
  } else if (status === 'missing-story') {
    editorContent = (
      <MissingState
        description="This story may have been deleted or is unavailable in this browser."
        title="Story not found"
      />
    )
  } else if (status === 'missing-chapter') {
    editorContent = (
      <MissingState
        description="This chapter is not part of the selected story."
        kicker={story?.title}
        title="Chapter not found"
      />
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
          className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          onSubmit={handleSave}
        >
          <div className="border-b border-stone-200 pb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              {story?.title ?? 'Chapter editor'}
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {title || 'Untitled chapter'}
            </h1>
          </div>

          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Title
              <TextInput
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Content
              <TextArea
                className="min-h-64"
                name="content"
                onChange={(event) => setContent(event.target.value)}
                value={content}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              disabled={!canSave}
              type="submit"
              variant="primary"
            >
              <Save aria-hidden="true" size={18} />
              {isSaving ? 'Saving...' : 'Save Chapter'}
            </Button>
          </div>
        </form>
      </>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
        <nav
          aria-label="Chapter editor actions"
          className="flex flex-wrap justify-between gap-3"
        >
          <Button onClick={() => onOpenStoryEditor(storyId)} size="sm">
            <ArrowLeft aria-hidden="true" size={16} />
            Story Editor
          </Button>
          <Button onClick={onOpenDashboard} size="sm">
            <Home aria-hidden="true" size={16} />
            Dashboard
          </Button>
        </nav>

        {editorContent}
      </section>
    </main>
  )
}

interface MissingStateProps {
  readonly description: string
  readonly kicker?: string
  readonly title: string
}

function MissingState({ description, kicker, title }: MissingStateProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      {kicker ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {kicker}
        </p>
      ) : null}
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        {description}
      </p>
    </section>
  )
}
