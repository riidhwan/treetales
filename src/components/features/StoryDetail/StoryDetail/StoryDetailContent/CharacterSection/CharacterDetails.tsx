import type { Character } from '@/services/types'

import { storyDetailCopy } from '@/copy'
import { formatGender } from './characterDisplay'

interface Props {
  readonly character: Character
}

export function CharacterDetails({ character }: Props) {
  return (
    <div className="mt-5">
      <dl className="grid gap-3">
        <div className="rounded-lg border border-border-subtle bg-surface-paper-deep/50 p-3">
          <dt className="text-sm font-semibold text-text-primary">
            {storyDetailCopy.character.details.gender}
          </dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-text-muted">
            {formatGender(character.gender)}
          </dd>
        </div>
        {character.properties.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">
            {storyDetailCopy.character.noCustomProperties}
          </p>
        ) : (
          <>
            {character.properties.map((property, index) => (
              <div
                className="rounded-lg border border-border-subtle bg-surface-paper-deep/50 p-3"
                key={`${property.key}-${index}`}
              >
                <dt className="text-sm font-semibold text-text-primary">
                  {property.key}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-text-muted">
                  {property.value}
                </dd>
              </div>
            ))}
          </>
        )}
      </dl>
    </div>
  )
}
