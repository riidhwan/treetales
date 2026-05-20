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
          'min-h-32 resize-y rounded-md border border-tt-line bg-tt-paper px-3 py-2 text-base leading-6 text-tt-ink outline-none transition placeholder:text-tt-muted/65 focus:border-tt-moss focus:ring-2 focus:ring-tt-gold-soft',
          className,
        )}
        ref={ref}
        {...textAreaProps}
      />
    )
  },
)
