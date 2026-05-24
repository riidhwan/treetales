import { commonCopy } from '@/copy'

export function ReaderMissingStoryState() {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface-paper p-6 shadow-sm">
      <h1 className="text-2xl font-bold">
        {commonCopy.messages.storyNotFound.title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-text-muted">
        {commonCopy.messages.storyNotFound.body}
      </p>
    </section>
  )
}
