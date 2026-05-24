import { ArrowLeft, Home } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { commonCopy } from '@/copy'

interface Props {
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
}: Props) {
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
          aria-label={commonCopy.actions.dashboard}
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
