import { useEffect, useState } from 'react'
import type { ReactNode, SyntheticEvent } from 'react'
import { ArrowLeft, Home } from 'lucide-react'

import {
  type ChapterWritingMode,
  ChapterWritingSurface,
} from '@/components/features/chapterWriting/ChapterWritingSurface'
import { ChapterPromptBuilderControl } from '@/components/features/ChapterPromptBuilderControl'
import { ReaderAppearanceControl } from '@/components/domain/ReaderAppearanceControl'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useReaderAppearance } from '@/hooks/useReaderAppearance'

interface ParentChapterContext {
  readonly content: string
  readonly title: string
}

interface PromptBuilderOptions {
  readonly isDisabled?: boolean
  readonly parentChapter?: ParentChapterContext
  readonly promptBuilderDisabledReason?: string
  readonly storyTitle?: string
  readonly templateKind: 'branch' | 'intro'
}

interface Props {
  readonly canSubmit: boolean
  readonly content: string
  readonly errorMessage?: string
  readonly hasNavigationWarning: boolean
  readonly isSubmitting: boolean
  readonly navigationWarningMessage: string
  readonly onContentChange: (content: string) => void
  readonly onGoBack: () => void
  readonly onOpenDashboard: () => void
  readonly onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void
  readonly onSubmitShortcut?: () => void
  readonly onTitleBlur?: () => void
  readonly onTitleChange: (title: string) => void
  readonly primaryActionIcon: ReactNode
  readonly primaryActionLabel: string
  readonly promptBuilder: PromptBuilderOptions
  readonly submittingActionLabel: string
  readonly title: string
  readonly titleError?: string
  readonly toolbarContext: string
}

export function ChapterWritingWorkflow({
  canSubmit,
  content,
  errorMessage,
  hasNavigationWarning,
  isSubmitting,
  navigationWarningMessage,
  onContentChange,
  onGoBack,
  onOpenDashboard,
  onSubmit,
  onSubmitShortcut,
  onTitleBlur,
  onTitleChange,
  primaryActionIcon,
  primaryActionLabel,
  promptBuilder,
  submittingActionLabel,
  title,
  titleError,
  toolbarContext,
}: Props) {
  const {
    canDecreaseFontSize,
    canIncreaseFontSize,
    decreaseFontSize,
    increaseFontSize,
    readerAppearance,
    resetReaderAppearance,
    selectedFontFamily,
    setReaderFont,
  } = useReaderAppearance()
  const [editorMode, setEditorMode] = useState<ChapterWritingMode>('write')
  const [isAppearancePanelOpen, setIsAppearancePanelOpen] = useState(false)

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasNavigationWarning) {
        return
      }

      event.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasNavigationWarning])

  useEffect(() => {
    if (!onSubmitShortcut) {
      return undefined
    }

    const submitShortcut = onSubmitShortcut

    function handleSubmitShortcut(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() !== 's' ||
        (!event.ctrlKey && !event.metaKey)
      ) {
        return
      }

      event.preventDefault()
      submitShortcut()
    }

    window.addEventListener('keydown', handleSubmitShortcut)

    return () => {
      window.removeEventListener('keydown', handleSubmitShortcut)
    }
  }, [onSubmitShortcut])

  function confirmNavigation(navigate: () => void) {
    if (
      !hasNavigationWarning ||
      window.confirm(navigationWarningMessage)
    ) {
      navigate()
    }
  }

  return (
    <>
      {errorMessage ? (
        <div className="mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6">
          <Alert role="alert" variant="error">
            {errorMessage}
          </Alert>
        </div>
      ) : null}

      <ChapterWritingSurface
        canSubmit={canSubmit}
        content={content}
        contentPlaceholder="Write this chapter in markdown..."
        isSubmitting={isSubmitting}
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
        onContentChange={onContentChange}
        onModeChange={setEditorMode}
        onSubmit={onSubmit}
        onTitleBlur={onTitleBlur}
        onTitleChange={onTitleChange}
        primaryActionIcon={primaryActionIcon}
        primaryActionLabel={primaryActionLabel}
        readerFontFamily={selectedFontFamily}
        readerFontSizePt={readerAppearance.fontSizePt}
        secondaryActions={
          <>
            <ReaderAppearanceControl
              canDecreaseFontSize={canDecreaseFontSize}
              canIncreaseFontSize={canIncreaseFontSize}
              isPanelOpen={isAppearancePanelOpen}
              onDecreaseFontSize={decreaseFontSize}
              onIncreaseFontSize={increaseFontSize}
              onOpenChange={setIsAppearancePanelOpen}
              onResetReaderAppearance={resetReaderAppearance}
              onSelectReaderFont={setReaderFont}
              readerAppearance={readerAppearance}
            />
            <ChapterPromptBuilderControl
              chapterTitle={title}
              draftContent={content}
              isPromptBuilderDisabled={promptBuilder.isDisabled}
              parentChapter={promptBuilder.parentChapter}
              promptBuilderDisabledReason={
                promptBuilder.promptBuilderDisabledReason
              }
              storyTitle={promptBuilder.storyTitle}
              templateKind={promptBuilder.templateKind}
            />
            <Button
              aria-label="Dashboard"
              className="px-3"
              onClick={() => confirmNavigation(onOpenDashboard)}
              size="sm"
            >
              <Home aria-hidden="true" size={16} />
            </Button>
          </>
        }
        submittingActionLabel={submittingActionLabel}
        title={title}
        titleError={titleError}
        titlePlaceholder="Untitled chapter"
        toolbarContext={toolbarContext}
      />
    </>
  )
}
