import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { commonCopy, uiCopy } from '@/copy'

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
  cancelLabel = commonCopy.actions.cancel,
  confirmLabel,
  isConfirming = false,
  message,
  onCancel,
  onConfirm,
  title,
  titleId,
  variant = 'primary',
}: Props) {
  function handleCancel() {
    if (!isConfirming) {
      onCancel()
    }
  }

  return (
    <Dialog
      bodyClassName="pb-6"
      closeLabel={uiCopy.confirmationDialog.closeLabel}
      footer={
        <>
          <Button disabled={isConfirming} onClick={handleCancel}>
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
      onClose={handleCancel}
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
