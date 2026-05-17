import { useEffect, useState } from 'react'
import type { ReactNode, SyntheticEvent } from 'react'
import { ArrowLeft, BookOpen, Eye, Home, Pencil, Save } from 'lucide-react'

import {
  type ChapterEditorServices,
  useChapterEditor,
} from '@/hooks/useChapterEditor'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { TextArea } from '@/components/ui/TextArea'
import { cn } from '@/lib/utils'

type EditorMode = 'preview' | 'write'

interface Props {
  readonly chapterId: string
  readonly onGoBack: () => void
  readonly onOpenDashboard: () => void
  readonly onOpenStoryEditor: () => void
  readonly services?: ChapterEditorServices
  readonly storyId: string
}

export function ChapterEditor({
  chapterId,
  onGoBack,
  onOpenDashboard,
  onOpenStoryEditor,
  services,
  storyId,
}: Props) {
  const {
    canSave,
    content,
    errorMessage,
    hasUnsavedChanges,
    isSaving,
    saveChapter,
    setContent,
    setTitle,
    status,
    story,
    successMessage,
    title,
  } = useChapterEditor({ chapterId, services, storyId })
  const [editorMode, setEditorMode] = useState<EditorMode>('write')
  const wordCount = countMarkdownWords(content)
  const saveStatus = getSaveStatus({
    errorMessage,
    hasUnsavedChanges,
    isSaving,
    successMessage,
  })

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) {
        return
      }

      event.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  useEffect(() => {
    function handleSaveShortcut(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() !== 's' ||
        (!event.ctrlKey && !event.metaKey)
      ) {
        return
      }

      event.preventDefault()
      saveChapter().catch(() => undefined)
    }

    window.addEventListener('keydown', handleSaveShortcut)

    return () => {
      window.removeEventListener('keydown', handleSaveShortcut)
    }
  }, [saveChapter])

  function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    saveChapter().catch(() => undefined)
  }

  function confirmNavigation(navigate: () => void) {
    if (
      !hasUnsavedChanges ||
      window.confirm('Discard unsaved chapter changes?')
    ) {
      navigate()
    }
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
      <form className="min-h-screen" onSubmit={handleSave}>
        <EditorToolbar
          canSave={canSave}
          editorMode={editorMode}
          isSaving={isSaving}
          onGoBack={() => confirmNavigation(onGoBack)}
          onOpenDashboard={() => confirmNavigation(onOpenDashboard)}
          onOpenStoryEditor={() => confirmNavigation(onOpenStoryEditor)}
          onSelectMode={setEditorMode}
          saveStatus={saveStatus}
          storyTitle={story?.title ?? 'Story'}
          wordCount={wordCount}
        />

        {errorMessage ? (
          <div className="mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6">
            <Alert role="alert" variant="error">
              {errorMessage}
            </Alert>
          </div>
        ) : null}

        <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
          <div className="mx-auto min-h-[calc(100vh-10rem)] w-full max-w-[52rem] border-stone-200 bg-white px-5 py-6 shadow-sm sm:border sm:px-10 sm:py-10 lg:px-14">
            <label className="block">
              <span className="sr-only">Title</span>
              <input
                aria-invalid={title.trim().length === 0}
                className="w-full border-0 bg-transparent p-0 text-3xl font-bold leading-tight text-stone-950 outline-none placeholder:text-stone-400 focus:ring-0 sm:text-4xl"
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Untitled chapter"
                value={title}
              />
            </label>
            {title.trim().length === 0 ? (
              <p className="mt-2 text-sm font-medium text-red-700">
                Chapter title is required.
              </p>
            ) : null}

            <div className="mt-8">
              {editorMode === 'preview' ? (
                <section
                  aria-label="Content preview"
                  className="min-h-[calc(100vh-18rem)]"
                >
                  <MarkdownContent
                    className="space-y-5"
                    content={content}
                    emptyFallback="Nothing to preview yet."
                  />
                </section>
              ) : (
                <label className="block">
                  <span className="sr-only">Content</span>
                  <TextArea
                    className="min-h-[calc(100vh-18rem)] w-full resize-none border-0 p-0 text-lg leading-8 shadow-none outline-none focus:border-transparent focus:ring-0"
                    name="content"
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Write this chapter in markdown..."
                    value={content}
                  />
                </label>
              )}
            </div>
          </div>
        </section>
      </form>
    )
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      {status === 'ready' ? (
        editorContent
      ) : (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
          <nav
            aria-label="Chapter editor actions"
            className="flex flex-wrap justify-between gap-3"
          >
            <Button onClick={onGoBack} size="sm">
              <ArrowLeft aria-hidden="true" size={16} />
              Back
            </Button>
            <Button onClick={onOpenDashboard} size="sm">
              <Home aria-hidden="true" size={16} />
              Dashboard
            </Button>
          </nav>

          {editorContent}
        </section>
      )}
    </main>
  )
}

