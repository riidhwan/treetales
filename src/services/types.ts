export interface Story {
  id: string
  title: string
  description: string
  createdAt: number
  updatedAt: number
}

export interface Chapter {
  id: string
  storyId: string
  title: string
  content: string
  parentChapterIds: string[]
  createdAt: number
  updatedAt: number
}

export interface CreateStoryInput {
  title: string
  description: string
}

export interface UpdateStoryInput {
  title?: string
  description?: string
}

export interface CreateChapterInput {
  storyId: string
  title: string
  content: string
  parentChapterIds: string[]
}

export interface UpdateChapterInput {
  title?: string
  content?: string
  parentChapterIds?: string[]
}
