import { Alert } from '@/components/ui/Alert'

interface Props {
  readonly errorMessage?: string
}

export function ReaderErrorState({ errorMessage }: Props) {
  return (
    <Alert role="alert" variant="error">
      {errorMessage}
    </Alert>
  )
}
