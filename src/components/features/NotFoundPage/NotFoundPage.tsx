import { Home, PenLine } from 'lucide-react'

import { appCopy, notFoundCopy } from '@/copy'

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-tt-parchment text-tt-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-5 py-12 sm:px-8 lg:px-10">
        <div className="border-b border-tt-line pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
            {appCopy.brand}
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {notFoundCopy.heading}
          </h1>
        </div>

        <section className="mt-8 rounded-lg border border-tt-line bg-tt-paper p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-tt-moss-soft text-tt-moss-dark">
              <PenLine aria-hidden="true" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {notFoundCopy.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-tt-muted">
                {notFoundCopy.body}
              </p>
              <a
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-tt-moss-dark bg-tt-moss px-4 text-sm font-semibold text-tt-paper shadow-sm transition hover:bg-tt-moss-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-gold"
                href="/"
              >
                <Home aria-hidden="true" size={18} />
                {notFoundCopy.action}
              </a>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
