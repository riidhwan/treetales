import { Download, ExternalLink } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

type InstallStatus = 'accepted' | 'dismissed' | 'error' | 'guidance' | 'idle'

interface Props {
  readonly installStatus: InstallStatus
  readonly onContinue: () => void
  readonly onInstall: () => void
}

export function MobileInstallChoice({
  installStatus,
  onContinue,
  onInstall,
}: Props) {
  return (
    <main className="flex min-h-screen bg-stone-50 px-5 py-8 text-stone-950">
      <section className="mx-auto flex w-full max-w-md flex-col justify-center gap-6">
        <header className="border-b border-stone-200 pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            TreeTales
          </p>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Add TreeTales to your home screen for a focused app experience, or
            continue in your mobile browser.
          </p>
        </header>

        {installStatus === 'guidance' ? (
          <Alert role="status">
            Open your browser menu and choose Add to Home Screen or Install App.
          </Alert>
        ) : null}

        {installStatus === 'dismissed' ? (
          <Alert role="status">
            Installation was dismissed. You can try again or continue to the
            mobile site.
          </Alert>
        ) : null}

        {installStatus === 'error' ? (
          <Alert role="alert" variant="error">
            Installation could not start. Use your browser menu to add
            TreeTales to your home screen.
          </Alert>
        ) : null}

        <div className="grid gap-3">
          <Button
            className="w-full"
            onClick={onInstall}
            variant="primary"
          >
            <Download aria-hidden="true" size={18} />
            Install App
          </Button>
          <Button className="w-full" onClick={onContinue}>
            <ExternalLink aria-hidden="true" size={18} />
            Continue to Mobile Site
          </Button>
        </div>
      </section>
    </main>
  )
}
