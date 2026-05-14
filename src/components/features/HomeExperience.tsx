import { type StoryDashboardServices } from '@/hooks/useStoryDashboard'
import { useMobileInstallChoice } from '@/hooks/useMobileInstallChoice'
import { MobileInstallChoice } from '@/components/features/MobileInstallChoice'
import { StoryDashboard } from '@/components/features/StoryDashboard'

interface Props {
  readonly onEditStory: (storyId: string) => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryDashboardServices
}

export function HomeExperience({
  onEditStory,
  onReadStory,
  services,
}: Props) {
  const {
    canInstallNatively,
    continueToMobileSite,
    installApp,
    installStatus,
    isReady,
    shouldShowInstallChoice,
  } = useMobileInstallChoice()

  if (!isReady) {
    return null
  }

  if (shouldShowInstallChoice) {
    return (
      <MobileInstallChoice
        canInstallNatively={canInstallNatively}
        installStatus={installStatus}
        onContinue={continueToMobileSite}
        onInstall={() => void installApp()}
      />
    )
  }

  return (
    <StoryDashboard
      onEditStory={onEditStory}
      onReadStory={onReadStory}
      services={services}
    />
  )
}
