import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'

type ConfirmationVariant = 'danger' | 'primary'

interface Props {
  readonly cancelLabel?: string
  readonly confirmLabel: string
  readonly isConfirming?: boolean
  readonly message: string
  readonly onCancel: () => void
  readonly onConfirm: () => void
  readonly title: string
  readonly titleId: string
  readonly variant?: ConfirmationVariant
}

export function ConfirmationDialog({
  cancelLabel = 'Cancel',
  confirmLabel,
  isConfirming = false,
  message,
  onCancel,
  onConfirm,
  title,
  titleId,
  variant = 'primary',
}: Props) {
  return (
    <Dialog
      bodyClassName="pb-6"
      closeLabel="Close confirmation dialog"
      footer={
        <>
          <Button disabled={isConfirming} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            disabled={isConfirming}
            onClick={onConfirm}
            variant={variant === 'danger' ? 'danger' : 'primary'}
          >
            {variant === 'danger' ? (
              <AlertTriangle aria-hidden="true" size={18} />
            ) : null}
            {confirmLabel}
          </Button>
        </>
      }
      onClose={onCancel}
      title={title}
      titleId={titleId}
      width="md"
    >
      <p className="text-sm leading-6 text-text-muted sm:text-base">
        {message}
      </p>
    </Dialog>
  )
}
