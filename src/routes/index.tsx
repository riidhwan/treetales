import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { StoryDashboard } from '@/components/features/StoryDashboard'

export const Route = createFileRoute('/')({ component: HomeRoute })

function HomeRoute() {
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <StoryDashboard
      onEditStory={(storyId) =>
        void navigate({
          to: '/stories/$storyId/edit',
          params: { storyId },
        })
      }
      onReadStory={(storyId) =>
        void navigate({
          to: '/stories/$storyId/read',
          params: { storyId },
          search: { chapterId: undefined },
        })
      }
    />
  )
}
