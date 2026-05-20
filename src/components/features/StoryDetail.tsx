import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Edit3,
  Home,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { useId } from 'react'

import {
  type CharacterDialogState,
  type CharacterFormDraft,
  type StoryCharacterServices,
  useStoryCharacters,
} from '@/hooks/useStoryCharacters'
import {
  type StoryDetailServices,
  useStoryDetail,
} from '@/hooks/useStoryDetail'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'
import { TextInput } from '@/components/ui/TextInput'
import type { Character, CharacterGender } from '@/services/types'

interface Props {
  readonly characterServices?: StoryCharacterServices
  readonly onDeleted: () => void
  readonly onEditStory: (storyId: string) => void
  readonly onOpenDashboard: () => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryDetailServices
  readonly storyId: string
}

type CharacterController = ReturnType<typeof useStoryCharacters>

export function StoryDetail({
  characterServices,
  onDeleted,
  onEditStory,
  onOpenDashboard,
  onReadStory,
  services,
  storyId,
}: Props) {
  const {
    deleteStoryWithConfirmation,
    errorMessage,
    isDeleting,
    status,
    story,
  } = useStoryDetail({ onDeleted, services, storyId })
  const characterTitleId = useId()
  const characterDialog = useStoryCharacters({
    enabled: status === 'ready' && Boolean(story),
    services: characterServices,
    storyId,
  })

  let detailContent: React.ReactNode = null

  if (status === 'loading') {
    detailContent = <Alert className="shadow-sm">Loading story...</Alert>
  } else if (status === 'error') {
    detailContent = (
      <Alert role="alert" variant="error">
        {errorMessage}
      </Alert>
    )
  } else if (status === 'missing-story') {
    detailContent = (
      <section className="rounded-lg border border-tt-line bg-tt-paper p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <p className="mt-3 text-sm leading-6 text-tt-muted">
          This story may have been deleted or is unavailable in this browser.
        </p>
        <Button className="mt-5" onClick={onOpenDashboard} size="sm">
          <Home aria-hidden="true" size={16} />
          Dashboard
        </Button>
      </section>
    )
  } else if (story) {
    detailContent = (
      <>
        {errorMessage ? (
          <Alert role="alert" variant="error">
            {errorMessage}
          </Alert>
        ) : null}

        <article className="border-b border-tt-line pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
            Story summary
          </p>
          <p className="mt-4 text-sm leading-6 text-tt-muted sm:text-base">
            {story.description || 'No description yet.'}
          </p>
        </article>

        <CharacterSection
          characterDialog={characterDialog}
          titleId={characterTitleId}
        />

        <StoryMaintenanceSection
          isDeleting={isDeleting}
          onDelete={() => void deleteStoryWithConfirmation()}
        />
      </>
    )
  }

  return (
    <main className="min-h-screen bg-tt-parchment text-tt-ink">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
        {story ? (
          <header className="border-b border-tt-line pb-6">
            <nav aria-label="Story detail navigation">
              <Button onClick={onOpenDashboard} size="sm">
                <Home aria-hidden="true" size={16} />
                Dashboard
              </Button>
            </nav>
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
                  Story
                </p>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                  {story.title || 'Untitled story'}
                </h1>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => onReadStory(story.id)}
                  variant="primary"
                >
                  <BookOpen aria-hidden="true" size={18} />
                  Read
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => onEditStory(story.id)}
                >
                  <Edit3 aria-hidden="true" size={18} />
                  Edit
                </Button>
              </div>
            </div>
          </header>
        ) : (
          <nav
            aria-label="Story detail navigation"
            className="flex flex-wrap justify-between gap-3"
          >
            <Button onClick={onOpenDashboard} size="sm">
              <Home aria-hidden="true" size={16} />
              Dashboard
            </Button>
          </nav>
        )}

        {detailContent}
      </section>
    </main>
  )
}

interface StoryMaintenanceSectionProps {
  readonly isDeleting: boolean
  readonly onDelete: () => void
}

