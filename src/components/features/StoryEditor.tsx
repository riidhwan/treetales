import { BookOpen, Home, Save } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getStoryById, updateStory } from '@/services/storyDb'
import type { Story, UpdateStoryInput } from '@/services/types'

interface StoryEditorServices {
  readonly getStoryById: (storyId: string) => Promise<Story | undefined>
  readonly updateStory: (
    storyId: string,
    input: UpdateStoryInput,
  ) => Promise<Story | undefined>
}

const DEFAULT_SERVICES: StoryEditorServices = {
  getStoryById,
  updateStory,
}

type EditorStatus = 'loading' | 'ready' | 'missing-story'

interface Props {
  readonly onOpenDashboard: () => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryEditorServices
  readonly storyId: string
}

export function StoryEditor({
  onOpenDashboard,
  onReadStory,
  services = DEFAULT_SERVICES,
  storyId,
}: Props) {
  const [story, setStory] = useState<Story | undefined>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<EditorStatus>('loading')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [successMessage, setSuccessMessage] = useState<string | undefined>()

  const trimmedTitle = title.trim()
  const trimmedDescription = description.trim()
  const canSave = trimmedTitle.length > 0 && !isSaving

  useEffect(() => {
    let isCurrent = true

    async function loadStory() {
      setStatus('loading')
      setErrorMessage(undefined)
      setSuccessMessage(undefined)

      try {
        const loadedStory = await services.getStoryById(storyId)

        if (!isCurrent) {
          return
        }

        if (!loadedStory) {
          setStory(undefined)
          setStatus('missing-story')
          return
        }

        setStory(loadedStory)
        setTitle(loadedStory.title)
        setDescription(loadedStory.description)
        setStatus('ready')
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error))
          setStatus('ready')
        }
      }
    }

    void loadStory()

    return () => {
      isCurrent = false
    }
  }, [services, storyId])

  async function handleSave(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSave) {
      return
    }

    setIsSaving(true)
    setErrorMessage(undefined)
    setSuccessMessage(undefined)

    try {
      const updatedStory = await services.updateStory(storyId, {
        title: trimmedTitle,
        description: trimmedDescription,
      })

      if (!updatedStory) {
        setStory(undefined)
        setStatus('missing-story')
        return
      }

      setStory(updatedStory)
      setTitle(updatedStory.title)
      setDescription(updatedStory.description)
      setSuccessMessage('Story saved.')
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  let editorContent: React.ReactNode

  if (status === 'loading') {
    editorContent = (
      <p className="rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-600 shadow-sm">
        Loading story...
      </p>
    )
  } else if (status === 'missing-story') {
    editorContent = (
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          This story may have been deleted or is unavailable in this browser.
        </p>
        <button
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
          onClick={onOpenDashboard}
          type="button"
        >
          <Home aria-hidden="true" size={16} />
          Dashboard
        </button>
      </section>
    )
  } else {
    editorContent = (
      <>
        {errorMessage ? (
          <p
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p
            className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="status"
          >
            {successMessage}
          </p>
        ) : null}

        <form
          className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          onSubmit={(event) => {
            void handleSave(event)
          }}
        >
          <div className="border-b border-stone-200 pb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Story editor
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {story?.title || 'Untitled story'}
            </h1>
          </div>

          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Title
              <input
                className="min-h-11 rounded-md border border-stone-300 px-3 text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                type="text"
                value={title}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Description
              <textarea
                className="min-h-32 resize-y rounded-md border border-stone-300 px-3 py-2 text-base leading-6 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                name="description"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"
              disabled={!canSave}
              type="submit"
            >
              <Save aria-hidden="true" size={18} />
              {isSaving ? 'Saving...' : 'Save Story'}
            </button>
          </div>
        </form>

        <section className="rounded-lg border border-dashed border-stone-300 bg-white p-6">
          <h2 className="text-xl font-semibold">Chapters</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Chapter editing is not available yet. Story title and description
            can be updated here while chapter tools are built.
          </p>
        </section>
      </>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
        <nav
          aria-label="Editor actions"
          className="flex flex-wrap justify-between gap-3"
        >
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
            onClick={onOpenDashboard}
            type="button"
          >
            <Home aria-hidden="true" size={16} />
            Dashboard
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === 'missing-story'}
            onClick={() => onReadStory(storyId)}
            type="button"
          >
            <BookOpen aria-hidden="true" size={16} />
            Read
          </button>
        </nav>

        {editorContent}
      </section>
    </main>
  )
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
