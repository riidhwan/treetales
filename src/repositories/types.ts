import type {
  AppSetting,
  Character,
  CharacterIllustration,
  Chapter,
  Story,
  UpdateCharacterInput,
  UpdateCharacterIllustrationInput,
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
  readonly findStoryByBuiltInExampleStoryId: (
    builtInExampleStoryId: string,
  ) => Promise<Story | undefined>
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

export interface UpdateCharacterRepositoryInput extends UpdateCharacterInput {
  readonly updatedAt: number
}

export interface CharacterRepository {
  readonly insertCharacter: (character: Character) => Promise<void>
  readonly findCharacterById: (id: string) => Promise<Character | undefined>
  readonly findCharactersByStoryId: (storyId: string) => Promise<Character[]>
  readonly updateCharacter: (
    id: string,
    input: UpdateCharacterRepositoryInput,
  ) => Promise<Character | undefined>
  readonly deleteCharacter: (id: string) => Promise<boolean>
  readonly deleteCharactersByStoryId: (storyId: string) => Promise<void>
}

export interface UpdateCharacterIllustrationRepositoryInput
  extends UpdateCharacterIllustrationInput {
  readonly updatedAt: number
}

export interface CharacterIllustrationRepository {
  readonly insertCharacterIllustration: (
    illustration: CharacterIllustration,
  ) => Promise<void>
  readonly findCharacterIllustrationById: (
    id: string,
  ) => Promise<CharacterIllustration | undefined>
  readonly findCharacterIllustrationsByCharacterId: (
    characterId: string,
  ) => Promise<CharacterIllustration[]>
  readonly findCharacterIllustrationsByStoryId: (
    storyId: string,
  ) => Promise<CharacterIllustration[]>
  readonly updateCharacterIllustration: (
    id: string,
    input: UpdateCharacterIllustrationRepositoryInput,
  ) => Promise<CharacterIllustration | undefined>
  readonly deleteCharacterIllustration: (id: string) => Promise<boolean>
  readonly deleteCharacterIllustrationsByCharacterId: (
    characterId: string,
  ) => Promise<CharacterIllustration[]>
  readonly deleteCharacterIllustrationsByStoryId: (
    storyId: string,
  ) => Promise<CharacterIllustration[]>
}

export interface CharacterIllustrationFileStorage {
  readonly writeFile: (fileId: string, blob: Blob) => Promise<void>
  readonly readFile: (fileId: string) => Promise<Blob | undefined>
  readonly deleteFile: (fileId: string) => Promise<void>
}

export interface AppSettingsRepository {
  readonly findSettingById: (id: string) => Promise<AppSetting | undefined>
  readonly putSetting: (setting: AppSetting) => Promise<void>
  readonly deleteSetting: (id: string) => Promise<boolean>
}

export interface RepositoryUnitOfWorkContext {
  readonly stories: StoryRepository
  readonly chapters: ChapterRepository
  readonly characters: CharacterRepository
  readonly characterIllustrations: CharacterIllustrationRepository
}

export interface RepositoryUnitOfWork {
  readonly run: <T>(
    operation: (context: RepositoryUnitOfWorkContext) => Promise<T>,
  ) => Promise<T>
}