function StoryMaintenanceSection({
  isDeleting,
  onDelete,
}: StoryMaintenanceSectionProps) {
  return (
    <section className="border-t border-tt-line pt-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-tt-muted">
        Story maintenance
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-6 text-tt-muted">
          Delete this Story and all of its Chapters and Characters.
        </p>
        <Button
          className="w-full sm:w-auto"
          disabled={isDeleting}
          onClick={onDelete}
          size="sm"
          variant="danger"
        >
          <Trash2 aria-hidden="true" size={16} />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </section>
  )
}

interface CharacterSectionProps {
  readonly characterDialog: CharacterController
  readonly titleId: string
}

function CharacterSection({
  characterDialog,
  titleId,
}: CharacterSectionProps) {
  let charactersContent: React.ReactNode

  if (characterDialog.isLoading) {
    charactersContent = <Alert className="mt-5">Loading characters...</Alert>
  } else if (characterDialog.characters.length === 0) {
    charactersContent = (
      <div className="mt-5 rounded-lg border border-dashed border-tt-line bg-tt-paper-deep/40 p-6 text-center">
        <h3 className="text-lg font-semibold">No characters yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-tt-muted">
          Add character cards for the people in this story.
        </p>
      </div>
    )
  } else {
    charactersContent = (
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {characterDialog.characters.map((character) => (
          <CharacterCard
            character={character}
            key={character.id}
            onOpen={characterDialog.openViewDialog}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <section className="pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
              Characters
            </p>
            <h2 className="mt-2 text-2xl font-bold">Story characters</h2>
          </div>
          <Button onClick={characterDialog.openCreateDialog} variant="primary">
            <Plus aria-hidden="true" size={18} />
            Add Character
          </Button>
        </div>

        {characterDialog.errorMessage &&
        characterDialog.dialogState.mode === 'closed' ? (
          <Alert className="mt-5" role="alert" variant="error">
            {characterDialog.errorMessage}
          </Alert>
        ) : null}

        {charactersContent}
      </section>

      {characterDialog.dialogState.mode !== 'closed' ? (
        <CharacterDialog
          dialogState={characterDialog.dialogState}
          draft={characterDialog.draft}
          errorMessage={characterDialog.errorMessage}
          isDeleting={characterDialog.isDeleting}
          isSaving={characterDialog.isSaving}
          onAddProperty={characterDialog.addProperty}
          onClose={characterDialog.requestCloseDialog}
          onDelete={() => void characterDialog.deleteSelectedCharacter()}
          onEdit={characterDialog.openEditDialog}
          onGenderChange={characterDialog.setGender}
          onMoveProperty={characterDialog.moveProperty}
          onNameChange={characterDialog.setName}
          onPropertyChange={characterDialog.updateProperty}
          onRemoveProperty={characterDialog.removeProperty}
          onSave={() => void characterDialog.saveCharacter()}
          titleId={titleId}
        />
      ) : null}
    </>
  )
}

interface CharacterCardProps {
  readonly character: Character
  readonly onOpen: (character: Character) => void
}

function CharacterCard({ character, onOpen }: CharacterCardProps) {
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

interface CharacterDialogProps {
  readonly dialogState: Exclude<CharacterDialogState, { mode: 'closed' }>
  readonly draft: CharacterFormDraft
  readonly errorMessage?: string
  readonly isDeleting: boolean
  readonly isSaving: boolean
  readonly onAddProperty: () => void
  readonly onClose: () => void
  readonly onDelete: () => void
  readonly onEdit: (character: Character) => void
  readonly onGenderChange: (gender: CharacterGender) => void
  readonly onMoveProperty: (propertyId: string, direction: -1 | 1) => void
  readonly onNameChange: (name: string) => void
  readonly onPropertyChange: (
    propertyId: string,
    input: Partial<{ key: string; value: string }>,
  ) => void
  readonly onRemoveProperty: (propertyId: string) => void
  readonly onSave: () => void
  readonly titleId: string
}

function CharacterDialog({
  dialogState,
  draft,
  errorMessage,
  isDeleting,
  isSaving,
  onAddProperty,
  onClose,
  onDelete,
  onEdit,
  onGenderChange,
  onMoveProperty,
  onNameChange,
  onPropertyChange,
  onRemoveProperty,
  onSave,
  titleId,
}: CharacterDialogProps) {
  const isForm = dialogState.mode === 'create' || dialogState.mode === 'edit'
  const title = getCharacterDialogTitle(dialogState)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-tt-ink/45 px-4 py-6">
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-tt-line bg-tt-paper p-5 shadow-xl sm:p-6"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
              Character
            </p>
            <h2 className="mt-1 text-2xl font-bold" id={titleId}>
              {title}
            </h2>
          </div>
          <Button aria-label="Close character dialog" onClick={onClose} size="sm">
            <X aria-hidden="true" size={16} />
          </Button>
        </div>

        {errorMessage ? (
          <Alert className="mt-5" role="alert" variant="error">
            {errorMessage}
          </Alert>
        ) : null}

        {isForm ? (
          <CharacterForm
            draft={draft}
            isSaving={isSaving}
            onAddProperty={onAddProperty}
            onGenderChange={onGenderChange}
            onMoveProperty={onMoveProperty}
            onNameChange={onNameChange}
            onPropertyChange={onPropertyChange}
            onRemoveProperty={onRemoveProperty}
            onSave={onSave}
          />
        ) : (
          <CharacterDetails character={dialogState.character} />
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {dialogState.mode === 'view' ? (
            <>
              <Button onClick={() => onEdit(dialogState.character)}>
                <Edit3 aria-hidden="true" size={18} />
                Edit
              </Button>
              <Button disabled={isDeleting} onClick={onDelete} variant="danger">
                <Trash2 aria-hidden="true" size={18} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          ) : null}
          {isForm ? (
            <>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                disabled={draft.name.trim().length === 0 || isSaving}
                onClick={onSave}
                variant="primary"
              >
                <Save aria-hidden="true" size={18} />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}

interface CharacterFormProps {
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

function CharacterForm({
  draft,
  isSaving,
  onAddProperty,
  onGenderChange,
  onMoveProperty,
  onNameChange,
  onPropertyChange,
  onRemoveProperty,
  onSave,
}: CharacterFormProps) {
  return (
    <form
      className="mt-5 grid gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        onSave()
      }}
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="grid gap-2 text-sm font-medium text-tt-ink">
          Name
          <TextInput
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Mira"
            value={draft.name}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-tt-ink">
          Gender
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
        </label>
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
                  <label className="grid content-start gap-2 text-sm font-medium text-tt-ink">
                    Key
                    <TextInput
                      onChange={(event) =>
                        onPropertyChange(property.id, {
                          key: event.target.value,
                        })
                      }
                      placeholder="age"
                      value={property.key}
                    />
                  </label>
                  <label className="grid content-start gap-2 text-sm font-medium text-tt-ink">
                    Value
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
                  </label>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    aria-label={`Move ${property.key || 'property'} up`}
                    disabled={index === 0}
                    onClick={() => onMoveProperty(property.id, -1)}
                    size="sm"
                  >
                    <ArrowUp aria-hidden="true" size={16} />
                  </Button>
                  <Button
                    aria-label={`Move ${property.key || 'property'} down`}
                    disabled={index === draft.properties.length - 1}
                    onClick={() => onMoveProperty(property.id, 1)}
                    size="sm"
                  >
                    <ArrowDown aria-hidden="true" size={16} />
                  </Button>
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

interface CharacterDetailsProps {
  readonly character: Character
}

function CharacterDetails({ character }: CharacterDetailsProps) {
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

function formatGender(gender: CharacterGender): string {
  return gender === 'female' ? 'Female' : 'Male'
}

function getCharacterDialogTitle(
  dialogState: Exclude<CharacterDialogState, { mode: 'closed' }>,
): string {
  if (dialogState.mode === 'create') {
    return 'Add Character'
  }

  if (dialogState.mode === 'edit') {
    return `Edit ${dialogState.character.name}`
  }

  return dialogState.character.name
}
