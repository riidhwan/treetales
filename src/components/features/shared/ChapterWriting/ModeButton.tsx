import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface Props {
  readonly children: ReactNode
  readonly isSelected: boolean
  readonly label: string
  readonly onClick: () => void
}

export function ModeButton({
  children,
  isSelected,
  label,
  onClick,
}: Props) {
  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        'inline-flex min-h-8 items-center gap-1 rounded px-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        isSelected
          ? 'bg-highlight-soft text-action-primary-hover shadow-sm'
          : 'text-text-muted hover:bg-surface-paper-deep',
      )}
      onClick={onClick}
      type="button"
    >
      {children}
      {label}
    </button>
  )
}
