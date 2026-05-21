import { formatGender } from '@/components/features/storyDetail/characterDisplay'
import type { Character } from '@/services/types'

interface Props {
  readonly character: Character
}

export function CharacterDetails({ character }: Props) {
  return (
    <div className="mt-5 grid gap-5">
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-tt-muted">Name</dt>
          <dd className="mt-1 text-base font-semibold text-tt-ink">
            {character.name}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-tt-muted">Gender</dt>
          <dd className="mt-1 text-base font-semibold text-tt-ink">
            {formatGender(character.gender)}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="text-lg font-semibold">Custom properties</h3>
        {character.properties.length === 0 ? (
          <p className="mt-2 text-sm text-tt-muted">
            No custom properties yet.
          </p>
        ) : (
          <dl className="mt-3 grid gap-3">
            {character.properties.map((property, index) => (
              <div
                className="rounded-lg border border-tt-line bg-tt-paper-deep/50 p-3"
                key={`${property.key}-${index}`}
              >
                <dt className="text-sm font-semibold text-tt-ink">
                  {property.key}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-tt-muted">
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
