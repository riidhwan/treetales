import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'

interface Props {
  readonly isDeleting: boolean
  readonly isOpen: boolean
  readonly onCancel: () => void
  readonly onConfirm: () => Promise<unknown>
  readonly storyTitle?: string
  readonly titleId: string
}

export function StoryDeleteDialog({
  isDeleting,
  isOpen,
  onCancel,
  onConfirm,
  storyTitle,
  titleId,
}: Props) {
  if (!isOpen || !storyTitle) {
    return null
  }

  return (
    <ConfirmationDialog
      confirmLabel={isDeleting ? 'Deleting...' : 'Delete Story'}
      isConfirming={isDeleting}
      message={`Delete "${storyTitle}"? This cannot be undone.`}
      onCancel={onCancel}
      onConfirm={() => {
        void onConfirm()
      }}
      title="Delete Story?"
      titleId={titleId}
      variant="danger"
    />
  )
}
