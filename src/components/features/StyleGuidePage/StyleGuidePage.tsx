import { StyleGuideContent } from './StyleGuidePage/StyleGuideContent'

interface Props {
  readonly isEnabled?: boolean
}

export function StyleGuidePage({ isEnabled = true }: Props) {
  return <StyleGuideContent isEnabled={isEnabled} />
}
