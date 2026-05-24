import { Home } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { commonCopy } from '@/copy'

interface Props {
  readonly onOpenDashboard: () => void
}

export function MissingStoryDetail({ onOpenDashboard }: Props) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface-paper p-6 shadow-sm">
      <h1 className="text-2xl font-bold">
        {commonCopy.messages.storyNotFound.title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-text-muted">
        {commonCopy.messages.storyNotFound.body}
      </p>
      <Button className="mt-5" onClick={onOpenDashboard} size="sm">
        <Home aria-hidden="true" size={16} />
        {commonCopy.actions.dashboard}
      </Button>
    </section>
  )
}
