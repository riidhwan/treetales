import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type IconButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary'
type IconButtonSize = 'md' | 'sm' | 'xs'

const BASE_CLASSES =
  'inline-grid place-items-center rounded-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-60 [&>svg]:shrink-0'

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  danger:
    'border border-action-destructive/30 bg-state-destructive-soft/40 text-action-destructive hover:bg-state-destructive-soft',
  ghost: 'text-text-muted hover:bg-highlight-soft/50 hover:text-text-primary',
  primary:
    'border border-action-primary-hover bg-action-primary text-surface-paper shadow-sm hover:bg-action-primary-hover disabled:border-border-subtle disabled:bg-border-subtle disabled:text-text-muted',
  secondary:
    'border border-border-subtle bg-surface-paper/70 text-text-primary shadow-sm hover:border-focus-ring hover:bg-highlight-soft/50',
}

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  md: 'size-11',
  sm: 'size-10',
  xs: 'size-8',
}

interface Props extends Readonly<ButtonHTMLAttributes<HTMLButtonElement>> {
  readonly children: ReactNode
  readonly label: string
  readonly size?: IconButtonSize
  readonly variant?: IconButtonVariant
}

export function IconButton({
  children,
  className,
  label,
  size = 'md',
  title,
  type = 'button',
  variant = 'secondary',
  ...buttonProps
}: Readonly<Props>) {
  return (
    <button
      {...buttonProps}
      aria-label={label}
      className={cn(
        BASE_CLASSES,
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      )}
      title={title ?? label}
      type={type}
    >
      {children}
    </button>
  )
}
