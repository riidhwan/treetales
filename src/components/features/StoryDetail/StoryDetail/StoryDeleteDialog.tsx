import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import { commonCopy, storyDetailCopy } from '@/copy'

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
      confirmLabel={
        isDeleting
          ? commonCopy.actions.deleting
          : storyDetailCopy.actions.deleteStory
      }
      isConfirming={isDeleting}
      message={storyDetailCopy.deleteDialog.message(storyTitle)}
      onCancel={onCancel}
      onConfirm={() => {
        void onConfirm()
      }}
      title={storyDetailCopy.deleteDialog.title}
      titleId={titleId}
      variant="danger"
    />
  )
}
