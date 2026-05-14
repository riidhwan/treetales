import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { HomeExperience } from '@/components/features/HomeExperience'

export const Route = createFileRoute('/')({ component: HomeRoute })

function HomeRoute() {
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <HomeExperience
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
