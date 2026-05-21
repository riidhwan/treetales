import type { ReactNode } from 'react'
import { ArrowLeft, Home } from 'lucide-react'

import { Button } from '@/components/ui/Button'

interface ChapterWritingUnavailableLayoutProps {
  readonly actionsLabel: string
  readonly children: ReactNode
  readonly onOpenDashboard: () => void
  readonly onOpenPrevious: () => void
  readonly previousLabel: string
}

export function ChapterWritingUnavailableLayout({
  actionsLabel,
  children,
  onOpenDashboard,
  onOpenPrevious,
  previousLabel,
}: ChapterWritingUnavailableLayoutProps) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
      <nav
        aria-label={actionsLabel}
        className="flex flex-wrap justify-between gap-3"
      >
        <Button onClick={onOpenPrevious} size="sm">
          <ArrowLeft aria-hidden="true" size={16} />
          {previousLabel}
        </Button>
        <Button
          aria-label="Dashboard"
          className="px-3"
          onClick={onOpenDashboard}
          size="sm"
        >
          <Home aria-hidden="true" size={16} />
        </Button>
      </nav>

      {children}
    </section>
  )
}

interface ChapterWritingMissingStateProps {
  readonly description: string
  readonly kicker?: string
  readonly title: string
}

export function ChapterWritingMissingState({
  description,
  kicker,
  title,
}: ChapterWritingMissingStateProps) {
  return (
    <section className="rounded-lg border border-tt-line bg-tt-paper p-6 shadow-sm">
      {kicker ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
          {kicker}
        </p>
      ) : null}
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-tt-muted">
        {description}
      </p>
    </section>
  )
}
