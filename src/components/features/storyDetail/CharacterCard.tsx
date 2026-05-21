import { formatGender } from '@/components/features/storyDetail/characterDisplay'
import type { Character } from '@/services/types'

interface Props {
  readonly character: Character
  readonly onOpen: (character: Character) => void
}

export function CharacterCard({ character, onOpen }: Props) {
  return (
    <button
      aria-label={`View ${character.name}`}
      className="flex h-52 flex-col items-stretch justify-start overflow-hidden rounded-lg border border-tt-line bg-tt-paper-deep/60 p-4 text-left transition hover:border-tt-gold hover:bg-tt-gold-soft/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-gold"
      onClick={() => onOpen(character)}
      type="button"
    >
      <span className="block truncate text-lg font-semibold text-tt-ink">
        {character.name}
      </span>
      <span className="mt-1 block text-sm font-medium text-tt-muted">
        {formatGender(character.gender)}
      </span>
      <span className="mt-4 grid gap-1">
        {character.properties.slice(0, 3).map((property, index) => (
          <span
            className="grid grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] gap-2 text-sm"
            key={`${property.key}-${index}`}
          >
            <span className="truncate font-medium text-tt-ink">
              {property.key}
            </span>
            <span className="truncate text-tt-muted">{property.value}</span>
          </span>
        ))}
        {character.properties.length > 3 ? (
          <span className="mt-1 text-sm font-medium text-tt-moss">
            +{character.properties.length - 3} more
          </span>
        ) : null}
      </span>
    </button>
  )
}
