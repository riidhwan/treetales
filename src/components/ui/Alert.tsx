import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AlertVariant = 'error' | 'neutral' | 'success'

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  error: 'rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-800',
  neutral: 'rounded-lg border border-stone-200 bg-white p-6 text-stone-600',
  success:
    'rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800',
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
