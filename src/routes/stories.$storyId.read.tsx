import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { StoryReader } from '@/components/features/StoryReader'

export const Route = createFileRoute('/stories/$storyId/read')({
  component: StoryReaderRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    chapterId:
      typeof search.chapterId === 'string' && search.chapterId.length > 0
        ? search.chapterId
        : undefined,
  }),
})

function StoryReaderRoute() {
  const { storyId } = Route.useParams()
  const { chapterId } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <StoryReader
      chapterId={chapterId}
      onEditStory={(selectedStoryId) =>
        void navigate({
          to: '/stories/$storyId/edit',
          params: { storyId: selectedStoryId },
        })
      }
      onOpenDashboard={() =>
        void navigate({
          to: '/',
        })
      }
      onSelectChapter={(nextChapterId) =>
        void navigate({
          search: () => ({ chapterId: nextChapterId }),
        })
      }
      storyId={storyId}
    />
  )
}
