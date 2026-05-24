import { Plus } from 'lucide-react'

import type { useStoryCharacters } from '@/hooks/useStoryCharacters'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { storyDetailCopy } from '@/copy'

import { CharacterConfirmationDialog } from './CharacterSection/CharacterConfirmationDialog'
import { CharacterDialogSlot } from './CharacterSection/CharacterDialogSlot'
import { CharacterListContent } from './CharacterSection/CharacterListContent'

type CharacterController = ReturnType<typeof useStoryCharacters>

interface Props {
  readonly characterDialog: CharacterController
  readonly titleId: string
}

export function CharacterSection({ characterDialog, titleId }: Props) {
  const confirmationTitleId = `${titleId}-confirmation`

  return (
    <>
      <section className="border-b border-border-subtle pb-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-action-primary">
              {storyDetailCopy.character.heading}
            </p>
          </div>
          <Button
            aria-label={storyDetailCopy.actions.addCharacter}
            className="rounded-full px-4"
            onClick={characterDialog.openCreateDialog}
            variant="primary"
          >
            <Plus aria-hidden="true" size={16} />
            {storyDetailCopy.storySummary.add}
          </Button>
        </div>

        {characterDialog.errorMessage &&
        characterDialog.dialogState.mode === 'closed' ? (
          <Alert className="mt-5" role="alert" variant="error">
            {characterDialog.errorMessage}
          </Alert>
        ) : null}

        <CharacterListContent characterDialog={characterDialog} />
      </section>

      <CharacterDialogSlot
        characterDialog={characterDialog}
        titleId={titleId}
      />

      <CharacterConfirmationDialog
        characterDialog={characterDialog}
        titleId={confirmationTitleId}
      />
    </>
  )
}
