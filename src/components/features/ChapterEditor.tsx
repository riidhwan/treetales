import type { ReactNode, SyntheticEvent } from 'react'
import { ArrowLeft, Edit3, Home, PlusCircle, Save } from 'lucide-react'

import {
  type ChapterEditorServices,
  useChapterEditor,
} from '@/hooks/useChapterEditor'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'
import { TextInput } from '@/components/ui/TextInput'
import type { Chapter } from '@/services/types'

interface Props {
  readonly chapterId: string
  readonly onEditChapter: (storyId: string, chapterId: string) => void
  readonly onOpenDashboard: () => void
  readonly onOpenStoryEditor: (storyId: string) => void
  readonly services?: ChapterEditorServices
  readonly storyId: string
}

export function ChapterEditor({
  chapterId,
  onEditChapter,
  onOpenDashboard,
  onOpenStoryEditor,
  services,
  storyId,
}: Props) {
  const {
    canCreateChildChapter,
    canSave,
    childChapters,
    content,
    createChildChapter,
    errorMessage,
    isCreatingChildChapter,
    isSaving,
    newChildChapterTitle,
    saveChapter,
    setContent,
    setNewChildChapterTitle,
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

  function handleCreateChildChapter(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    createChildChapter()
      .then((chapter) => {
        if (chapter) {
          onEditChapter(storyId, chapter.id)
        }
      })
      .catch(() => undefined)
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

        <ChildChaptersSection
          canCreateChildChapter={canCreateChildChapter}
          childChapters={childChapters}
          isCreatingChildChapter={isCreatingChildChapter}
          newChildChapterTitle={newChildChapterTitle}
          onCreateChildChapter={handleCreateChildChapter}
          onEditChapter={(selectedChapterId) =>
            onEditChapter(storyId, selectedChapterId)
          }
          onNewChildChapterTitleChange={setNewChildChapterTitle}
        />
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

interface ChildChaptersSectionProps {
  readonly canCreateChildChapter: boolean
  readonly childChapters: Chapter[]
  readonly isCreatingChildChapter: boolean
  readonly newChildChapterTitle: string
  readonly onCreateChildChapter: (
    event: SyntheticEvent<HTMLFormElement>,
  ) => void
  readonly onEditChapter: (chapterId: string) => void
  readonly onNewChildChapterTitleChange: (title: string) => void
}

function ChildChaptersSection({
  canCreateChildChapter,
  childChapters,
  isCreatingChildChapter,
  newChildChapterTitle,
  onCreateChildChapter,
  onEditChapter,
  onNewChildChapterTitleChange,
}: ChildChaptersSectionProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="border-b border-stone-200 pb-5">
        <h2 className="text-xl font-semibold">Child Chapters</h2>
        <p className="mt-1 text-sm text-stone-600">
          Add or open chapters that follow this one.
        </p>
      </div>

      <form
        className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
        onSubmit={onCreateChildChapter}
      >
        <label className="grid gap-2 text-sm font-medium text-stone-800">
          Child chapter title
          <TextInput
            name="newChildChapterTitle"
            onChange={(event) =>
              onNewChildChapterTitleChange(event.target.value)
            }
            value={newChildChapterTitle}
          />
        </label>
        <Button
          disabled={!canCreateChildChapter}
          type="submit"
          variant="primary"
        >
          <PlusCircle aria-hidden="true" size={18} />
          {isCreatingChildChapter ? 'Creating...' : 'Add Child Chapter'}
        </Button>
      </form>

      {childChapters.length > 0 ? (
        <div className="mt-6 grid gap-3">
          {childChapters.map((childChapter) => (
            <article
              className="rounded-md border border-stone-200 p-4"
              key={childChapter.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{childChapter.title}</h3>
                  <p className="mt-1 text-sm text-stone-600">
                    Child chapter
                  </p>
                </div>
                <Button
                  onClick={() => onEditChapter(childChapter.id)}
                  size="sm"
                >
                  <Edit3 aria-hidden="true" size={16} />
                  Edit
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-md border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
          No child chapters yet.
        </p>
      )}
    </section>
  )
}
