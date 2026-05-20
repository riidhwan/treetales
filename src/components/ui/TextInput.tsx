import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface Props extends Readonly<InputHTMLAttributes<HTMLInputElement>> {
  readonly className?: string
  readonly type?: InputHTMLAttributes<HTMLInputElement>['type']
}

export function TextInput({
  className,
  type = 'text',
  ...inputProps
}: Readonly<Props>) {
  return (
    <input
      className={cn(
        'min-h-11 rounded-md border border-tt-line bg-tt-paper px-3 text-base text-tt-ink outline-none transition placeholder:text-tt-muted/65 focus:border-tt-moss focus:ring-2 focus:ring-tt-gold-soft',
        className,
      )}
      type={type}
      {...inputProps}
    />
  )
}
