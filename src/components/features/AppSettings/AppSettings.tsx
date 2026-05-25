import { ChevronLeft, KeyRound } from 'lucide-react'

import {
  type AppSettingsServices,
  useAppSettings,
} from '@/hooks/useAppSettings'
import { Button } from '@/components/ui/Button'
import { appSettingsCopy } from '@/copy'

import { SettingsPanelContent } from './AppSettings/SettingsPanelContent'

interface Props {
  readonly onBackToLibrary: () => void
  readonly services?: AppSettingsServices
}

export function AppSettings({ onBackToLibrary, services }: Props) {
  const {
    canClearGeminiApiKey,
    canSaveGeminiApiKey,
    cancelReplacingGeminiApiKey,
    clearSavedGeminiApiKey,
    errorMessage,
    geminiApiKeyDraft,
    geminiApiKeyError,
    geminiApiKeyFormMode,
    hasGeminiApiKey,
    saveGeminiApiKeyDraft,
    setGeminiApiKeyDraft,
    startReplacingGeminiApiKey,
    status,
    statusMessage,
  } = useAppSettings({ services })

  return (
    <main className="min-h-screen bg-background-app text-text-primary">
      <header className="border-b border-border-subtle/70 bg-surface-paper/35">
        <nav
          aria-label={appSettingsCopy.heading.title}
          className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-8"
        >
          <Button onClick={onBackToLibrary} size="sm" variant="ghost">
            <ChevronLeft aria-hidden="true" size={18} />
            {appSettingsCopy.actions.backToLibrary}
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <header className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-text-primary">
            {appSettingsCopy.heading.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
            {appSettingsCopy.heading.subtitle}
          </p>
        </header>

        <aside aria-label="Settings categories">
          <div className="rounded-md border border-border-subtle bg-surface-paper/70 p-2 shadow-sm">
            <button
              aria-current="page"
              className="grid w-full gap-1 rounded-md bg-highlight-soft/55 px-3 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              type="button"
            >
              <span className="font-semibold text-text-primary">
                {appSettingsCopy.categories.writingAssist.title}
              </span>
              <span className="leading-5 text-text-muted">
                {appSettingsCopy.categories.writingAssist.description}
              </span>
            </button>
          </div>
        </aside>

        <section
          aria-labelledby="writing-assist-settings-title"
          className="rounded-md border border-border-subtle bg-surface-paper p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span className="inline-grid size-10 shrink-0 place-items-center rounded-md bg-highlight-soft text-action-primary">
              <KeyRound aria-hidden="true" size={20} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase text-focus-ring">
                {appSettingsCopy.categories.writingAssist.title}
              </p>
              <h2
                className="mt-1 text-xl font-bold"
                id="writing-assist-settings-title"
              >
                {appSettingsCopy.geminiApiKey.title}
              </h2>
            </div>
          </div>

          <SettingsPanelContent
            canClearGeminiApiKey={canClearGeminiApiKey}
            canSaveGeminiApiKey={canSaveGeminiApiKey}
            errorMessage={errorMessage}
            geminiApiKeyDraft={geminiApiKeyDraft}
            geminiApiKeyError={geminiApiKeyError}
            geminiApiKeyFormMode={geminiApiKeyFormMode}
            hasGeminiApiKey={hasGeminiApiKey}
            onCancelReplacingGeminiApiKey={cancelReplacingGeminiApiKey}
            onClearSavedGeminiApiKey={() => void clearSavedGeminiApiKey()}
            onGeminiApiKeyDraftChange={setGeminiApiKeyDraft}
            onSaveGeminiApiKeyDraft={() => void saveGeminiApiKeyDraft()}
            onStartReplacingGeminiApiKey={startReplacingGeminiApiKey}
            status={status}
            statusMessage={statusMessage}
          />
        </section>
      </section>
    </main>
  )
}
