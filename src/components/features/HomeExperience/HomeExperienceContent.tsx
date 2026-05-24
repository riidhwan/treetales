import { MobileInstallChoice } from '@/components/features/MobileInstallChoice'
import { StoryDashboard } from '@/components/features/StoryDashboard'
import { useMobileInstallChoice } from '@/hooks/useMobileInstallChoice'
import type { StoryDashboardServices } from '@/hooks/useStoryDashboard'

interface Props {
  readonly canInstallNatively: boolean
  readonly installStatus: ReturnType<typeof useMobileInstallChoice>['installStatus']
  readonly isReady: boolean
  readonly onContinueToMobileSite: () => void
  readonly onEditStory: (storyId: string) => void
  readonly onInstallApp: () => Promise<unknown>
  readonly onOpenStory: (storyId: string) => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryDashboardServices
  readonly shouldShowInstallChoice: boolean
}

export function HomeExperienceContent({
  canInstallNatively,
  installStatus,
  isReady,
  onContinueToMobileSite,
  onEditStory,
  onInstallApp,
  onOpenStory,
  onReadStory,
  services,
  shouldShowInstallChoice,
}: Props) {
  if (!isReady) {
    return null
  }

  if (shouldShowInstallChoice) {
    return (
      <MobileInstallChoice
        canInstallNatively={canInstallNatively}
        installStatus={installStatus}
        onContinue={onContinueToMobileSite}
        onInstall={() => void onInstallApp()}
      />
    )
  }

  return (
    <StoryDashboard
      onEditStory={onEditStory}
      onOpenStory={onOpenStory}
      onReadStory={onReadStory}
      services={services}
    />
  )
}
