import { Home } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { commonCopy } from '@/copy'

interface Props {
  readonly description?: string
  readonly errorMessage?: string
  readonly onOpenDashboard: () => void
  readonly title: string
}

export function StoryEditorUnavailableState({
  description,
  errorMessage,
  onOpenDashboard,
  title,
}: Props) {
  return (
    <EmptyState
      actions={(
        <>
          {errorMessage ? (
            <Alert className="mt-4" role="alert" variant="error">
              {errorMessage}
            </Alert>
          ) : null}
          <Button className="mt-5" onClick={onOpenDashboard} size="sm">
            <Home aria-hidden="true" size={16} />
            {commonCopy.actions.dashboard}
          </Button>
        </>
      )}
      description={description}
      headingLevel={1}
      title={title}
    />
  )
}
