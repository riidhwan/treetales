import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type Props = Readonly<InputHTMLAttributes<HTMLInputElement>>

export function TextInput({ className, type = 'text', ...inputProps }: Props) {
  return (
    <input
      className={cn(
        'min-h-11 rounded-md border border-stone-300 px-3 text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100',
        className,
      )}
      type={type}
      {...inputProps}
    />
  )
}
