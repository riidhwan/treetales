import { sortByCreatedAt } from '@/lib/sorting'
import { createIndexedDbRepositoryUnitOfWork } from '@/repositories/indexedDb/unitOfWork'
import type { Chapter, Story } from '@/services/types'

export interface ExampleStory {
  readonly chapters: Chapter[]
  readonly story: Story
}

const EXAMPLE_STORY_ID = 'example-story-lantern-road'
const EXAMPLE_CHAPTER_IDS = {
  bridge: 'example-chapter-moonlit-bridge',
  garden: 'example-chapter-hidden-garden',
  root: 'example-chapter-light-in-pines',
  tower: 'example-chapter-bell-tower',
  trail: 'example-chapter-willow-lights',
} as const
const repositoryUnitOfWork = createIndexedDbRepositoryUnitOfWork()

export async function createExampleStory(): Promise<ExampleStory> {
  return repositoryUnitOfWork.run(async ({ stories, chapters }) => {
    const existingStory = await stories.findStoryById(EXAMPLE_STORY_ID)
    if (existingStory) {
      const existingChapters = await chapters.findChaptersByStoryId(
        existingStory.id,
      )

      return {
        chapters: sortByCreatedAt(existingChapters),
        story: existingStory,
      }
    }

    const now = Date.now()
    const story: Story = {
      id: EXAMPLE_STORY_ID,
      title: 'The Lantern Road',
      description:
        'A short branching tale built into TreeTales as a readable example.',
      createdAt: now,
      updatedAt: now,
    }
    const exampleChapters = createExampleChapters(now)

    await stories.insertStory(story)

    for (const chapter of exampleChapters) {
      await chapters.insertChapter(chapter)
    }

    return { chapters: exampleChapters, story }
  })
}

function createExampleChapters(createdAt: number): Chapter[] {
  return [
    {
      id: EXAMPLE_CHAPTER_IDS.root,
      storyId: EXAMPLE_STORY_ID,
      title: 'A Light in the Pines',
      content:
        'The path begins where the lanterns end. Ahead, two routes split beneath the old pines: a narrow bridge over dark water, and a trail marked by pale lights.',
      parentChapterId: null,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: EXAMPLE_CHAPTER_IDS.bridge,
      storyId: EXAMPLE_STORY_ID,
      title: 'Cross the Moonlit Bridge',
      content:
        'The bridge sways with every careful step. Halfway across, a bell rings from a tower you could not see from the shore.',
      parentChapterId: EXAMPLE_CHAPTER_IDS.root,
      createdAt: createdAt + 1,
      updatedAt: createdAt + 1,
    },
    {
      id: EXAMPLE_CHAPTER_IDS.trail,
      storyId: EXAMPLE_STORY_ID,
      title: 'Follow the Willow Lights',
      content:
        'The pale lights drift between the trees, always just far enough ahead to keep you moving. Their glow gathers around a gate covered in ivy.',
      parentChapterId: EXAMPLE_CHAPTER_IDS.root,
      createdAt: createdAt + 2,
      updatedAt: createdAt + 2,
    },
    {
      id: EXAMPLE_CHAPTER_IDS.tower,
      storyId: EXAMPLE_STORY_ID,
      title: 'The Bell Tower',
      content:
        'At the top of the tower, the bell rope is tied around a sealed letter. The letter names you as the keeper of the road, and the lanterns outside flare to life.',
      parentChapterId: EXAMPLE_CHAPTER_IDS.bridge,
      createdAt: createdAt + 3,
      updatedAt: createdAt + 3,
    },
    {
      id: EXAMPLE_CHAPTER_IDS.garden,
      storyId: EXAMPLE_STORY_ID,
      title: 'The Hidden Garden',
      content:
        'Beyond the ivy gate, every path circles a quiet garden. In its center waits a lantern already lit, as though someone expected you to arrive.',
      parentChapterId: EXAMPLE_CHAPTER_IDS.trail,
      createdAt: createdAt + 4,
      updatedAt: createdAt + 4,
    },
  ]
}