interface EditorToolbarProps {
  readonly canSave: boolean
  readonly editorMode: EditorMode
  readonly isSaving: boolean
  readonly onGoBack: () => void
  readonly onOpenDashboard: () => void
  readonly onOpenStoryEditor: () => void
  readonly onSelectMode: (mode: EditorMode) => void
  readonly saveStatus: string
  readonly storyTitle: string
  readonly wordCount: number
}

function EditorToolbar({
  canSave,
  editorMode,
  isSaving,
  onGoBack,
  onOpenDashboard,
  onOpenStoryEditor,
  onSelectMode,
  saveStatus,
  storyTitle,
  wordCount,
}: EditorToolbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-3 py-2 sm:px-5">
        <Button onClick={onGoBack} size="sm">
          <ArrowLeft aria-hidden="true" size={16} />
          Back
        </Button>

        <div className="min-w-0 flex-1 px-1">
          <p className="truncate text-sm font-semibold text-stone-700">
            {storyTitle}
          </p>
        </div>

        <div
          aria-label="Editor mode"
          className="flex rounded-md border border-stone-300 bg-stone-100 p-1"
          role="group"
        >
          <ModeButton
            isSelected={editorMode === 'write'}
            label="Write"
            onClick={() => onSelectMode('write')}
          >
            <Pencil aria-hidden="true" size={15} />
          </ModeButton>
          <ModeButton
            isSelected={editorMode === 'preview'}
            label="Preview"
            onClick={() => onSelectMode('preview')}
          >
            <Eye aria-hidden="true" size={15} />
          </ModeButton>
        </div>

        <p className="min-w-24 text-right text-xs font-medium text-stone-600">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </p>

        <p
          className="min-w-28 text-right text-xs font-semibold text-stone-700"
          role="status"
        >
          {saveStatus}
        </p>

        <Button disabled={!canSave} size="sm" type="submit" variant="primary">
          <Save aria-hidden="true" size={16} />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>

        <Button onClick={onOpenStoryEditor} size="sm">
          <BookOpen aria-hidden="true" size={16} />
          Story Editor
        </Button>

        <Button onClick={onOpenDashboard} size="sm">
          <Home aria-hidden="true" size={16} />
          Dashboard
        </Button>
      </div>
    </header>
  )
}

interface ModeButtonProps {
  readonly children: ReactNode
  readonly isSelected: boolean
  readonly label: string
  readonly onClick: () => void
}

function ModeButton({
  children,
  isSelected,
  label,
  onClick,
}: ModeButtonProps) {
  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        'inline-flex min-h-8 items-center gap-1 rounded px-2 text-sm font-semibold transition',
        isSelected
          ? 'bg-white text-emerald-800 shadow-sm'
          : 'text-stone-700 hover:bg-white/70',
      )}
      onClick={onClick}
      type="button"
    >
      {children}
      {label}
    </button>
  )
}

interface SaveStatusOptions {
  readonly errorMessage?: string
  readonly hasUnsavedChanges: boolean
  readonly isSaving: boolean
  readonly successMessage?: string
}

function getSaveStatus({
  errorMessage,
  hasUnsavedChanges,
  isSaving,
  successMessage,
}: SaveStatusOptions) {
  if (isSaving) {
    return 'Saving...'
  }

  if (hasUnsavedChanges) {
    return 'Unsaved changes'
  }

  if (errorMessage) {
    return 'Could not save'
  }

  if (successMessage) {
    return successMessage
  }

  return 'Saved'
}

function countMarkdownWords(markdown: string) {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[\s>*-]+/gm, '')
    .replace(/[*_~#>`()]/g, ' ')
    .replaceAll('[', ' ')
    .replaceAll(']', ' ')

  return prose
    .split(/[^A-Za-z0-9'-]+/)
    .filter((word) => /[A-Za-z0-9]/.test(word)).length
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
