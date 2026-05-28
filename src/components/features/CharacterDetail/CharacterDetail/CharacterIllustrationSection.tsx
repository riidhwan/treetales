import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { IconButton } from '@/components/ui/IconButton'
import { TextInput } from '@/components/ui/TextInput'
import { CHARACTER_ILLUSTRATION_ACCEPTED_MIME_TYPES } from '@/config'
import { commonCopy, storyDetailCopy } from '@/copy'
import type { useCharacterDetail } from '@/hooks/useCharacterDetail'
import type { CharacterIllustration } from '@/services/types'

interface Props {
  readonly characterDetail: ReturnType<typeof useCharacterDetail>
}

export function CharacterIllustrationSection({ characterDetail }: Props) {
  const copy = storyDetailCopy.characterDetail.illustrations

  return (
    <section className="grid gap-5" aria-labelledby="character-illustrations">
      <div className="flex flex-col gap-2 border-b border-border-subtle pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            className="text-xl font-semibold text-text-primary"
            id="character-illustrations"
          >
            {copy.heading}
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            {copy.normalizedNote}
          </p>
        </div>
      </div>

      <form
        className="grid gap-4 rounded-md border border-border-subtle bg-surface-paper/60 p-4 shadow-sm sm:p-5"
        onSubmit={(event) => {
          event.preventDefault()
          void characterDetail.importIllustration()
        }}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="grid gap-2 text-sm font-medium text-text-primary">
            <span>{copy.fileLabel}</span>
            <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-paper px-3 text-base text-text-primary outline-none transition hover:border-focus-ring hover:bg-highlight-soft/40 focus-within:border-action-primary focus-within:ring-2 focus-within:ring-highlight-soft">
              <span className="min-w-0 truncate">
                {characterDetail.illustrationFile?.name ?? copy.filePlaceholder}
              </span>
              <ImagePlus
                aria-hidden="true"
                className="shrink-0 text-text-muted"
                size={18}
              />
              <input
                aria-label={copy.fileLabel}
                accept={CHARACTER_ILLUSTRATION_ACCEPTED_MIME_TYPES.join(',')}
                className="sr-only"
                key={characterDetail.illustrationImportResetKey}
                onChange={(event) =>
                  characterDetail.setIllustrationFile(event.target.files?.[0])
                }
                type="file"
              />
            </label>
            <span className="text-sm font-normal leading-5 text-text-muted">
              {copy.fileHelp}
            </span>
          </div>

          <Field label={copy.label}>
            <TextInput
              onChange={(event) =>
                characterDetail.setIllustrationImportLabel(event.target.value)
              }
              placeholder={copy.labelPlaceholder}
              value={characterDetail.illustrationImportLabel}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-4 border-t border-border-subtle pt-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex items-start gap-3 text-sm text-text-muted">
            <input
              checked={characterDetail.illustrationImportMode === 'original'}
              className="mt-1 size-4 accent-action-primary"
              onChange={(event) =>
                characterDetail.setIllustrationImportMode(
                  event.target.checked ? 'original' : 'normalized',
                )
              }
              type="checkbox"
            />
            <span>
              <span className="block font-medium text-text-primary">
                {copy.modeLabel}
              </span>
              <span className="block leading-5">{copy.originalNote}</span>
            </span>
          </label>

          <Button
            className="w-full lg:w-auto"
            disabled={!characterDetail.canImportIllustration}
            type="submit"
            variant="primary"
          >
            {characterDetail.isImportingIllustration ? (
              <Upload aria-hidden="true" size={18} />
            ) : (
              <ImagePlus aria-hidden="true" size={18} />
            )}
            {characterDetail.isImportingIllustration
              ? storyDetailCopy.actions.uploadingIllustration
              : storyDetailCopy.actions.importIllustration}
          </Button>
        </div>
      </form>

      {characterDetail.illustrationErrorMessage ? (
        <Alert role="alert" variant="error">
          {characterDetail.illustrationErrorMessage}
        </Alert>
      ) : null}

      {characterDetail.isLoadingIllustrations ? (
        <Alert>{copy.loading}</Alert>
      ) : null}

      {characterDetail.illustrations.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-subtle bg-surface-paper/35 px-4 py-5 text-sm text-text-muted">
          {copy.empty}
        </p>
      ) : (
        <div className="grid gap-4">
          {characterDetail.illustrations.map((view, index) => (
            <article
              className="grid gap-4 rounded-md border border-border-subtle bg-surface-paper/70 p-4 shadow-sm sm:grid-cols-[minmax(12rem,16rem)_1fr]"
              key={view.illustration.id}
            >
              <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-paper-deep">
                {view.imageUrl ? (
                  <img
                    alt={
                      view.illustration.label ||
                      storyDetailCopy.characterDetail.illustrations.unnamed
                    }
                    className="aspect-[4/3] h-full w-full object-contain"
                    src={view.imageUrl}
                  />
                ) : (
                  <div className="grid aspect-[4/3] place-items-center px-3 text-center text-sm text-text-muted">
                    {copy.unnamed}
                  </div>
                )}
              </div>

              <div className="grid min-w-0 content-between gap-4">
                <div className="grid gap-3">
                  <Field label={copy.label}>
                    <div className="flex gap-2">
                      <TextInput
                        onChange={(event) =>
                          characterDetail.setIllustrationLabelDraft(
                            view.illustration.id,
                            event.target.value,
                          )
                        }
                        placeholder={copy.labelPlaceholder}
                        value={
                          characterDetail.illustrationLabelDrafts[
                            view.illustration.id
                          ] ?? ''
                        }
                      />
                      <IconButton
                        disabled={
                          characterDetail.activeIllustrationActionId ===
                          view.illustration.id
                        }
                        label={copy.saveLabel(view.illustration.label)}
                        onClick={() =>
                          void characterDetail.saveIllustrationLabel(
                            view.illustration.id,
                          )
                        }
                      >
                        <Save aria-hidden="true" size={16} />
                      </IconButton>
                    </div>
                  </Field>

                  <p className="text-sm leading-6 text-text-muted">
                    {formatIllustrationDetails(view.illustration)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <IconButton
                    disabled={
                      index === 0 ||
                      characterDetail.activeIllustrationActionId ===
                        view.illustration.id
                    }
                    label={copy.moveUp(view.illustration.label)}
                    onClick={() =>
                      void characterDetail.moveIllustration(
                        view.illustration.id,
                        -1,
                      )
                    }
                    size="sm"
                  >
                    <ArrowUp aria-hidden="true" size={16} />
                  </IconButton>
                  <IconButton
                    disabled={
                      index === characterDetail.illustrations.length - 1 ||
                      characterDetail.activeIllustrationActionId ===
                        view.illustration.id
                    }
                    label={copy.moveDown(view.illustration.label)}
                    onClick={() =>
                      void characterDetail.moveIllustration(
                        view.illustration.id,
                        1,
                      )
                    }
                    size="sm"
                  >
                    <ArrowDown aria-hidden="true" size={16} />
                  </IconButton>
                  <Button
                    disabled={
                      characterDetail.activeIllustrationActionId ===
                      view.illustration.id
                    }
                    onClick={() =>
                      characterDetail.requestDeleteIllustration(
                        view.illustration.id,
                      )
                    }
                    size="sm"
                    variant="danger"
                  >
                    <Trash2 aria-hidden="true" size={16} />
                    {commonCopy.actions.delete}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function formatIllustrationDetails(illustration: CharacterIllustration): string {
  const dimensions = `${illustration.width} x ${illustration.height}`
  const size = formatBytes(illustration.sizeBytes)
  const mode =
    illustration.importMode === 'original' ? 'original quality' : 'normalized'

  return `${dimensions} - ${size} - ${mode}`
}

function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}
