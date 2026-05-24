import { Download, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { appCopy, mobileInstallChoiceCopy } from '@/copy'

import {
  InstallStatusMessages,
  type InstallStatus,
} from './MobileInstallChoice/InstallStatusMessages'

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
            {appCopy.brand}
          </p>
          <p className="mt-3 text-sm leading-6 text-tt-muted">
            {mobileInstallChoiceCopy.body}
          </p>
        </header>

        <InstallStatusMessages
          installStatus={installStatus}
          isWaitingForNativePrompt={isWaitingForNativePrompt}
        />

        <div className="grid gap-3">
          <Button
            className="w-full"
            disabled={isWaitingForNativePrompt}
            onClick={onInstall}
            variant="primary"
          >
            <Download aria-hidden="true" size={18} />
            {mobileInstallChoiceCopy.actions.installApp}
          </Button>
          <Button className="w-full" onClick={onContinue}>
            <ExternalLink aria-hidden="true" size={18} />
            {mobileInstallChoiceCopy.actions.continueToMobileSite}
          </Button>
        </div>
      </section>
    </main>
  )
}
