import { Home, PenLine } from 'lucide-react'

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-5 py-12 sm:px-8 lg:px-10">
        <div className="border-b border-stone-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            TreeTales
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Page not found
          </h1>
        </div>

        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
              <PenLine aria-hidden="true" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                This branch does not exist.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                The story path you opened is not available. Return to the
                dashboard to choose an existing story or start a new one.
              </p>
              <a
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
                href="/"
              >
                <Home aria-hidden="true" size={18} />
                Back to dashboard
              </a>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
