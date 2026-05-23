import { createFileRoute } from '@tanstack/react-router'

import { StyleGuidePage } from '@/components/features/StyleGuidePage'

export const Route = createFileRoute('/__style-guide')({
  component: StyleGuideRoute,
})

function StyleGuideRoute() {
  return <StyleGuidePage isEnabled={import.meta.env.DEV} />
}
