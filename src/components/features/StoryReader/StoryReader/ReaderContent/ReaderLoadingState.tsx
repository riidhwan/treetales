import { Alert } from '@/components/ui/Alert'
import { commonCopy } from '@/copy'

export function ReaderLoadingState() {
  return <Alert className="shadow-sm">{commonCopy.messages.loadingStory}</Alert>
}
