import type { TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type Props = Readonly<TextareaHTMLAttributes<HTMLTextAreaElement>>

export function TextArea({ className, ...textAreaProps }: Props) {
  return (
    <textarea
      className={cn(
        'min-h-32 resize-y rounded-md border border-stone-300 px-3 py-2 text-base leading-6 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100',
        className,
      )}
      {...textAreaProps}
    />
  )
}
