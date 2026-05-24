import { Plus } from 'lucide-react'

import { CharacterConfirmationDialog } from '@/components/features/StoryDetail/CharacterConfirmationDialog'
import { CharacterDialogSlot } from '@/components/features/StoryDetail/CharacterDialogSlot'
import { CharacterListContent } from '@/components/features/StoryDetail/CharacterListContent'
import type { useStoryCharacters } from '@/hooks/useStoryCharacters'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

type CharacterController = ReturnType<typeof useStoryCharacters>

interface Props {
  readonly characterDialog: CharacterController
  readonly titleId: string
}

export function CharacterSection({ characterDialog, titleId }: Props) {
  const confirmationTitleId = `${titleId}-confirmation`

  return (
    <>
      <section className="border-b border-border-subtle pb-9">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-action-primary">
              Characters
            </p>
          </div>
          <Button
            aria-label="Add Character"
            className="rounded-full px-5"
            onClick={characterDialog.openCreateDialog}
            variant="primary"
          >
            <Plus aria-hidden="true" size={18} />
            Add
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
