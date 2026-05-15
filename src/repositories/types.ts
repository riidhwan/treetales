import type { Story, UpdateStoryInput } from '@/services/types'

export interface UpdateStoryRepositoryInput extends UpdateStoryInput {
  readonly updatedAt: number
}

export interface StoryRepository {
  readonly insertStory: (story: Story) => Promise<void>
  readonly findStories: () => Promise<Story[]>
  readonly findStoryById: (id: string) => Promise<Story | undefined>
  readonly updateStory: (
    id: string,
    input: UpdateStoryRepositoryInput,
  ) => Promise<Story | undefined>
  readonly deleteStory: (id: string) => Promise<boolean>
}
