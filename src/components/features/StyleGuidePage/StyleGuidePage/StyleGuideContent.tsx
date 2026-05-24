import {
  BookOpen,
  Check,
  Edit3,
  Trash2,
} from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { IconButton } from '@/components/ui/IconButton'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { TextArea } from '@/components/ui/TextArea'
import { TextInput } from '@/components/ui/TextInput'
import { Toolbar, ToolbarContext } from '@/components/ui/Toolbar'
import { styleGuideCopy } from '@/copy'

import { NotFoundPage } from '@/components/features/NotFoundPage'

const TOKENS = [
  {
    className: 'bg-background-app',
    label: 'background.app',
    token: 'background-app',
  },
  {
    className: 'bg-surface-paper',
    label: 'surface.paper',
    token: 'surface-paper',
  },
  {
    className: 'bg-surface-paper-deep',
    label: 'surface.paperDeep',
    token: 'surface-paper-deep',
  },
  {
    className: 'bg-action-primary',
    label: 'action.primary',
    token: 'action-primary',
  },
  {
    className: 'bg-action-destructive',
    label: 'action.destructive',
    token: 'action-destructive',
  },
  {
    className: 'bg-highlight-soft',
    label: 'highlight.soft',
    token: 'highlight-soft',
  },
] as const

interface Props {
  readonly isEnabled: boolean
}

export function StyleGuideContent({ isEnabled }: Props) {
  if (!isEnabled) {
    return <NotFoundPage />
  }

  return (
    <div className="min-h-screen bg-background-app text-text-primary">
      <Toolbar
        context={
          <ToolbarContext>
            {styleGuideCopy.toolbarContext}
          </ToolbarContext>
        }
        label={styleGuideCopy.title}
      />

      <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <header className="grid gap-4 border-b border-border-subtle pb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-action-primary">
            {styleGuideCopy.header.kicker}
          </p>
          <div className="grid gap-3">
            <h1 className="text-4xl font-bold text-text-primary">
              {styleGuideCopy.header.title}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-text-muted">
              {styleGuideCopy.header.body}
            </p>
          </div>
        </header>

        <section aria-labelledby="tokens-heading" className="grid gap-4">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold" id="tokens-heading">
              {styleGuideCopy.tokens.title}
            </h2>
            <p className="text-sm leading-6 text-text-muted">
              {styleGuideCopy.tokens.body}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOKENS.map((token) => (
              <article
                className="grid min-h-28 gap-4 rounded-md border border-border-subtle bg-surface-paper p-4 shadow-sm"
                key={token.token}
              >
                <div
                  aria-hidden="true"
                  className={`h-8 rounded-md border border-border-subtle ${token.className}`}
                />
                <div>
                  <h3 className="font-semibold">{token.label}</h3>
                  <p className="text-sm text-text-muted">{token.token}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="primitives-heading" className="grid gap-4">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold" id="primitives-heading">
              {styleGuideCopy.primitives.title}
            </h2>
            <p className="text-sm leading-6 text-text-muted">
              {styleGuideCopy.primitives.body}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
            <div className="grid gap-4 rounded-md border border-border-subtle bg-surface-paper p-5 shadow-sm">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">
                  <Check aria-hidden="true" size={18} />
                  {styleGuideCopy.primitives.buttons.primary}
                </Button>
                <Button>{styleGuideCopy.primitives.buttons.secondary}</Button>
                <Button variant="danger">
                  <Trash2 aria-hidden="true" size={18} />
                  {styleGuideCopy.primitives.buttons.delete}
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <IconButton label={styleGuideCopy.primitives.iconButtons.editChapter}>
                  <Edit3 aria-hidden="true" size={18} />
                </IconButton>
                <IconButton
                  label={styleGuideCopy.primitives.iconButtons.readStory}
                  variant="primary"
                >
                  <BookOpen aria-hidden="true" size={18} />
                </IconButton>
                <IconButton
                  label={styleGuideCopy.primitives.iconButtons.deleteStory}
                  variant="danger"
                >
                  <Trash2 aria-hidden="true" size={18} />
                </IconButton>
              </div>

              <div className="grid gap-3">
                <Alert>{styleGuideCopy.alerts.neutral}</Alert>
                <Alert variant="success">
                  {styleGuideCopy.alerts.success}
                </Alert>
                <Alert variant="error">{styleGuideCopy.alerts.error}</Alert>
              </div>
            </div>

            <form className="grid gap-4 rounded-md border border-border-subtle bg-surface-paper p-5 shadow-sm">
              <Field
                helpText={styleGuideCopy.form.titleHelp}
                label={styleGuideCopy.form.title}
              >
                <TextInput defaultValue={styleGuideCopy.form.titleValue} />
              </Field>
              <Field label={styleGuideCopy.form.summary}>
                <TextArea
                  defaultValue={styleGuideCopy.form.summaryValue}
                  rows={5}
                />
              </Field>
            </form>
          </div>
        </section>

        <section aria-labelledby="surfaces-heading" className="grid gap-4">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold" id="surfaces-heading">
              {styleGuideCopy.surfaces.title}
            </h2>
            <p className="text-sm leading-6 text-text-muted">
              {styleGuideCopy.surfaces.body}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {styleGuideCopy.surfaces.items.map((surface) => (
              <article
                className="min-h-32 rounded-md border border-border-subtle bg-surface-paper p-4 shadow-sm"
                key={surface.name}
              >
                <h3 className="font-semibold">{surface.name}</h3>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  {surface.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="document-heading" className="grid gap-4">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold" id="document-heading">
              {styleGuideCopy.documentPreview.title}
            </h2>
            <p className="text-sm leading-6 text-text-muted">
              {styleGuideCopy.documentPreview.body}
            </p>
          </div>

          <article className="rounded-md border border-border-subtle bg-surface-paper p-6 shadow-sm">
            <MarkdownContent
              content={styleGuideCopy.documentPreview.content.join('\n')}
            />
          </article>
        </section>
      </main>
    </div>
  )
}
