import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'

import type { CharacterFormDraft } from '@/hooks/useStoryCharacters'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { IconButton } from '@/components/ui/IconButton'
import { TextArea } from '@/components/ui/TextArea'
import { TextInput } from '@/components/ui/TextInput'
import { commonCopy, storyDetailCopy } from '@/copy'
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
        <Field label={storyDetailCopy.character.labels.name}>
          <TextInput
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={storyDetailCopy.character.placeholders.name}
            value={draft.name}
          />
        </Field>
        <Field label={storyDetailCopy.character.labels.gender}>
          <select
            className="min-h-11 rounded-md border border-border-subtle bg-surface-paper px-3 text-base text-text-primary outline-none transition focus:border-action-primary focus:ring-2 focus:ring-highlight-soft"
            onChange={(event) =>
              onGenderChange(event.target.value as CharacterGender)
            }
            value={draft.gender}
          >
            <option value="female">{storyDetailCopy.character.gender.female}</option>
            <option value="male">{storyDetailCopy.character.gender.male}</option>
          </select>
        </Field>
      </div>

      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">
            {storyDetailCopy.character.customProperties}
          </h3>
          <Button onClick={onAddProperty} size="sm">
            <Plus aria-hidden="true" size={16} />
            {storyDetailCopy.character.addProperty}
          </Button>
        </div>

        {draft.properties.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border-subtle p-4 text-sm text-text-muted">
            {storyDetailCopy.character.noCustomProperties}
          </p>
        ) : (
          <div className="grid gap-3">
            {draft.properties.map((property, index) => (
              <div
                className="grid gap-3 rounded-lg border border-border-subtle bg-surface-paper-deep/40 p-3"
                key={property.id}
              >
                <div className="grid items-start gap-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
                  <Field
                    className="content-start"
                    label={storyDetailCopy.character.labels.key}
                  >
                    <TextInput
                      onChange={(event) =>
                        onPropertyChange(property.id, {
                          key: event.target.value,
                        })
                      }
                      placeholder={storyDetailCopy.character.placeholders.key}
                      value={property.key}
                    />
                  </Field>
                  <Field
                    className="content-start"
                    label={storyDetailCopy.character.labels.value}
                  >
                    <TextArea
                      className="min-h-24"
                      onChange={(event) =>
                        onPropertyChange(property.id, {
                          value: event.target.value,
                        })
                      }
                      placeholder={storyDetailCopy.character.placeholders.value}
                      value={property.value}
                    />
                  </Field>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <IconButton
                    disabled={index === 0}
                    label={storyDetailCopy.character.moveUp(property.key)}
                    onClick={() => onMoveProperty(property.id, -1)}
                    size="sm"
                  >
                    <ArrowUp aria-hidden="true" size={16} />
                  </IconButton>
                  <IconButton
                    disabled={index === draft.properties.length - 1}
                    label={storyDetailCopy.character.moveDown(property.key)}
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
                    {commonCopy.actions.remove}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isSaving ? (
          <p className="text-sm text-text-muted">
            {storyDetailCopy.actions.savingCharacter}
          </p>
        ) : null}
      </section>
    </form>
  )
}
