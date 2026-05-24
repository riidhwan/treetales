import { ChevronLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

interface Props {
  readonly label: string
  readonly maxWidthClassName?: string
  readonly onBack: () => void
  readonly previousLabel: string
}

export function ManagementTopBar({
  label,
  maxWidthClassName = 'max-w-3xl',
  onBack,
  previousLabel,
}: Readonly<Props>) {
  return (
    <header className="border-b border-border-subtle/70 bg-surface-paper/35">
      <nav
        aria-label={label}
        className={cn(
          'mx-auto flex min-h-16 w-full items-center justify-between px-5 sm:px-8',
          maxWidthClassName,
        )}
      >
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-md text-base font-medium text-action-primary transition hover:text-action-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          onClick={onBack}
          type="button"
        >
          <ChevronLeft aria-hidden="true" size={22} />
          {previousLabel}
        </button>
      </nav>
    </header>
  )
}
