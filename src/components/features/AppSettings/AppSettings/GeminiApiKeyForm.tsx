import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { TextInput } from '@/components/ui/TextInput'
import { appSettingsCopy } from '@/copy'

interface Props {
  readonly canCancel: boolean
  readonly canSave: boolean
  readonly geminiApiKeyDraft: string
  readonly onCancel: () => void
  readonly onGeminiApiKeyDraftChange: (apiKey: string) => void
  readonly onSave: () => void
}

export function GeminiApiKeyForm({
  canCancel,
  canSave,
  geminiApiKeyDraft,
  onCancel,
  onGeminiApiKeyDraftChange,
  onSave,
}: Props) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSave()
      }}
    >
      <Field label={appSettingsCopy.geminiApiKey.fieldLabel}>
        <TextInput
          autoComplete="off"
          onChange={(event) => onGeminiApiKeyDraftChange(event.target.value)}
          placeholder={appSettingsCopy.geminiApiKey.fieldPlaceholder}
          type="password"
          value={geminiApiKeyDraft}
        />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={!canSave} type="submit" variant="primary">
          {appSettingsCopy.actions.saveGeminiApiKey}
        </Button>
        {canCancel ? (
          <Button onClick={onCancel} variant="secondary">
            {appSettingsCopy.actions.cancelReplace}
          </Button>
        ) : null}
      </div>
    </form>
  )
}
