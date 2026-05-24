interface Props {
  readonly description: string
  readonly kicker?: string
  readonly title: string
}

export function ChapterWritingMissingState({
  description,
  kicker,
  title,
}: Props) {
  return (
    <section className="rounded-lg border border-tt-line bg-tt-paper p-6 shadow-sm">
      {kicker ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
          {kicker}
        </p>
      ) : null}
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-tt-muted">{description}</p>
    </section>
  )
}
