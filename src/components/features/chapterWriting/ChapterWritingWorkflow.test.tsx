import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { SyntheticEvent } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Save } from 'lucide-react'

import { ChapterWritingWorkflow } from '@/components/features/chapterWriting'
import { READER_APPEARANCE_STORAGE_KEY } from '@/config'

function renderWorkflow({
  hasNavigationWarning = false,
  onGoBack = vi.fn(),
  onOpenDashboard = vi.fn(),
  onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
  },
  onSubmitShortcut,
}: {
  readonly hasNavigationWarning?: boolean
  readonly onGoBack?: () => void
  readonly onOpenDashboard?: () => void
  readonly onSubmit?: (event: SyntheticEvent<HTMLFormElement>) => void
  readonly onSubmitShortcut?: () => void
} = {}) {
  return render(
    <ChapterWritingWorkflow
      canSubmit
      content="The path begins here."
      hasNavigationWarning={hasNavigationWarning}
      isSubmitting={false}
      navigationWarningMessage="Discard changes?"
      onContentChange={vi.fn()}
      onGoBack={onGoBack}
      onOpenDashboard={onOpenDashboard}
      onSubmit={onSubmit}
      onSubmitShortcut={onSubmitShortcut}
      onTitleChange={vi.fn()}
      primaryActionIcon={<Save aria-hidden="true" size={16} />}
      primaryActionLabel="Save"
      promptBuilder={{
        parentChapter: {
          content: 'The gate opens.',
          title: 'The Gate',
        },
        storyTitle: 'The Old Road',
        templateKind: 'branch',
      }}
      submittingActionLabel="Saving..."
      title="The Cellar"
      toolbarContext="The Old Road"
    />,
  )
}

describe('ChapterWritingWorkflow', () => {
  afterEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('centralizes Reader Appearance for writing document text', async () => {
    window.localStorage.setItem(
      READER_APPEARANCE_STORAGE_KEY,
      JSON.stringify({ fontId: 'nv-jost', fontSizePt: 18 }),
    )

    renderWorkflow()

    await waitFor(() => {
      expect(screen.getByLabelText('Title').parentElement?.style.fontFamily)
        .toContain('NV Jost')
    })
    expect(screen.getByLabelText('Content').style.fontSize).toBe('18pt')
    expect(screen.getByRole('button', { name: 'Writing Assist' }))
      .toBeTruthy()
  })

  it('confirms guarded navigation and prevents beforeunload', () => {
    const onGoBack = vi.fn()
    const onOpenDashboard = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderWorkflow({
      hasNavigationWarning: true,
      onGoBack,
      onOpenDashboard,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }))

    expect(confirmSpy).toHaveBeenCalledTimes(2)
    expect(onGoBack).not.toHaveBeenCalled()
    expect(onOpenDashboard).not.toHaveBeenCalled()

    const unloadEvent = new Event('beforeunload', { cancelable: true })
    const preventDefault = vi.spyOn(unloadEvent, 'preventDefault')
    window.dispatchEvent(unloadEvent)

    expect(preventDefault).toHaveBeenCalled()
  })

  it('only binds the save shortcut when a shortcut handler is provided', () => {
    const onSubmitShortcut = vi.fn()

    renderWorkflow()
    fireEvent.keyDown(window, { ctrlKey: true, key: 's' })
    expect(onSubmitShortcut).not.toHaveBeenCalled()

    cleanup()
    renderWorkflow({ onSubmitShortcut })
    fireEvent.keyDown(window, { metaKey: true, key: 's' })

    expect(onSubmitShortcut).toHaveBeenCalled()
  })
})
