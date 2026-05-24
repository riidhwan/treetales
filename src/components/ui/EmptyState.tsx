import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type EmptyStateElement = 'div' | 'section'
type EmptyStateHeadingLevel = 1 | 2 | 3
type EmptyStateVariant = 'dashed' | 'solid' | 'unstyled'

const VARIANT_CLASSES: Record<EmptyStateVariant, string> = {
  dashed:
    'rounded-lg border border-dashed border-border-subtle bg-surface-paper-deep/40 p-6 text-center',
  solid:
    'rounded-lg border border-border-subtle bg-surface-paper p-6 shadow-sm',
  unstyled: '',
}

const TITLE_CLASSES: Record<EmptyStateHeadingLevel, string> = {
  1: 'text-2xl font-bold',
  2: 'text-xl font-bold',
  3: 'text-lg font-semibold',
}

interface Props extends Readonly<Omit<HTMLAttributes<HTMLElement>, 'title'>> {
  readonly actions?: ReactNode
  readonly as?: EmptyStateElement
  readonly description?: ReactNode
  readonly descriptionClassName?: string
  readonly headingLevel?: EmptyStateHeadingLevel
  readonly title: ReactNode
  readonly titleClassName?: string
  readonly titleStyle?: CSSProperties
  readonly variant?: EmptyStateVariant
}

export function EmptyState({
  actions,
  as: Component = 'section',
  className,
  description,
  descriptionClassName,
  headingLevel = 2,
  title,
  titleClassName,
  titleStyle,
  variant = 'solid',
  ...stateProps
}: Readonly<Props>) {
  const Heading = `h${headingLevel}` as const
  const titleBaseClass = variant === 'unstyled' ? '' : TITLE_CLASSES[headingLevel]
  const descriptionBaseClass =
    variant === 'unstyled' ? '' : 'mt-3 text-sm leading-6 text-text-muted'

  return (
    <Component
      className={cn(VARIANT_CLASSES[variant], className)}
      {...stateProps}
    >
      <Heading
        className={cn(titleBaseClass, titleClassName)}
        style={titleStyle}
      >
        {title}
      </Heading>
      {description ? (
        <p className={cn(descriptionBaseClass, descriptionClassName)}>
          {description}
        </p>
      ) : null}
      {actions}
    </Component>
  )
}
