import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type IconButtonVariant = 'danger' | 'primary' | 'secondary'
type IconButtonSize = 'md' | 'sm' | 'xs'

const BASE_CLASSES =
  'inline-grid place-items-center rounded-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-gold disabled:cursor-not-allowed disabled:opacity-60 [&>svg]:shrink-0'

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  danger:
    'border border-tt-oxblood/30 bg-tt-oxblood-soft/40 text-tt-oxblood hover:bg-tt-oxblood-soft',
  primary:
    'border border-tt-moss-dark bg-tt-moss text-tt-paper shadow-sm hover:bg-tt-moss-dark disabled:border-tt-line disabled:bg-tt-line disabled:text-tt-muted',
  secondary:
    'border border-tt-line bg-tt-paper/70 text-tt-ink shadow-sm hover:border-tt-gold hover:bg-tt-gold-soft/50',
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
