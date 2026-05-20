import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ButtonVariant = 'danger' | 'primary' | 'secondary'
type ButtonSize = 'md' | 'sm'

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-gold disabled:cursor-not-allowed disabled:opacity-60'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  danger:
    'border border-tt-oxblood/30 bg-tt-oxblood-soft/40 text-tt-oxblood hover:bg-tt-oxblood-soft',
  primary:
    'border border-tt-moss-dark bg-tt-moss text-tt-paper shadow-sm hover:bg-tt-moss-dark disabled:border-tt-line disabled:bg-tt-line disabled:text-tt-muted',
  secondary:
    'border border-tt-line bg-tt-paper/70 text-tt-ink shadow-sm hover:border-tt-gold hover:bg-tt-gold-soft/50',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-11 px-4',
  sm: 'min-h-10 px-3',
}

interface Props extends Readonly<ButtonHTMLAttributes<HTMLButtonElement>> {
  readonly children: ReactNode
  readonly size?: ButtonSize
  readonly variant?: ButtonVariant
}

export function Button({
  children,
  className,
  size = 'md',
  type = 'button',
  variant = 'secondary',
  ...buttonProps
}: Readonly<Props>) {
  return (
    <button
      className={cn(
        BASE_CLASSES,
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      )}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
