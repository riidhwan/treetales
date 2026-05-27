export interface Story {
  id: string
  title: string
  description: string
  builtInExampleStoryId?: string
  storyProvenance?: StoryProvenance
  createdAt: number
  updatedAt: number
}

export interface StoryProvenance {
  readonly sourceWorks: StoryProvenanceSourceWork[]
  readonly adaptationNote: string
  readonly displayText: string
}

export interface StoryProvenanceSourceWork {
  readonly title: string
  readonly author: string
  readonly publication: string
  readonly publicDomainBasis: string
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

export type CharacterIllustrationImportMode = 'normalized' | 'original'

export interface CharacterIllustration {
  id: string
  storyId: string
  characterId: string
  fileId: string
  label: string
  order: number
  mimeType: string
  sizeBytes: number
  width: number
  height: number
  importMode: CharacterIllustrationImportMode
  createdAt: number
  updatedAt: number
}

export interface AppSetting {
  id: string
  value: string
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

export interface ImportCharacterIllustrationInput {
  characterId: string
  file: File
  label?: string
  importMode?: CharacterIllustrationImportMode
}

export interface UpdateCharacterIllustrationInput {
  label?: string
  order?: number
}
