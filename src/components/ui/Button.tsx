import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary'
type ButtonSize = 'md' | 'sm'

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-60 [&>svg]:shrink-0'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  danger:
    'border border-action-destructive/30 bg-state-destructive-soft/40 text-action-destructive hover:bg-state-destructive-soft',
  ghost: 'text-text-muted hover:bg-highlight-soft/50 hover:text-text-primary',
  primary:
    'border border-action-primary-hover bg-action-primary text-surface-paper shadow-sm hover:bg-action-primary-hover disabled:border-border-subtle disabled:bg-border-subtle disabled:text-text-muted',
  secondary:
    'border border-border-subtle bg-surface-paper/70 text-text-primary shadow-sm hover:border-focus-ring hover:bg-highlight-soft/50',
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
