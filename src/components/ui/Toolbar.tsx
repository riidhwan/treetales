import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface Props extends Readonly<HTMLAttributes<HTMLElement>> {
  readonly contentClassName?: string
  readonly context?: ReactNode
  readonly label: string
  readonly leading?: ReactNode
  readonly primary?: ReactNode
  readonly trailing?: ReactNode
}

export function Toolbar({
  className,
  contentClassName,
  context,
  label,
  leading,
  primary,
  trailing,
  ...headerProps
}: Readonly<Props>) {
  return (
    <header
      {...headerProps}
      className={cn(
        'sticky top-0 z-20 border-b border-tt-line bg-tt-paper/95 shadow-sm backdrop-blur',
        className,
      )}
    >
      <nav
        aria-label={label}
        className={cn(
          'mx-auto flex w-full max-w-6xl items-center gap-2 px-3 py-2 sm:px-5',
          contentClassName,
        )}
      >
        {leading ? <div className="flex items-center gap-2">{leading}</div> : null}

        {context ? (
          <div className="min-w-0 flex-1 px-1">{context}</div>
        ) : (
          <div className="flex-1" />
        )}

        {primary ? <div className="flex items-center gap-2">{primary}</div> : null}
        {trailing ? <div className="flex items-center gap-2">{trailing}</div> : null}
      </nav>
    </header>
  )
}

interface ToolbarContextProps {
  readonly children: ReactNode
  readonly className?: string
}

export function ToolbarContext({
  children,
  className,
}: Readonly<ToolbarContextProps>) {
  return (
    <p className={cn('truncate text-sm font-semibold text-tt-muted', className)}>
      {children}
    </p>
  )
}
