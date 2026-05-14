import { useState } from 'react'
import { Eye, Pencil } from 'lucide-react'

import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { TextArea } from '@/components/ui/TextArea'

interface Props {
  readonly label: string
  readonly name: string
  readonly onChange: (value: string) => void
  readonly value: string
}

export function MarkdownEditor({ label, name, onChange, value }: Props) {
  const [isPreviewing, setIsPreviewing] = useState(false)

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium text-stone-800">{label}</div>
      <div className="relative">
        {isPreviewing ? (
          <section
            aria-label={`${label} preview`}
            className="min-h-64 rounded-md border border-stone-200 bg-stone-50 px-3 py-2"
          >
            <MarkdownContent
              className="space-y-4 pb-16"
              content={value}
              emptyFallback="Nothing to preview yet."
            />
          </section>
        ) : (
          <label className="grid gap-2">
            <span className="sr-only">{label}</span>
            <TextArea
              className="min-h-64 pb-16"
              name={name}
              onChange={(event) => onChange(event.target.value)}
              value={value}
            />
          </label>
        )}

        <button
          aria-pressed={isPreviewing}
          className="sticky bottom-4 z-10 ml-auto mt-3 flex min-h-10 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-100"
          onClick={() => setIsPreviewing((current) => !current)}
          type="button"
        >
          {isPreviewing ? (
            <Pencil aria-hidden="true" size={16} />
          ) : (
            <Eye aria-hidden="true" size={16} />
          )}
          {isPreviewing ? 'Edit' : 'Preview'}
        </button>
      </div>
    </div>
  )
}
