import { useState } from 'react'
import type { SyntheticEvent } from 'react'

import { CreatorContent } from '@/components/features/ChapterCreator/CreatorContent'
import {
  type ChapterCreatorServices,
  useChapterCreator,
} from '@/hooks/useChapterCreator'

interface Props {
  readonly onChapterCreated: (storyId: string, chapterId: string) => void
  readonly onGoBack: () => void
  readonly onOpenDashboard: () => void
  readonly parentChapterId?: string
  readonly services?: ChapterCreatorServices
  readonly storyId: string
}

export function ChapterCreator({
  onChapterCreated,
  onGoBack,
  onOpenDashboard,
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
  const [hasTouchedTitle, setHasTouchedTitle] = useState(false)
  const hasDraftChanges = status === 'ready' && (title !== '' || content !== '')
  const titleError =
    title.trim().length === 0 && (hasTouchedTitle || title.length > 0)
      ? 'Chapter title is required.'
      : undefined

  function handleCreate(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setHasTouchedTitle(true)
    createChapterFromForm()
      .then((chapter) => {
        if (chapter) {
          onChapterCreated(storyId, chapter.id)
        }
      })
      .catch(() => undefined)
  }

  return (
    <main className="min-h-screen bg-tt-parchment text-tt-ink">
      <CreatorContent
        canCreate={canCreate}
        content={content}
        errorMessage={errorMessage}
        hasDraftChanges={hasDraftChanges}
        introChapterTitle={introChapter?.title}
        isCreating={isCreating}
        isIntroChapter={isIntroChapter}
        onContentChange={setContent}
        onCreate={handleCreate}
        onGoBack={onGoBack}
        onOpenDashboard={onOpenDashboard}
        onTitleBlur={() => setHasTouchedTitle(true)}
        onTitleChange={setTitle}
        parentChapter={parentChapter}
        status={status}
        storyTitle={story?.title}
        title={title}
        titleError={titleError}
      />
    </main>
  )
}
