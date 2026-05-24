import { useMobileInstallChoice } from '@/hooks/useMobileInstallChoice'
import type { StoryDashboardServices } from '@/hooks/useStoryDashboard'

import { HomeExperienceContent } from './HomeExperience/HomeExperienceContent'

interface Props {
  readonly onEditStory: (storyId: string) => void
  readonly onOpenStory: (storyId: string) => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryDashboardServices
}

export function HomeExperience({
  onEditStory,
  onOpenStory,
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

  return (
    <HomeExperienceContent
      canInstallNatively={canInstallNatively}
      installStatus={installStatus}
      isReady={isReady}
      onContinueToMobileSite={continueToMobileSite}
      onEditStory={onEditStory}
      onInstallApp={installApp}
      onOpenStory={onOpenStory}
      onReadStory={onReadStory}
      services={services}
      shouldShowInstallChoice={shouldShowInstallChoice}
    />
  )
}
