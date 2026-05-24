import { Home } from 'lucide-react'

import { Button } from '@/components/ui/Button'

interface Props {
  readonly onOpenDashboard: () => void
}

export function MissingStoryDetail({ onOpenDashboard }: Props) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface-paper p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Story not found</h1>
      <p className="mt-3 text-sm leading-6 text-text-muted">
        This story may have been deleted or is unavailable in this browser.
      </p>
      <Button className="mt-5" onClick={onOpenDashboard} size="sm">
        <Home aria-hidden="true" size={16} />
        Dashboard
      </Button>
    </section>
  )
}
