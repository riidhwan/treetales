import { CharacterForm } from '@/components/features/shared/CharacterForm'
import { MANAGEMENT_DISPLAY_FONT } from '@/components/features/StoryDetail/StoryDetail/constants'
import { Alert } from '@/components/ui/Alert'
import { commonCopy, storyDetailCopy } from '@/copy'
import type { useCharacterCreator } from '@/hooks/useCharacterCreator'

interface Props {
  readonly characterCreator: ReturnType<typeof useCharacterCreator>
  readonly titleId: string
}

export function CharacterCreatorContent({
  characterCreator,
  titleId,
}: Props) {
  if (characterCreator.status === 'loading') {
    return (
      <Alert className="shadow-sm">
        {storyDetailCopy.characterCreator.loading}
      </Alert>
    )
  }

  if (characterCreator.status === 'error') {
    return (
      <Alert role="alert" variant="error">
        {characterCreator.errorMessage}
      </Alert>
    )
  }

  if (characterCreator.status === 'missing-story') {
    return (
      <Alert role="alert" variant="error">
        {commonCopy.messages.storyNotFound.body}
      </Alert>
    )
  }

  return (
    <>
      <header className="border-b border-border-subtle pb-6">
        <p className="text-sm font-semibold text-action-primary">
          {characterCreator.story?.title ?? commonCopy.actions.story}
        </p>
        <h1
          className="mt-2 text-4xl font-bold leading-tight text-text-primary"
          id={titleId}
          style={{ fontFamily: MANAGEMENT_DISPLAY_FONT }}
        >
          {storyDetailCopy.characterCreator.title}
        </h1>
      </header>

      {characterCreator.errorMessage ? (
        <Alert role="alert" variant="error">
          {characterCreator.errorMessage}
        </Alert>
      ) : null}

      <section
        aria-labelledby={titleId}
        className="border-b border-border-subtle pb-7"
      >
        <CharacterForm
          draft={characterCreator.draft}
          isSaving={characterCreator.isSaving}
          onAddProperty={characterCreator.addProperty}
          onGenderChange={characterCreator.setGender}
          onMoveProperty={characterCreator.moveProperty}
          onNameChange={characterCreator.setName}
          onPropertyChange={characterCreator.updateProperty}
          onRemoveProperty={characterCreator.removeProperty}
          onSave={() => void characterCreator.saveCharacter()}
        />
      </section>
    </>
  )
}
