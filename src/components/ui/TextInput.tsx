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
        'min-h-11 rounded-md border border-border-subtle bg-surface-paper px-3 text-base text-text-primary outline-none transition placeholder:text-text-muted/65 focus:border-action-primary focus:ring-2 focus:ring-highlight-soft',
        className,
      )}
      type={type}
      {...inputProps}
    />
  )
}
