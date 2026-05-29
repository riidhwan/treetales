import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import { useRef } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Field } from '@/components/ui/Field'
import { IconButton } from '@/components/ui/IconButton'
import { TextInput } from '@/components/ui/TextInput'
import { CHARACTER_ILLUSTRATION_ACCEPTED_MIME_TYPES } from '@/config'
import { commonCopy, storyDetailCopy } from '@/copy'
import type { useCharacterDetail } from '@/hooks/useCharacterDetail'
import { cn } from '@/lib/utils'
import type { CharacterIllustration } from '@/services/types'

interface Props {
  readonly characterDetail: ReturnType<typeof useCharacterDetail>
}

export function CharacterIllustrationSection({ characterDetail }: Props) {
  const copy = storyDetailCopy.characterDetail.illustrations
  const importInputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="grid gap-5" aria-labelledby="character-illustrations">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div>
          <h2
            className="text-xl font-semibold text-text-primary"
            id="character-illustrations"
          >
            {copy.heading}
          </h2>
        </div>
        <IconButton
          disabled={characterDetail.isImportingIllustration}
          label={storyDetailCopy.actions.addIllustration}
          onClick={() => importInputRef.current!.click()}
          variant="ghost"
        >
          <ImagePlus aria-hidden="true" size={18} />
        </IconButton>
        <input
          aria-label={copy.fileLabel}
          accept={CHARACTER_ILLUSTRATION_ACCEPTED_MIME_TYPES.join(',')}
          className="sr-only"
          key={characterDetail.illustrationImportResetKey}
          onChange={(event) =>
            characterDetail.setIllustrationFile(event.target.files?.[0])
          }
          ref={importInputRef}
          type="file"
        />
      </div>

      {characterDetail.illustrationErrorMessage &&
      !characterDetail.illustrationFile ? (
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

      {characterDetail.illustrationFile ? (
        <CharacterIllustrationImportDialog characterDetail={characterDetail} />
      ) : null}
    </section>
  )
}

function CharacterIllustrationImportDialog({ characterDetail }: Props) {
  const copy = storyDetailCopy.characterDetail.illustrations
  const isOriginalQuality = characterDetail.illustrationImportMode === 'original'

  return (
    <Dialog
      closeDisabled={characterDetail.isImportingIllustration}
      closeLabel={commonCopy.actions.cancel}
      footer={
        <>
          <Button
            disabled={characterDetail.isImportingIllustration}
            onClick={characterDetail.cancelIllustrationImport}
            variant="secondary"
          >
            {commonCopy.actions.cancel}
          </Button>
          <Button
            disabled={!characterDetail.canImportIllustration}
            onClick={() => void characterDetail.importIllustration()}
            variant="primary"
          >
            {characterDetail.isImportingIllustration ? (
              <Upload aria-hidden="true" size={18} />
            ) : (
              <Save aria-hidden="true" size={18} />
            )}
            {characterDetail.isImportingIllustration
              ? storyDetailCopy.actions.uploadingIllustration
              : commonCopy.actions.save}
          </Button>
        </>
      }
      onClose={characterDetail.cancelIllustrationImport}
      title={copy.addTitle}
      titleId="character-illustration-import-title"
      width="md"
    >
      <div className="grid gap-4">
        <div className="relative overflow-hidden rounded-md border border-border-subtle bg-surface-paper-deep">
          {characterDetail.illustrationPreviewUrl ? (
            <img
              alt={copy.previewAlt}
              className="aspect-[4/3] w-full object-contain"
              src={characterDetail.illustrationPreviewUrl}
            />
          ) : (
            <div className="grid aspect-[4/3] place-items-center text-sm text-text-muted">
              {copy.previewAlt}
            </div>
          )}
          <div className="absolute right-2 top-2">
            <IconButton
              className={cn(
                'bg-surface-paper/80 backdrop-blur-sm',
                isOriginalQuality &&
                  'bg-highlight-soft text-text-primary ring-1 ring-focus-ring',
              )}
              disabled={characterDetail.isImportingIllustration}
              label={
                isOriginalQuality
                  ? copy.useNormalizedQuality
                  : copy.useOriginalQuality
              }
              onClick={() =>
                characterDetail.setIllustrationImportMode(
                  isOriginalQuality ? 'normalized' : 'original',
                )
              }
              size="sm"
              variant="ghost"
            >
              <span aria-hidden="true" className="text-xs font-bold">
                HD
              </span>
            </IconButton>
          </div>
        </div>

        {characterDetail.illustrationErrorMessage ? (
          <Alert role="alert" variant="error">
            {characterDetail.illustrationErrorMessage}
          </Alert>
        ) : null}

        <Field label={copy.label}>
          <TextInput
            autoFocus
            disabled={characterDetail.isImportingIllustration}
            onChange={(event) =>
              characterDetail.setIllustrationImportLabel(event.target.value)
            }
            placeholder={copy.labelPlaceholder}
            value={characterDetail.illustrationImportLabel}
          />
        </Field>
      </div>
    </Dialog>
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
