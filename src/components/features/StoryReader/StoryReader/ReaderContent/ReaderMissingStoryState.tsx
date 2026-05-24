import { EmptyState } from '@/components/ui/EmptyState'
import { commonCopy } from '@/copy'

export function ReaderMissingStoryState() {
  return (
    <EmptyState
      description={commonCopy.messages.storyNotFound.body}
      headingLevel={1}
      title={commonCopy.messages.storyNotFound.title}
    />
  )
}
