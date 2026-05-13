import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ButtonVariant = 'danger' | 'primary' | 'secondary'
type ButtonSize = 'md' | 'sm'

interface Props extends Readonly<ButtonHTMLAttributes<HTMLButtonElement>> {
  readonly children: ReactNode
  readonly size?: ButtonSize
  readonly variant?: ButtonVariant
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  danger:
    'border border-red-200 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60',
  primary:
    'bg-emerald-700 text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300',
  secondary: 'border border-stone-300 text-stone-800 hover:bg-stone-100',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-11 px-4',
  sm: 'min-h-10 px-3',
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
