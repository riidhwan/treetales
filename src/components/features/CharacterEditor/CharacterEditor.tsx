import { useEffect, useId, useState } from 'react'
import { Save } from 'lucide-react'

import { ManagementTopBar } from '@/components/features/shared/ManagementTopBar'
import { Button } from '@/components/ui/Button'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import { commonCopy, storyDetailCopy } from '@/copy'
import {
  type CharacterEditorServices,
  useCharacterEditor,
} from '@/hooks/useCharacterEditor'

import { CharacterEditorContent } from './CharacterEditorContent'

interface Props {
  readonly characterId: string
  readonly onBackToCharacter: (storyId: string, characterId: string) => void
  readonly services?: CharacterEditorServices
  readonly storyId: string
}

export function CharacterEditor({
  characterId,
  onBackToCharacter,
  services,
  storyId,
}: Props) {
  const confirmationTitleId = useId()
  const titleId = useId()
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | undefined
  >()
  const characterEditor = useCharacterEditor({
    characterId,
    onSaved: () => onBackToCharacter(storyId, characterId),
    services,
    storyId,
  })

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!characterEditor.hasUnsavedChanges) {
        return
      }

      event.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [characterEditor.hasUnsavedChanges])

  function requestNavigation(navigate: () => void) {
    if (!characterEditor.hasUnsavedChanges) {
      navigate()
      return
    }

    setPendingNavigation(() => navigate)
  }

  function cancelPendingNavigation() {
    setPendingNavigation(undefined)
  }

  function confirmPendingNavigation() {
    const navigate = pendingNavigation
    setPendingNavigation(undefined)
    navigate?.()
  }

  return (
    <main className="min-h-screen bg-background-app text-text-primary">
      <ManagementTopBar
        actions={
          characterEditor.status === 'ready' ? (
            <>
              <Button
                onClick={() =>
                  requestNavigation(() =>
                    onBackToCharacter(storyId, characterId),
                  )
                }
              >
                {commonCopy.actions.cancel}
              </Button>
              <Button
                disabled={!characterEditor.canSave || characterEditor.isSaving}
                onClick={() => void characterEditor.saveCharacter()}
                variant="primary"
              >
                <Save aria-hidden="true" size={18} />
                {characterEditor.isSaving
                  ? commonCopy.actions.saving
                  : commonCopy.actions.save}
              </Button>
            </>
          ) : null
        }
        label={storyDetailCopy.characterEditor.navigationLabel}
        onBack={() =>
          requestNavigation(() => onBackToCharacter(storyId, characterId))
        }
        previousLabel={storyDetailCopy.characterEditor.backToCharacter}
      />

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 py-8 sm:px-8">
        <CharacterEditorContent
          characterEditor={characterEditor}
          titleId={titleId}
        />
      </section>

      {pendingNavigation ? (
        <ConfirmationDialog
          confirmLabel={storyDetailCopy.actions.discardChanges}
          message={storyDetailCopy.character.discardDialog.message}
          onCancel={cancelPendingNavigation}
          onConfirm={confirmPendingNavigation}
          title={storyDetailCopy.character.discardDialog.title}
          titleId={confirmationTitleId}
          variant="danger"
        />
      ) : null}
    </main>
  )
}
