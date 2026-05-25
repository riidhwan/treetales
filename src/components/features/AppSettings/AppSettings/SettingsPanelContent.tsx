import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { appSettingsCopy } from '@/copy'

import { GeminiApiKeyForm } from './GeminiApiKeyForm'

interface Props {
  readonly canClearGeminiApiKey: boolean
  readonly canSaveGeminiApiKey: boolean
  readonly errorMessage: string
  readonly geminiApiKeyDraft: string
  readonly geminiApiKeyError: string
  readonly geminiApiKeyFormMode: 'entry' | 'replace' | 'saved'
  readonly hasGeminiApiKey: boolean
  readonly onCancelReplacingGeminiApiKey: () => void
  readonly onClearSavedGeminiApiKey: () => void
  readonly onGeminiApiKeyDraftChange: (apiKey: string) => void
  readonly onSaveGeminiApiKeyDraft: () => void
  readonly onStartReplacingGeminiApiKey: () => void
  readonly status: 'error' | 'loading' | 'ready'
  readonly statusMessage: string
}

export function SettingsPanelContent({
  canClearGeminiApiKey,
  canSaveGeminiApiKey,
  errorMessage,
  geminiApiKeyDraft,
  geminiApiKeyError,
  geminiApiKeyFormMode,
  hasGeminiApiKey,
  onCancelReplacingGeminiApiKey,
  onClearSavedGeminiApiKey,
  onGeminiApiKeyDraftChange,
  onSaveGeminiApiKeyDraft,
  onStartReplacingGeminiApiKey,
  status,
  statusMessage,
}: Props) {
  if (status === 'loading') {
    return (
      <p className="mt-6 text-sm text-text-muted">{appSettingsCopy.loading}</p>
    )
  }

  if (status === 'error') {
    return (
      <Alert className="mt-6" role="alert" variant="error">
        {errorMessage}
      </Alert>
    )
  }

  return (
    <div className="mt-6 grid gap-5">
      {statusMessage ? (
        <Alert role="status" variant="success">
          {statusMessage}
        </Alert>
      ) : null}

      <p className="text-sm leading-6 text-text-muted">
        {hasGeminiApiKey
          ? appSettingsCopy.geminiApiKey.savedDescription
          : appSettingsCopy.geminiApiKey.emptyDescription}
      </p>

      {geminiApiKeyError ? (
        <Alert role="alert" variant="error">
          {geminiApiKeyError}
        </Alert>
      ) : null}

      {geminiApiKeyFormMode === 'saved' ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={onStartReplacingGeminiApiKey} variant="secondary">
            {appSettingsCopy.actions.replaceGeminiApiKey}
          </Button>
          <Button
            disabled={!canClearGeminiApiKey}
            onClick={onClearSavedGeminiApiKey}
            variant="danger"
          >
            {appSettingsCopy.actions.clearGeminiApiKey}
          </Button>
        </div>
      ) : (
        <GeminiApiKeyForm
          canCancel={hasGeminiApiKey}
          canSave={canSaveGeminiApiKey}
          geminiApiKeyDraft={geminiApiKeyDraft}
          onCancel={onCancelReplacingGeminiApiKey}
          onGeminiApiKeyDraftChange={onGeminiApiKeyDraftChange}
          onSave={onSaveGeminiApiKeyDraft}
        />
      )}

      <p className="rounded-md border border-border-subtle bg-surface-paper-deep/45 px-4 py-3 text-sm leading-6 text-text-muted">
        {appSettingsCopy.geminiApiKey.securityNote}
      </p>
    </div>
  )
}
