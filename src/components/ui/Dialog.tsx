import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { uiCopy } from '@/copy'
import { cn } from '@/lib/utils'

type DialogWidth = 'md' | 'lg'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const WIDTH_CLASSES: Record<DialogWidth, string> = {
  lg: 'max-w-3xl',
  md: 'max-w-2xl',
}

interface Props {
  readonly bodyClassName?: string
  readonly children: ReactNode
  readonly className?: string
  readonly closeLabel?: string
  readonly eyebrow?: string
  readonly footer?: ReactNode
  readonly footerClassName?: string
  readonly onClose: () => void
  readonly overlayClassName?: string
  readonly title: string
  readonly titleClassName?: string
  readonly titleId: string
  readonly width?: DialogWidth
}

export function Dialog({
  bodyClassName,
  children,
  className,
  closeLabel = uiCopy.dialog.closeLabel,
  eyebrow,
  footer,
  footerClassName,
  onClose,
  overlayClassName,
  title,
  titleClassName,
  titleId,
  width = 'md',
}: Props) {
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previousActiveElement = document.activeElement

    dialogRef.current?.focus()

    return () => {
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus()
      }
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const dialog = dialogRef.current as HTMLElement
      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      )

      if (focusableElements.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 grid place-items-center bg-text-primary/45 px-4 py-6',
        overlayClassName,
      )}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          'flex max-h-[calc(100vh-3rem)] w-full flex-col overflow-hidden rounded-lg border border-border-subtle bg-surface-paper shadow-xl',
          WIDTH_CLASSES[width],
          className,
        )}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4 sm:px-6">
          <div>
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-wide text-action-primary">
                {eyebrow}
              </p>
            ) : null}
            <h2
              className={cn(
                'text-2xl font-bold text-text-primary',
                eyebrow && 'mt-1',
                titleClassName,
              )}
              id={titleId}
            >
              {title}
            </h2>
          </div>
          <IconButton label={closeLabel} onClick={onClose} size="sm">
            <X aria-hidden="true" size={16} />
          </IconButton>
        </header>

        <div className={cn('overflow-y-auto px-5 py-5 sm:px-6', bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <footer
            className={cn(
              'flex flex-wrap justify-end gap-2 border-t border-border-subtle px-5 py-4 sm:px-6',
              footerClassName,
            )}
          >
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  )
}
