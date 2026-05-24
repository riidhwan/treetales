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

const SURFACES = [
  {
    description: 'Full-page parchment field for the app shell.',
    name: 'App Background',
  },
  {
    description: 'Unframed rhythm for Library and Management Mode.',
    name: 'Workbench',
  },
  {
    description: 'Chapter title and content surface owned by Document Mode.',
    name: 'Paper Document',
  },
  {
    description: 'Repeated Story, Character, or form objects with a real boundary.',
    name: 'Bounded Object',
  },
  {
    description: 'Focused modal work with labelled task hierarchy.',
    name: 'Dialog Surface',
  },
  {
    description: 'Explicit destructive area with clear consequences.',
    name: 'Danger Surface',
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
            Dev style guide - local primitives and semantic tokens
          </ToolbarContext>
        }
        label="Style guide"
      />

      <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <header className="grid gap-4 border-b border-border-subtle pb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-action-primary">
            Maintainer surface
          </p>
          <div className="grid gap-3">
            <h1 className="text-4xl font-bold text-text-primary">
              TreeTales Style Guide
            </h1>
            <p className="max-w-3xl text-base leading-7 text-text-muted">
              A dev-only check surface for the current local UI primitives,
              semantic tokens, and documented component boundaries. It is not
              linked from product navigation.
            </p>
          </div>
        </header>

        <section aria-labelledby="tokens-heading" className="grid gap-4">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold" id="tokens-heading">
              Semantic Tokens
            </h2>
            <p className="text-sm leading-6 text-text-muted">
              Generic primitives and settled feature surfaces should use these
              role-based aliases before reaching for raw palette tokens.
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
              Local Primitives
            </h2>
            <p className="text-sm leading-6 text-text-muted">
              Shared UI belongs in `src/components/ui` only when it stays
              business-agnostic and enforces repeated behavior.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
            <div className="grid gap-4 rounded-md border border-border-subtle bg-surface-paper p-5 shadow-sm">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">
                  <Check aria-hidden="true" size={18} />
                  Primary action
                </Button>
                <Button>Secondary action</Button>
                <Button variant="danger">
                  <Trash2 aria-hidden="true" size={18} />
                  Delete
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <IconButton label="Edit chapter">
                  <Edit3 aria-hidden="true" size={18} />
                </IconButton>
                <IconButton label="Read story" variant="primary">
                  <BookOpen aria-hidden="true" size={18} />
                </IconButton>
                <IconButton label="Delete story" variant="danger">
                  <Trash2 aria-hidden="true" size={18} />
                </IconButton>
              </div>

              <div className="grid gap-3">
                <Alert>Neutral state preserves the current experience mode.</Alert>
                <Alert variant="success">Success state uses the moss soft role.</Alert>
                <Alert variant="error">Error state uses restrained oxblood roles.</Alert>
              </div>
            </div>

            <form className="grid gap-4 rounded-md border border-border-subtle bg-surface-paper p-5 shadow-sm">
              <Field
                helpText="Field wraps the label, help text, and control rhythm."
                label="Story title"
              >
                <TextInput defaultValue="The Glass Orchard" />
              </Field>
              <Field label="Story summary">
                <TextArea
                  defaultValue="A quiet branching tale about a family orchard that remembers every choice."
                  rows={5}
                />
              </Field>
            </form>
          </div>
        </section>

        <section aria-labelledby="surfaces-heading" className="grid gap-4">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold" id="surfaces-heading">
              Surface Boundaries
            </h2>
            <p className="text-sm leading-6 text-text-muted">
              Surface names are design contracts first. They do not imply a
              generic wrapper component.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SURFACES.map((surface) => (
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
              Document Preview
            </h2>
            <p className="text-sm leading-6 text-text-muted">
              Markdown rendering belongs to Chapter Document content, while app
              chrome keeps the TreeTales interface typography.
            </p>
          </div>

          <article className="rounded-md border border-border-subtle bg-surface-paper p-6 shadow-sm">
            <MarkdownContent
              content={[
                '# A Quiet Branch',
                '',
                'The path narrows, and the orchard keeps its own account.',
                '',
                '- Branch choices stay narrative before they become navigation.',
                '- Reader Appearance owns this document typography in product flows.',
              ].join('\n')}
            />
          </article>
        </section>
      </main>
    </div>
  )
}
