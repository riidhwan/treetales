import { useId } from 'react'

import { ManagementTopBar } from '@/components/features/shared/ManagementTopBar'
import { storyDetailCopy } from '@/copy'
import {
  type CharacterDetailServices,
  useCharacterDetail,
} from '@/hooks/useCharacterDetail'

import { CharacterDetailContent } from './CharacterDetail/CharacterDetailContent'

interface Props {
  readonly characterId: string
  readonly onBackToStory: (storyId: string) => void
  readonly services?: CharacterDetailServices
  readonly storyId: string
}

export function CharacterDetail({
  characterId,
  onBackToStory,
  services,
  storyId,
}: Props) {
  const titleId = useId()
  const characterDetail = useCharacterDetail({
    characterId,
    services,
    storyId,
  })

  return (
    <main className="min-h-screen bg-background-app text-text-primary">
      <ManagementTopBar
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
    </main>
  )
}
