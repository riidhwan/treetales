import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface Props {
  readonly children: ReactNode
  readonly className?: string
  readonly helpText?: ReactNode
  readonly label: ReactNode
}

export function Field({ children, className, helpText, label }: Props) {
  return (
    <label className={cn('grid gap-2 text-sm font-medium text-tt-ink', className)}>
      <span>{label}</span>
      {children}
      {helpText ? (
        <span className="text-sm font-normal leading-5 text-tt-muted">
          {helpText}
        </span>
      ) : null}
    </label>
  )
}
