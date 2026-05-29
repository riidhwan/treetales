import { useId, type ReactNode } from 'react'
import { Edit3 } from 'lucide-react'

import { ManagementTopBar } from '@/components/features/shared/ManagementTopBar'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import { IconButton } from '@/components/ui/IconButton'
import { commonCopy, storyDetailCopy } from '@/copy'
import {
  type CharacterDetailServices,
  useCharacterDetail,
} from '@/hooks/useCharacterDetail'

import { CharacterDetailContent } from './CharacterDetail/CharacterDetailContent'

interface Props {
  readonly characterId: string
  readonly onBackToStory: (storyId: string) => void
  readonly onEditCharacter: (storyId: string, characterId: string) => void
  readonly services?: CharacterDetailServices
  readonly storyId: string
}

export function CharacterDetail({
  characterId,
  onBackToStory,
  onEditCharacter,
  services,
  storyId,
}: Props) {
  const titleId = useId()
  const confirmationTitleId = useId()
  const characterDetail = useCharacterDetail({
    characterId,
    onDeleted: () => onBackToStory(storyId),
    services,
    storyId,
  })

  return (
    <main className="min-h-screen bg-background-app text-text-primary">
      <ManagementTopBar
        actions={renderCharacterDetailTopBarActions({
          characterDetail,
          onEditCharacter,
          storyId,
        })}
        label={storyDetailCopy.characterDetail.navigationLabel}
        onBack={() => onBackToStory(storyId)}
        previousLabel={storyDetailCopy.characterDetail.backToStory}
      />

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 py-8 sm:px-8">
        <CharacterDetailContent
          characterDetail={characterDetail}
          titleId={titleId}
        />
      </section>

      {characterDetail.confirmationState.mode === 'delete-character' &&
      characterDetail.character ? (
        <ConfirmationDialog
          confirmLabel={
            characterDetail.isDeleting
              ? commonCopy.actions.deleting
              : storyDetailCopy.actions.deleteCharacter
          }
          isConfirming={characterDetail.isDeleting}
          message={storyDetailCopy.character.deleteDialog.message(
            characterDetail.character.name,
          )}
          onCancel={characterDetail.cancelConfirmation}
          onConfirm={() => void characterDetail.confirmDeleteCharacter()}
          title={storyDetailCopy.character.deleteDialog.title}
          titleId={confirmationTitleId}
          variant="danger"
        />
      ) : null}

      {characterDetail.confirmationState.mode === 'delete-illustration' ? (
        <ConfirmationDialog
          confirmLabel={storyDetailCopy.actions.deleteIllustration}
          isConfirming={Boolean(characterDetail.activeIllustrationActionId)}
          message={
            storyDetailCopy.characterDetail.illustrations.deleteDialog.message
          }
          onCancel={characterDetail.cancelConfirmation}
          onConfirm={() => void characterDetail.confirmDeleteIllustration()}
          title={storyDetailCopy.characterDetail.illustrations.deleteDialog.title}
          titleId={confirmationTitleId}
          variant="danger"
        />
      ) : null}
    </main>
  )
}

function renderCharacterDetailTopBarActions({
  characterDetail,
  onEditCharacter,
  storyId,
}: {
  readonly characterDetail: ReturnType<typeof useCharacterDetail>
  readonly onEditCharacter: (storyId: string, characterId: string) => void
  readonly storyId: string
}): ReactNode {
  if (characterDetail.status !== 'ready' || !characterDetail.character) {
    return null
  }

  const { character } = characterDetail

  return (
    <IconButton
      label={commonCopy.actions.edit}
      onClick={() => onEditCharacter(storyId, character.id)}
      variant="ghost"
    >
      <Edit3 aria-hidden="true" size={18} />
    </IconButton>
  )
}
