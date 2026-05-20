import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AlertVariant = 'error' | 'neutral' | 'success'

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  error:
    'rounded-md border border-tt-oxblood/30 bg-tt-oxblood-soft px-4 py-3 text-tt-oxblood',
  neutral:
    'rounded-lg border border-tt-line bg-tt-paper p-6 text-tt-muted shadow-sm',
  success:
    'rounded-md border border-tt-moss/25 bg-tt-moss-soft px-4 py-3 text-tt-moss-dark',
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
