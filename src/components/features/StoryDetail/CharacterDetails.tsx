import { formatGender } from '@/components/features/StoryDetail/characterDisplay'
import type { Character } from '@/services/types'

interface Props {
  readonly character: Character
}

export function CharacterDetails({ character }: Props) {
  return (
    <div className="mt-5 grid gap-5">
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-text-muted">Name</dt>
          <dd className="mt-1 text-base font-semibold text-text-primary">
            {character.name}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-text-muted">Gender</dt>
          <dd className="mt-1 text-base font-semibold text-text-primary">
            {formatGender(character.gender)}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="text-lg font-semibold">Custom properties</h3>
        {character.properties.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">
            No custom properties yet.
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
