import { Home } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

interface Props {
  readonly description?: string
  readonly errorMessage?: string
  readonly onOpenDashboard: () => void
  readonly title: string
}

export function StoryEditorUnavailableState({
  description,
  errorMessage,
  onOpenDashboard,
  title,
}: Props) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface-paper p-6 shadow-sm">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-text-muted">
          {description}
        </p>
      ) : null}
      {errorMessage ? (
        <Alert className="mt-4" role="alert" variant="error">
          {errorMessage}
        </Alert>
      ) : null}
      <Button className="mt-5" onClick={onOpenDashboard} size="sm">
        <Home aria-hidden="true" size={16} />
        Dashboard
      </Button>
    </section>
  )
}
