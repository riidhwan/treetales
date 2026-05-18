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
          'min-h-32 resize-y rounded-md border border-stone-300 px-3 py-2 text-base leading-6 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100',
          className,
        )}
        ref={ref}
        {...textAreaProps}
      />
    )
  },
)
