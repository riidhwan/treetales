import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AlertVariant = 'error' | 'neutral' | 'success'

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  error:
    'rounded-md border border-action-destructive/30 bg-state-destructive-soft px-4 py-3 text-action-destructive',
  neutral:
    'rounded-lg border border-border-subtle bg-surface-paper p-6 text-text-muted shadow-sm',
  success:
    'rounded-md border border-action-primary/25 bg-state-success-soft px-4 py-3 text-action-primary-hover',
}

interface Props extends Readonly<HTMLAttributes<HTMLParagraphElement>> {
  readonly children: ReactNode
  readonly variant?: AlertVariant
}

export function Alert({
  children,
  className,
  variant = 'neutral',
  ...alertProps
}: Readonly<Props>) {
  return (
    <p
      className={cn('text-sm', VARIANT_CLASSES[variant], className)}
      {...alertProps}
    >
      {children}
    </p>
  )
}
