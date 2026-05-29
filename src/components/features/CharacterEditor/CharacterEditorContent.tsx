import { CharacterForm } from '@/components/features/shared/CharacterForm'
import { MANAGEMENT_DISPLAY_FONT } from '@/components/features/StoryDetail/StoryDetail/constants'
import { Alert } from '@/components/ui/Alert'
import { commonCopy, storyDetailCopy } from '@/copy'
import type { useCharacterEditor } from '@/hooks/useCharacterEditor'

interface Props {
  readonly characterEditor: ReturnType<typeof useCharacterEditor>
  readonly titleId: string
}

export function CharacterEditorContent({
  characterEditor,
  titleId,
}: Props) {
  if (characterEditor.status === 'loading') {
    return (
      <Alert className="shadow-sm">
        {storyDetailCopy.characterEditor.loading}
      </Alert>
    )
  }

  if (characterEditor.status === 'error') {
    return (
      <Alert role="alert" variant="error">
        {characterEditor.errorMessage}
      </Alert>
    )
  }

  if (characterEditor.status === 'missing-story') {
    return (
      <Alert role="alert" variant="error">
        {commonCopy.messages.storyNotFound.body}
      </Alert>
    )
  }

  if (characterEditor.status === 'missing-character') {
    return (
      <Alert role="alert" variant="error">
        {storyDetailCopy.character.missing}
      </Alert>
    )
  }

  return (
    <>
      <header className="border-b border-border-subtle pb-6">
        <p className="text-sm font-semibold text-action-primary">
          {characterEditor.story?.title ?? commonCopy.actions.story}
        </p>
        <h1
          className="mt-2 text-4xl font-bold leading-tight text-text-primary"
          id={titleId}
          style={{ fontFamily: MANAGEMENT_DISPLAY_FONT }}
        >
          {storyDetailCopy.characterEditor.title(
            characterEditor.character?.name ?? '',
          )}
        </h1>
      </header>

      {characterEditor.errorMessage ? (
        <Alert role="alert" variant="error">
          {characterEditor.errorMessage}
        </Alert>
      ) : null}

      <section
        aria-labelledby={titleId}
        className="border-b border-border-subtle pb-7"
      >
        <CharacterForm
          draft={characterEditor.draft}
          isSaving={characterEditor.isSaving}
          onAddProperty={characterEditor.addProperty}
          onGenderChange={characterEditor.setGender}
          onMoveProperty={characterEditor.moveProperty}
          onNameChange={characterEditor.setName}
          onPropertyChange={characterEditor.updateProperty}
          onRemoveProperty={characterEditor.removeProperty}
          onSave={() => void characterEditor.saveCharacter()}
        />
      </section>
    </>
  )
}
