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
  parentChapterId: string | null
  createdAt: number
  updatedAt: number
}

export type CharacterGender = 'female' | 'male'

export interface CharacterProperty {
  key: string
  value: string
}

export interface Character {
  id: string
  storyId: string
  name: string
  gender: CharacterGender
  properties: CharacterProperty[]
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
  parentChapterId: string | null
}

export interface UpdateChapterInput {
  title?: string
  content?: string
  parentChapterId?: string | null
}

export interface CreateCharacterInput {
  storyId: string
  name: string
  gender: CharacterGender
  properties: CharacterProperty[]
}

export interface UpdateCharacterInput {
  name?: string
  gender?: CharacterGender
  properties?: CharacterProperty[]
}
