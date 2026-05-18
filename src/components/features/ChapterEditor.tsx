import { useEffect, useState } from 'react'
import type { ReactNode, SyntheticEvent } from 'react'
import { ArrowLeft, Home, Save } from 'lucide-react'

import {
  type ChapterEditorServices,
  useChapterEditor,
} from '@/hooks/useChapterEditor'
import {
  type ChapterWritingMode,
  ChapterWritingSurface,
} from '@/components/features/ChapterWritingSurface'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

interface Props {
  readonly chapterId: string
  readonly onGoBack: () => void
  readonly onOpenDashboard: () => void
  readonly services?: ChapterEditorServices
  readonly storyId: string
}

export function ChapterEditor({
  chapterId,
  onGoBack,
  onOpenDashboard,
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
    title,
  } = useChapterEditor({ chapterId, services, storyId })
  const [editorMode, setEditorMode] = useState<ChapterWritingMode>('write')

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
      <ChapterWritingSurface
        canSubmit={canSave}
        content={content}
        contentPlaceholder="Write this chapter in markdown..."
        isSubmitting={isSaving}
        mode={editorMode}
        navigationActions={
          <Button
            aria-label="Back"
            className="px-3"
            onClick={() => confirmNavigation(onGoBack)}
            size="sm"
          >
            <ArrowLeft aria-hidden="true" size={16} />
          </Button>
        }
        onContentChange={setContent}
        onModeChange={setEditorMode}
        onSubmit={handleSave}
        onTitleChange={setTitle}
        primaryActionIcon={<Save aria-hidden="true" size={16} />}
        primaryActionLabel="Save"
        secondaryActions={
          <Button
            aria-label="Dashboard"
            className="px-3"
            onClick={() => confirmNavigation(onOpenDashboard)}
            size="sm"
          >
            <Home aria-hidden="true" size={16} />
          </Button>
        }
        submittingActionLabel="Saving..."
        title={title}
        titleError={
          title.trim().length === 0
            ? 'Chapter title is required.'
            : undefined
        }
        titlePlaceholder="Untitled chapter"
        toolbarContext={story?.title ?? 'Story'}
      />
    )
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      {status === 'ready' ? (
        <>
          {errorMessage ? (
            <div className="mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6">
              <Alert role="alert" variant="error">
                {errorMessage}
              </Alert>
            </div>
          ) : null}
          {editorContent}
        </>
      ) : (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
          <nav
            aria-label="Chapter editor actions"
            className="flex flex-wrap justify-between gap-3"
          >
            <Button
              aria-label="Back"
              className="px-3"
              onClick={onGoBack}
              size="sm"
            >
              <ArrowLeft aria-hidden="true" size={16} />
            </Button>
            <Button
              aria-label="Dashboard"
              className="px-3"
              onClick={onOpenDashboard}
              size="sm"
            >
              <Home aria-hidden="true" size={16} />
            </Button>
          </nav>

          {editorContent}
        </section>
      )}
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
