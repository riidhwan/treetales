import {
  type StoryDashboardServices,
  useStoryDashboard,
} from '@/hooks/useStoryDashboard'
import { Alert } from '@/components/ui/Alert'

import {
  DASHBOARD_DISPLAY_FONT,
  DASHBOARD_ITALIC_FONT,
} from './StoryDashboard/dashboardDisplay'
import { DashboardStoriesContent } from './StoryDashboard/DashboardStoriesContent'
import { NewStoryCallToAction } from './StoryDashboard/NewStoryCallToAction'
import { NewStoryForm } from './StoryDashboard/NewStoryForm'

interface Props {
  readonly onEditStory: (storyId: string) => void
  readonly onOpenStory: (storyId: string) => void
  readonly onReadStory: (storyId: string) => void
  readonly services?: StoryDashboardServices
}

export function StoryDashboard({
  onEditStory,
  onOpenStory,
  onReadStory,
  services,
}: Props) {
  const {
    canCreate,
    createExampleStoryFromTemplate,
    createStoryFromForm,
    description,
    errorMessage,
    isCreatingExample,
    isFormOpen,
    isLoading,
    setDescription,
    setIsFormOpen,
    setTitle,
    sortedStories,
    title,
  } = useStoryDashboard({
    onEditStory,
    onReadStory,
    services,
  })

  return (
    <main className="min-h-screen bg-background-app text-text-primary">
      <header>
        <div className="mx-auto flex min-h-28 w-full max-w-4xl items-center gap-4 px-5 sm:px-8 lg:px-10">
          <img
            alt=""
            aria-hidden="true"
            className="size-14 rounded-2xl shadow-md"
            src="/logo192.png"
          />
          <p
            className="text-3xl font-bold text-action-primary"
            style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
          >
            TreeTales
          </p>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 pb-14 pt-8 sm:px-8 lg:px-10">
        <header className="grid gap-7">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5">
            <p className="text-sm font-semibold uppercase leading-none text-focus-ring">
              Your Library
            </p>
            <span className="h-px bg-border-subtle" />
          </div>
          <div className="max-w-2xl">
            <h1
              aria-label="Your stories"
              className="grid text-5xl font-bold leading-[0.95] text-text-primary sm:text-7xl"
              style={{ fontFamily: DASHBOARD_DISPLAY_FONT }}
            >
              <span>Your</span>
              <span
                className="font-bold italic text-action-primary"
                style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
              >
                stories
              </span>
            </h1>
            <p
              className="mt-4 max-w-xl text-lg italic leading-7 text-text-muted sm:text-xl sm:leading-8"
              style={{ fontFamily: DASHBOARD_ITALIC_FONT }}
            >
              Every branch, every choice, all your worlds right here.
            </p>
          </div>
        </header>

        <NewStoryCallToAction
          isExpanded={isFormOpen}
          isVisible={sortedStories.length > 0}
          onOpen={() => setIsFormOpen(true)}
        />

        <NewStoryForm
          canCreate={canCreate}
          description={description}
          isOpen={isFormOpen}
          onCreateStory={createStoryFromForm}
          onDescriptionChange={setDescription}
          onTitleChange={setTitle}
          title={title}
        />

        {errorMessage ? (
          <Alert role="alert" variant="error">
            {errorMessage}
          </Alert>
        ) : null}

        <DashboardStoriesContent
          isCreatingExample={isCreatingExample}
          isLoading={isLoading}
          onCreateExampleStory={createExampleStoryFromTemplate}
          onOpenNewStoryForm={() => setIsFormOpen(true)}
          onOpenStory={onOpenStory}
          stories={sortedStories}
        />
      </section>
    </main>
  )
}
