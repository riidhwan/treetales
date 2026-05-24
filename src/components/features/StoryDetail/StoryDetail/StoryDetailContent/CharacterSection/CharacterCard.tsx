import type { Character } from '@/services/types'

import { MANAGEMENT_DISPLAY_FONT } from '@/components/features/StoryDetail/StoryDetail/constants'
import { storyDetailCopy } from '@/copy'
import { formatGender } from './characterDisplay'

interface Props {
  readonly character: Character
  readonly onOpen: (character: Character) => void
}

export function CharacterCard({ character, onOpen }: Props) {
  return (
    <button
      aria-label={storyDetailCopy.actions.viewCharacter(character.name)}
      className="flex min-h-44 flex-col items-stretch justify-start overflow-hidden rounded-3xl border border-border-subtle bg-surface-paper/60 p-5 text-left transition hover:border-focus-ring hover:bg-highlight-soft/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:h-52"
      onClick={() => onOpen(character)}
      type="button"
    >
      <span className="flex items-start justify-between gap-4">
        <span
          className="block min-w-0 truncate text-3xl font-bold leading-tight text-text-primary"
          style={{ fontFamily: MANAGEMENT_DISPLAY_FONT }}
        >
          {character.name}
        </span>
        <span className="shrink-0 rounded-full bg-border-subtle/45 px-3 py-1 text-sm font-medium leading-none text-text-muted">
          {formatGender(character.gender)}
        </span>
      </span>
      <span className="mt-6 grid gap-2">
        {character.properties.slice(0, 3).map((property, index) => (
          <span
            className="grid grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] gap-4 text-sm sm:gap-2"
            key={`${property.key}-${index}`}
          >
            <span className="truncate font-semibold text-text-muted/65">
              {property.key}
            </span>
            <span className="truncate text-text-primary">{property.value}</span>
          </span>
        ))}
        {character.properties.length > 3 ? (
          <span className="mt-1 text-sm font-semibold text-action-primary">
            {storyDetailCopy.character.propertyCountMore(
              character.properties.length - 3,
            )}
          </span>
        ) : null}
      </span>
    </button>
  )
}
