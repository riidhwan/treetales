import { CharacterDetails } from '@/components/features/StoryDetail/StoryDetail/StoryDetailContent/CharacterSection/CharacterDetails'
import { MANAGEMENT_DISPLAY_FONT } from '@/components/features/StoryDetail/StoryDetail/constants'
import { Alert } from '@/components/ui/Alert'
import { commonCopy, storyDetailCopy } from '@/copy'
import type { useCharacterDetail } from '@/hooks/useCharacterDetail'

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
        <h1
          className="mt-2 truncate text-4xl font-bold leading-tight text-text-primary"
          id={titleId}
          style={{ fontFamily: MANAGEMENT_DISPLAY_FONT }}
        >
          {character.name}
        </h1>
      </header>

      <section
        aria-labelledby={titleId}
        className="border-b border-border-subtle pb-7"
      >
        <CharacterDetails character={character} />
      </section>
    </>
  )
}
