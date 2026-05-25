import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { AppSettings } from '@/components/features/AppSettings'

export const Route = createFileRoute('/settings')({ component: SettingsRoute })

function SettingsRoute() {
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <AppSettings
      onBackToLibrary={() =>
        void navigate({
          to: '/',
        })
      }
    />
  )
}
