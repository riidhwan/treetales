import { Download, ExternalLink } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

type InstallStatus =
  | 'accepted'
  | 'dismissed'
  | 'error'
  | 'guidance'
  | 'idle'
  | 'pending'

interface Props {
  readonly canInstallNatively: boolean
  readonly installStatus: InstallStatus
  readonly onContinue: () => void
  readonly onInstall: () => void
}

export function MobileInstallChoice({
  canInstallNatively,
  installStatus,
  onContinue,
  onInstall,
}: Props) {
  const isWaitingForNativePrompt =
    installStatus === 'pending' && !canInstallNatively

  return (
    <main className="flex min-h-screen bg-tt-parchment px-5 py-8 text-tt-ink">
      <section className="mx-auto flex w-full max-w-md flex-col justify-center gap-6">
        <header className="border-b border-tt-line pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-tt-moss">
            TreeTales
          </p>
          <p className="mt-3 text-sm leading-6 text-tt-muted">
            Add TreeTales to your home screen for a focused app experience, or
            continue in your mobile browser.
          </p>
        </header>

        {installStatus === 'guidance' ? (
          <Alert role="status">
            Open your browser menu and choose Add to Home Screen or Install App.
          </Alert>
        ) : null}

        {isWaitingForNativePrompt ? (
          <Alert role="status">
            TreeTales is checking whether your browser can show its install
            prompt.
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
            disabled={isWaitingForNativePrompt}
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
