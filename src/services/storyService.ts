import { createIndexedDbStoryRepository } from '@/repositories/indexedDb/storyRepository'
import { createIndexedDbRepositoryUnitOfWork } from '@/repositories/indexedDb/unitOfWork'
import type { CreateStoryInput, Story, UpdateStoryInput } from '@/services/types'

const storyRepository = createIndexedDbStoryRepository()
const repositoryUnitOfWork = createIndexedDbRepositoryUnitOfWork()

export async function createStory(input: CreateStoryInput): Promise<Story> {
  const now = Date.now()
  const story: Story = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  }

  await storyRepository.insertStory(story)

  return story
}

export function getStories(): Promise<Story[]> {
  return storyRepository.findStories()
}

export function getStoryById(id: string): Promise<Story | undefined> {
  return storyRepository.findStoryById(id)
}

export function updateStory(
  id: string,
  input: UpdateStoryInput,
): Promise<Story | undefined> {
  return storyRepository.updateStory(id, {
    ...input,
    updatedAt: Date.now(),
  })
}

export async function deleteStory(id: string): Promise<boolean> {
  const unlinkedChildrenUpdatedAt = Date.now()

  return repositoryUnitOfWork.run(async ({ stories, chapters }) => {
    const story = await stories.findStoryById(id)
    if (!story) {
      return false
    }

    const storyChapters = await chapters.findChaptersByStoryId(id)

    for (const chapter of storyChapters) {
      await chapters.deleteChapter(chapter.id, {
        unlinkedChildrenUpdatedAt,
      })
    }

    return stories.deleteStory(id)
  })
}
