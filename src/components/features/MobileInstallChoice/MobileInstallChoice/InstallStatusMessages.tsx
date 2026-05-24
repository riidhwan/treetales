import { Alert } from '@/components/ui/Alert'

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
        Open your browser menu and choose Add to Home Screen or Install App.
      </Alert>
    )
  }

  if (isWaitingForNativePrompt) {
    return (
      <Alert role="status">
        TreeTales is checking whether your browser can show its install prompt.
      </Alert>
    )
  }

  if (installStatus === 'dismissed') {
    return (
      <Alert role="status">
        Installation was dismissed. You can try again or continue to the mobile
        site.
      </Alert>
    )
  }

  if (installStatus === 'error') {
    return (
      <Alert role="alert" variant="error">
        Installation could not start. Use your browser menu to add TreeTales to
        your home screen.
      </Alert>
    )
  }

  return null
}
