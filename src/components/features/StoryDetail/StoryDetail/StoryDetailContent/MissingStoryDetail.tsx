import { Home } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { commonCopy } from '@/copy'

interface Props {
  readonly onOpenDashboard: () => void
}

export function MissingStoryDetail({ onOpenDashboard }: Props) {
  return (
    <EmptyState
      actions={(
        <Button className="mt-5" onClick={onOpenDashboard} size="sm">
          <Home aria-hidden="true" size={16} />
          {commonCopy.actions.dashboard}
        </Button>
      )}
      description={commonCopy.messages.storyNotFound.body}
      headingLevel={1}
      title={commonCopy.messages.storyNotFound.title}
    />
  )
}
