import { useEffect, useId, useState } from 'react'
import { Save } from 'lucide-react'

import { ManagementTopBar } from '@/components/features/shared/ManagementTopBar'
import { Button } from '@/components/ui/Button'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import { commonCopy, storyDetailCopy } from '@/copy'
import {
  type CharacterCreatorServices,
  useCharacterCreator,
} from '@/hooks/useCharacterCreator'

import { CharacterCreatorContent } from './CharacterCreatorContent'

interface Props {
  readonly onBackToStory: (storyId: string) => void
  readonly onCreated: (storyId: string, characterId: string) => void
  readonly services?: CharacterCreatorServices
  readonly storyId: string
}

export function CharacterCreator({
  onBackToStory,
  onCreated,
  services,
  storyId,
}: Props) {
  const confirmationTitleId = useId()
  const titleId = useId()
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | undefined
  >()
  const characterCreator = useCharacterCreator({
    onCreated: (characterId) => onCreated(storyId, characterId),
    services,
    storyId,
  })

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!characterCreator.hasUnsavedChanges) {
        return
      }

      event.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [characterCreator.hasUnsavedChanges])

  function requestNavigation(navigate: () => void) {
    if (!characterCreator.hasUnsavedChanges) {
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
          characterCreator.status === 'ready' ? (
            <>
              <Button
                onClick={() => requestNavigation(() => onBackToStory(storyId))}
              >
                {commonCopy.actions.cancel}
              </Button>
              <Button
                disabled={!characterCreator.canSave || characterCreator.isSaving}
                onClick={() => void characterCreator.saveCharacter()}
                variant="primary"
              >
                <Save aria-hidden="true" size={18} />
                {characterCreator.isSaving
                  ? commonCopy.actions.saving
                  : commonCopy.actions.save}
              </Button>
            </>
          ) : null
        }
        label={storyDetailCopy.characterCreator.navigationLabel}
        onBack={() => requestNavigation(() => onBackToStory(storyId))}
        previousLabel={storyDetailCopy.characterDetail.backToStory}
      />

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 py-8 sm:px-8">
        <CharacterCreatorContent
          characterCreator={characterCreator}
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
