import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ChapterDocumentElement = 'article' | 'section'

interface Props extends Readonly<HTMLAttributes<HTMLElement>> {
  readonly as?: ChapterDocumentElement
  readonly children: ReactNode
}

export function ChapterDocumentShell({
  as: Component = 'section',
  children,
  className,
  ...shellProps
}: Readonly<Props>) {
  return (
    <Component
      className={cn(
        'mx-auto min-h-[calc(100vh-7rem)] w-full max-w-[52rem] border-border-subtle bg-surface-paper px-4 py-6 shadow-sm sm:min-h-[calc(100vh-10rem)] sm:border sm:px-8 sm:py-8 lg:px-8',
        className,
      )}
      {...shellProps}
    >
      {children}
    </Component>
  )
}
