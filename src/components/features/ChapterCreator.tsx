import type { SyntheticEvent } from 'react'
import { ArrowLeft, Home, PlusCircle } from 'lucide-react'

import {
  type ChapterCreatorServices,
  useChapterCreator,
} from '@/hooks/useChapterCreator'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { TextInput } from '@/components/ui/TextInput'

interface Props {
  readonly onChapterCreated: (storyId: string, chapterId: string) => void
  readonly onOpenDashboard: () => void
  readonly onOpenParentChapter?: (storyId: string, chapterId: string) => void
  readonly onOpenStoryEditor: (storyId: string) => void
  readonly parentChapterId?: string
  readonly services?: ChapterCreatorServices
  readonly storyId: string
}

export function ChapterCreator({
  onChapterCreated,
  onOpenDashboard,
  onOpenParentChapter,
  onOpenStoryEditor,
  parentChapterId,
  services,
  storyId,
}: Props) {
  const {
    canCreate,
    content,
    createChapterFromForm,
    errorMessage,
    introChapter,
    isCreating,
    parentChapter,
    setContent,
    setTitle,
    status,
    story,
    title,
  } = useChapterCreator({ parentChapterId, services, storyId })
  const isIntroChapter = !parentChapterId

  function handleCreate(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    createChapterFromForm()
      .then((chapter) => {
        if (chapter) {
          onChapterCreated(storyId, chapter.id)
        }
      })
      .catch(() => undefined)
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
        <nav
          aria-label="Chapter creation actions"
          className="flex flex-wrap justify-between gap-3"
        >
          <Button
            onClick={() => {
              if (parentChapterId && onOpenParentChapter) {
                onOpenParentChapter(storyId, parentChapterId)
                return
              }

              onOpenStoryEditor(storyId)
            }}
            size="sm"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            {parentChapterId ? 'Parent Chapter' : 'Story Editor'}
          </Button>
          <Button onClick={onOpenDashboard} size="sm">
            <Home aria-hidden="true" size={16} />
            Dashboard
          </Button>
        </nav>

        <CreatorContent
          canCreate={canCreate}
          content={content}
          errorMessage={errorMessage}
          introChapterTitle={introChapter?.title}
          isCreating={isCreating}
          isIntroChapter={isIntroChapter}
          onCreate={handleCreate}
          onContentChange={setContent}
          onTitleChange={setTitle}
          parentChapterTitle={parentChapter?.title}
          status={status}
          storyTitle={story?.title}
          title={title}
        />
      </section>
    </main>
  )
}

interface CreatorContentProps {
  readonly canCreate: boolean
  readonly content: string
  readonly errorMessage?: string
  readonly introChapterTitle?: string
  readonly isCreating: boolean
  readonly isIntroChapter: boolean
  readonly onContentChange: (content: string) => void
  readonly onCreate: (event: SyntheticEvent<HTMLFormElement>) => void
  readonly onTitleChange: (title: string) => void
  readonly parentChapterTitle?: string
  readonly status: ReturnType<typeof useChapterCreator>['status']
  readonly storyTitle?: string
  readonly title: string
}

function CreatorContent({
  canCreate,
  content,
  errorMessage,
  introChapterTitle,
  isCreating,
  isIntroChapter,
  onContentChange,
  onCreate,
  onTitleChange,
  parentChapterTitle,
  status,
  storyTitle,
  title,
}: CreatorContentProps) {
  if (status === 'ready') {
    return (
      <ChapterCreationForm
        canCreate={canCreate}
        content={content}
        errorMessage={errorMessage}
        isCreating={isCreating}
        isIntroChapter={isIntroChapter}
        onContentChange={onContentChange}
        onCreate={onCreate}
        onTitleChange={onTitleChange}
        parentChapterTitle={parentChapterTitle}
        storyTitle={storyTitle}
        title={title}
      />
    )
  }

  if (status === 'loading') {
    return (
      <Alert className="shadow-sm">
        {isIntroChapter
          ? 'Loading story...'
          : 'Loading parent chapter...'}
      </Alert>
    )
  }

  return (
    <ChapterCreationUnavailable
      errorMessage={errorMessage}
      introChapterTitle={introChapterTitle}
      status={status}
      storyTitle={storyTitle}
    />
  )
}

interface ChapterCreationUnavailableProps {
  readonly errorMessage?: string
  readonly introChapterTitle?: string
  readonly status: ReturnType<typeof useChapterCreator>['status']
  readonly storyTitle?: string
}

function ChapterCreationUnavailable({
  errorMessage,
  introChapterTitle,
  status,
  storyTitle,
}: ChapterCreationUnavailableProps) {
  if (status === 'missing-story') {
    return (
      <MissingState
        description="This story may have been deleted or is unavailable in this browser."
        title="Story not found"
      />
    )
  }

  if (status === 'missing-parent-chapter') {
    return (
      <MissingState
        description="This chapter is not part of the selected story."
        kicker={storyTitle}
        title="Parent chapter not found"
      />
    )
  }

  if (status === 'intro-chapter-exists') {
    return (
      <MissingState
        description="This story already has an intro chapter."
        kicker={storyTitle}
        title={introChapterTitle ?? 'Intro chapter exists'}
      />
    )
  }

  return errorMessage ? (
    <Alert role="alert" variant="error">
      {errorMessage}
    </Alert>
  ) : null
}

interface ChapterCreationFormProps {
  readonly canCreate: boolean
  readonly content: string
  readonly errorMessage?: string
  readonly isCreating: boolean
  readonly isIntroChapter: boolean
  readonly onContentChange: (content: string) => void
  readonly onCreate: (event: SyntheticEvent<HTMLFormElement>) => void
  readonly onTitleChange: (title: string) => void
  readonly parentChapterTitle?: string
  readonly storyTitle?: string
  readonly title: string
}

function ChapterCreationForm({
  canCreate,
  content,
  errorMessage,
  isCreating,
  isIntroChapter,
  onContentChange,
  onCreate,
  onTitleChange,
  parentChapterTitle,
  storyTitle,
  title,
}: ChapterCreationFormProps) {
  return (
    <>
      {errorMessage ? (
        <Alert role="alert" variant="error">
          {errorMessage}
        </Alert>
      ) : null}

      <form
        className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
        onSubmit={onCreate}
      >
        <div className="border-b border-stone-200 pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            {storyTitle ?? 'Chapter creator'}
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            {isIntroChapter ? 'Add Intro Chapter' : 'Add Child Chapter'}
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {isIntroChapter
              ? 'This is the first chapter readers will see.'
              : `Follows ${parentChapterTitle ?? 'the selected chapter'}.`}
          </p>
        </div>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-stone-800">
            Title
            <TextInput
              name="title"
              onChange={(event) => onTitleChange(event.target.value)}
              value={title}
            />
          </label>
          <MarkdownEditor
            label="Content"
            name="content"
            onChange={onContentChange}
            value={content}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button disabled={!canCreate} type="submit" variant="primary">
            <PlusCircle aria-hidden="true" size={18} />
            {isCreating ? 'Creating...' : 'Create Chapter'}
          </Button>
        </div>
      </form>
    </>
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
