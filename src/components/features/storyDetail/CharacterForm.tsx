import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'

import type { CharacterFormDraft } from '@/hooks/useStoryCharacters'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { IconButton } from '@/components/ui/IconButton'
import { TextArea } from '@/components/ui/TextArea'
import { TextInput } from '@/components/ui/TextInput'
import type { CharacterGender } from '@/services/types'

interface Props {
  readonly draft: CharacterFormDraft
  readonly isSaving: boolean
  readonly onAddProperty: () => void
  readonly onGenderChange: (gender: CharacterGender) => void
  readonly onMoveProperty: (propertyId: string, direction: -1 | 1) => void
  readonly onNameChange: (name: string) => void
  readonly onPropertyChange: (
    propertyId: string,
    input: Partial<{ key: string; value: string }>,
  ) => void
  readonly onRemoveProperty: (propertyId: string) => void
  readonly onSave: () => void
}

export function CharacterForm({
  draft,
  isSaving,
  onAddProperty,
  onGenderChange,
  onMoveProperty,
  onNameChange,
  onPropertyChange,
  onRemoveProperty,
  onSave,
}: Props) {
  return (
    <form
      className="mt-5 grid gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        onSave()
      }}
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <Field label="Name">
          <TextInput
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Mira"
            value={draft.name}
          />
        </Field>
        <Field label="Gender">
          <select
            className="min-h-11 rounded-md border border-tt-line bg-tt-paper px-3 text-base text-tt-ink outline-none transition focus:border-tt-moss focus:ring-2 focus:ring-tt-gold-soft"
            onChange={(event) =>
              onGenderChange(event.target.value as CharacterGender)
            }
            value={draft.gender}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </Field>
      </div>

      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Custom properties</h3>
          <Button onClick={onAddProperty} size="sm">
            <Plus aria-hidden="true" size={16} />
            Add Property
          </Button>
        </div>

        {draft.properties.length === 0 ? (
          <p className="rounded-lg border border-dashed border-tt-line p-4 text-sm text-tt-muted">
            No custom properties yet.
          </p>
        ) : (
          <div className="grid gap-3">
            {draft.properties.map((property, index) => (
              <div
                className="grid gap-3 rounded-lg border border-tt-line bg-tt-paper-deep/40 p-3"
                key={property.id}
              >
                <div className="grid items-start gap-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
                  <Field className="content-start" label="Key">
                    <TextInput
                      onChange={(event) =>
                        onPropertyChange(property.id, {
                          key: event.target.value,
                        })
                      }
                      placeholder="age"
                      value={property.key}
                    />
                  </Field>
                  <Field className="content-start" label="Value">
                    <TextArea
                      className="min-h-24"
                      onChange={(event) =>
                        onPropertyChange(property.id, {
                          value: event.target.value,
                        })
                      }
                      placeholder="32"
                      value={property.value}
                    />
                  </Field>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <IconButton
                    disabled={index === 0}
                    label={`Move ${property.key || 'property'} up`}
                    onClick={() => onMoveProperty(property.id, -1)}
                    size="sm"
                  >
                    <ArrowUp aria-hidden="true" size={16} />
                  </IconButton>
                  <IconButton
                    disabled={index === draft.properties.length - 1}
                    label={`Move ${property.key || 'property'} down`}
                    onClick={() => onMoveProperty(property.id, 1)}
                    size="sm"
                  >
                    <ArrowDown aria-hidden="true" size={16} />
                  </IconButton>
                  <Button
                    onClick={() => onRemoveProperty(property.id)}
                    size="sm"
                    variant="danger"
                  >
                    <Trash2 aria-hidden="true" size={16} />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isSaving ? (
          <p className="text-sm text-tt-muted">Saving character...</p>
        ) : null}
      </section>
    </form>
  )
}
