import type { Character } from '@/services/types'

import { storyDetailCopy } from '@/copy'
import { formatGender } from './characterDisplay'

interface Props {
  readonly character: Character
}

export function CharacterDetails({ character }: Props) {
  return (
    <div className="mt-5 grid gap-5">
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-text-muted">
            {storyDetailCopy.character.details.name}
          </dt>
          <dd className="mt-1 text-base font-semibold text-text-primary">
            {character.name}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-text-muted">
            {storyDetailCopy.character.details.gender}
          </dt>
          <dd className="mt-1 text-base font-semibold text-text-primary">
            {formatGender(character.gender)}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="text-lg font-semibold">
          {storyDetailCopy.character.customProperties}
        </h3>
        {character.properties.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">
            {storyDetailCopy.character.noCustomProperties}
          </p>
        ) : (
          <dl className="mt-3 grid gap-3">
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
          </dl>
        )}
      </section>
    </div>
  )
}
