import { Trash2 } from 'lucide-react'

import { CharacterDetails } from '@/components/features/StoryDetail/StoryDetail/StoryDetailContent/CharacterSection/CharacterDetails'
import { CharacterForm } from '@/components/features/shared/CharacterForm'
import { MANAGEMENT_DISPLAY_FONT } from '@/components/features/StoryDetail/StoryDetail/constants'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { commonCopy, storyDetailCopy } from '@/copy'
import type { useCharacterDetail } from '@/hooks/useCharacterDetail'

import { CharacterIllustrationSection } from './CharacterIllustrationSection'

interface Props {
  readonly characterDetail: ReturnType<typeof useCharacterDetail>
  readonly titleId: string
}

export function CharacterDetailContent({
  characterDetail,
  titleId,
}: Props) {
  if (characterDetail.status === 'loading') {
    return (
      <Alert className="shadow-sm">
        {storyDetailCopy.characterDetail.loading}
      </Alert>
    )
  }

  if (characterDetail.status === 'error') {
    return (
      <Alert role="alert" variant="error">
        {characterDetail.errorMessage}
      </Alert>
    )
  }

  if (characterDetail.status === 'missing-story') {
    return (
      <Alert role="alert" variant="error">
        {commonCopy.messages.storyNotFound.body}
      </Alert>
    )
  }

  if (characterDetail.status === 'missing-character') {
    return (
      <Alert role="alert" variant="error">
        {storyDetailCopy.character.missing}
      </Alert>
    )
  }

  if (!characterDetail.character) {
    return null
  }

  const { character, story } = characterDetail

  return (
    <>
      <header className="border-b border-border-subtle pb-6">
        <p className="text-sm font-semibold text-action-primary">
          {story?.title ?? commonCopy.actions.story}
        </p>
        <div className="mt-2">
          <div className="min-w-0">
            <h1
              className="truncate text-4xl font-bold leading-tight text-text-primary"
              id={titleId}
              style={{ fontFamily: MANAGEMENT_DISPLAY_FONT }}
            >
              {character.name}
            </h1>
          </div>
        </div>
      </header>

      {characterDetail.errorMessage ? (
        <Alert role="alert" variant="error">
          {characterDetail.errorMessage}
        </Alert>
      ) : null}

      <section
        aria-labelledby={titleId}
        className="border-b border-border-subtle pb-7"
      >
        {characterDetail.isEditing ? (
          <div className="grid gap-7">
            <CharacterForm
              draft={characterDetail.draft}
              isSaving={characterDetail.isSaving}
              onAddProperty={characterDetail.addProperty}
              onGenderChange={characterDetail.setGender}
              onMoveProperty={characterDetail.moveProperty}
              onNameChange={characterDetail.setName}
              onPropertyChange={characterDetail.updateProperty}
              onRemoveProperty={characterDetail.removeProperty}
              onSave={() => void characterDetail.saveCharacter()}
            />
            <section className="overflow-hidden rounded-2xl border border-action-destructive/25 bg-state-destructive-soft/25">
              <div className="px-4 py-4 sm:px-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-action-destructive">
                  {storyDetailCopy.maintenance.title}
                </p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted">
                  {storyDetailCopy.characterDetail.deleteWarning}
                </p>
              </div>
              <div className="border-t border-action-destructive/20 bg-surface-paper/35 px-4 py-3 sm:px-5">
                <Button
                  className="w-full border-0 bg-transparent text-sm shadow-none hover:bg-state-destructive-soft/60 sm:min-h-11"
                  disabled={characterDetail.isDeleting}
                  onClick={characterDetail.requestDeleteCharacter}
                  variant="danger"
                >
                  <Trash2 aria-hidden="true" size={16} />
                  {characterDetail.isDeleting
                    ? commonCopy.actions.deleting
                    : storyDetailCopy.actions.deleteCharacter}
                </Button>
              </div>
            </section>
          </div>
        ) : (
          <CharacterDetails character={character} />
        )}
      </section>

      <CharacterIllustrationSection characterDetail={characterDetail} />
    </>
  )
}
