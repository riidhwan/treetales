import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface Props extends Readonly<TextareaHTMLAttributes<HTMLTextAreaElement>> {
  readonly className?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, Readonly<Props>>(
  function TextArea({ className, ...textAreaProps }, ref) {
    return (
      <textarea
        className={cn(
          'min-h-32 resize-y rounded-md border border-border-subtle bg-surface-paper px-3 py-2 text-base leading-6 text-text-primary outline-none transition placeholder:text-text-muted/65 focus:border-action-primary focus:ring-2 focus:ring-highlight-soft',
          className,
        )}
        ref={ref}
        {...textAreaProps}
      />
    )
  },
)
