import type {
  Chapter,
  Story,
  UpdateChapterInput,
  UpdateStoryInput,
} from '@/services/types'

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

export interface UpdateChapterRepositoryInput extends UpdateChapterInput {
  readonly updatedAt: number
}

export interface DeleteChapterRepositoryInput {
  readonly unlinkedChildrenUpdatedAt: number
}

export interface ChapterRepository {
  readonly insertChapter: (chapter: Chapter) => Promise<void>
  readonly findChapterById: (id: string) => Promise<Chapter | undefined>
  readonly findChaptersByStoryId: (storyId: string) => Promise<Chapter[]>
  readonly findIntroChapterByStoryId: (
    storyId: string,
  ) => Promise<Chapter | undefined>
  readonly findChildChapters: (chapterId: string) => Promise<Chapter[]>
  readonly updateChapter: (
    id: string,
    input: UpdateChapterRepositoryInput,
  ) => Promise<Chapter | undefined>
  readonly deleteChapter: (
    id: string,
    input: DeleteChapterRepositoryInput,
  ) => Promise<boolean>
}
