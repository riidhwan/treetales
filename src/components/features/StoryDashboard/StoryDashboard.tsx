import { Settings } from 'lucide-react'

import {
  type StoryDashboardServices,
  useStoryDashboard,
} from '@/hooks/useStoryDashboard'
import { Alert } from '@/components/ui/Alert'
import { IconButton } from '@/components/ui/IconButton'
import { appCopy, storyDashboardCopy } from '@/copy'

import {
  DASHBOARD_DISPLAY_FONT,
  DASHBOARD_ITALIC_FONT,
} from './StoryDashboard/dashboardDisplay'
import { DashboardStoriesContent } from './StoryDashboard/DashboardStoriesContent'
import { NewStoryCallToAction } from './StoryDashboard/NewStoryCallToAction'
import { NewStoryForm } from './StoryDashboard/NewStoryForm'

interface Props {
  readonly onEditStory: (storyId: string) => void
  readonly onOpenAppSettings: () => void
  readonly onOpenStory: (storyId: string) => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryDashboardServices
}

export function StoryDashboard({
  onEditStory,
  onOpenAppSettings,
  onOpenStory,
  onReadStory,
  services,
}: Props) {
  const {
    canCreate,
    createOrReuseStarterStory,
    createStoryFromForm,
    creatingStarterId,
    description,
    errorMessage,
    isFormOpen,
    isLoading,
    setDescription,
    setIsFormOpen,
    setTitle,
    sortedStories,
    starterStories,
    title,
    unavailableStarterId,
  } = useStoryDashboard({
    onEditStory,
    onReadStory,
    services,
  })

  return (
    <main className="min-h-screen bg-background-app text-text-primary">
      <header>
        <div className="mx-auto flex min-h-20 w-full max-w-4xl items-center justify-between gap-3 px-5 sm:min-h-24 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <img
              alt=""
              aria-hidden="true"
              className="size-11 rounded-xl shadow-md sm:size-12"
              src="/logo192.png"
            />
            <p
              className="truncate text-2xl font-bold text-action-primary"
              style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
            >
              {appCopy.brand}
            </p>
          </div>
          <IconButton
            label={storyDashboardCopy.actions.openAppSettings}
            onClick={onOpenAppSettings}
            variant="ghost"
          >
            <Settings aria-hidden="true" size={21} />
          </IconButton>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 pb-12 pt-5 sm:gap-6 sm:px-8 sm:pt-6 lg:px-10">
        <header className="grid gap-5">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
            <p className="text-xs font-semibold uppercase leading-none text-focus-ring">
              {storyDashboardCopy.header.kicker}
            </p>
            <span className="h-px bg-border-subtle" />
          </div>
          <div className="max-w-2xl">
            <h1
              aria-label={storyDashboardCopy.header.ariaTitle}
              className="grid text-4xl font-bold leading-[0.95] text-text-primary sm:text-5xl"
              style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
            >
              <span>{storyDashboardCopy.header.titleFirstLine}</span>
              <span
                className="font-bold italic text-action-primary"
                style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
              >
                {storyDashboardCopy.header.titleSecondLine}
              </span>
            </h1>
            <p
              className="mt-3 max-w-xl text-base italic leading-6 text-text-muted"
              style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
            >
              {storyDashboardCopy.header.subtitle}
            </p>
          </div>
        </header>

        <div className="grid">
          <NewStoryCallToAction
            isExpanded={isFormOpen}
            isVisible={sortedStories.length > 0}
            onToggle={() =>
              setIsFormOpen((currentIsFormOpen) => !currentIsFormOpen)
            }
          />

          <NewStoryForm
            canCreate={canCreate}
            description={description}
            isConnectedToCallToAction={sortedStories.length > 0}
            isOpen={isFormOpen}
            onCreateStory={createStoryFromForm}
            onDescriptionChange={setDescription}
            onTitleChange={setTitle}
            title={title}
          />
        </div>

        {errorMessage ? (
          <Alert role="alert" variant="error">
            {errorMessage}
          </Alert>
        ) : null}

        <DashboardStoriesContent
          creatingStarterId={creatingStarterId}
          isLoading={isLoading}
          onOpenNewStoryForm={() => setIsFormOpen(true)}
          onOpenStory={onOpenStory}
          onOpenStarterStory={createOrReuseStarterStory}
          starterStories={starterStories}
          stories={sortedStories}
          unavailableStarterId={unavailableStarterId}
        />
      </section>
    </main>
  )
}
