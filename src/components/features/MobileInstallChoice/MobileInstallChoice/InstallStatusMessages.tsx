import { Alert } from '@/components/ui/Alert'
import { mobileInstallChoiceCopy } from '@/copy'

export type InstallStatus =
  | 'accepted'
  | 'dismissed'
  | 'error'
  | 'guidance'
  | 'idle'
  | 'pending'

interface Props {
  readonly installStatus: InstallStatus
  readonly isWaitingForNativePrompt: boolean
}

export function InstallStatusMessages({
  installStatus,
  isWaitingForNativePrompt,
}: Props) {
  if (installStatus === 'guidance') {
    return (
      <Alert role="status">
        {mobileInstallChoiceCopy.status.guidance}
      </Alert>
    )
  }

  if (isWaitingForNativePrompt) {
    return (
      <Alert role="status">
        {mobileInstallChoiceCopy.status.pending}
      </Alert>
    )
  }

  if (installStatus === 'dismissed') {
    return (
      <Alert role="status">
        {mobileInstallChoiceCopy.status.dismissed}
      </Alert>
    )
  }

  if (installStatus === 'error') {
    return (
      <Alert role="alert" variant="error">
        {mobileInstallChoiceCopy.status.error}
      </Alert>
    )
  }

  return null
}
