import { createIndexedDbStoryRepository } from '@/repositories/indexedDb/storyRepository'
import { createIndexedDbRepositoryUnitOfWork } from '@/repositories/indexedDb/unitOfWork'
import type { StoryRepository } from '@/repositories/types'
import { deleteIllustrationFiles } from '@/services/characterIllustrationService'
import type { CreateStoryInput, Story, UpdateStoryInput } from '@/services/types'

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

  const storyRepository = getStoryRepository()
  await storyRepository.insertStory(story)

  return story
}

export async function getStories(): Promise<Story[]> {
  const storyRepository = getStoryRepository()

  return storyRepository.findStories()
}

export async function getStoryById(id: string): Promise<Story | undefined> {
  const storyRepository = getStoryRepository()

  return storyRepository.findStoryById(id)
}

export async function updateStory(
  id: string,
  input: UpdateStoryInput,
): Promise<Story | undefined> {
  const storyRepository = getStoryRepository()

  return storyRepository.updateStory(id, {
    ...input,
    updatedAt: Date.now(),
  })
}

export async function deleteStory(id: string): Promise<boolean> {
  const unlinkedChildrenUpdatedAt = Date.now()
  const deletedIllustrations = await repositoryUnitOfWork.run(
    async ({ stories, chapters, characters, characterIllustrations }) => {
      const story = await stories.findStoryById(id)
      if (!story) {
        return undefined
      }

      const storyChapters = await chapters.findChaptersByStoryId(id)

      for (const chapter of storyChapters) {
        await chapters.deleteChapter(chapter.id, {
          unlinkedChildrenUpdatedAt,
        })
      }

      const illustrations =
        await characterIllustrations.deleteCharacterIllustrationsByStoryId(id)

      await characters.deleteCharactersByStoryId(id)
      await stories.deleteStory(id)

      return illustrations
    },
  )

  if (!deletedIllustrations) {
    return false
  }

  await deleteIllustrationFiles(deletedIllustrations)

  return true
}

function getStoryRepository(): StoryRepository {
  return createIndexedDbStoryRepository()
}
