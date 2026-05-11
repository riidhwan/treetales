import {
  CHAPTERS_STORE,
  CHAPTER_STORY_ID_INDEX,
  STORIES_STORE,
  openDb,
  requestToPromise,
  typedRequest,
  transactionDone,
} from '@/services/db'
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

export async function createExampleStory(): Promise<ExampleStory> {
  const db = await openDb()

  try {
    const transaction = db.transaction(
      [STORIES_STORE, CHAPTERS_STORE],
      'readwrite',
    )
    const storiesStore = transaction.objectStore(STORIES_STORE)
    const chaptersStore = transaction.objectStore(CHAPTERS_STORE)
    const existingStory = await requestToPromise(
      typedRequest<Story | undefined>(storiesStore.get(EXAMPLE_STORY_ID)),
    )

    if (existingStory) {
      const existingChapters = await requestToPromise(
        typedRequest<Chapter[]>(
          chaptersStore.index(CHAPTER_STORY_ID_INDEX).getAll(existingStory.id),
        ),
      )

      await transactionDone(transaction)

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
    const chapters = createExampleChapters(now)

    storiesStore.add(story)

    for (const chapter of chapters) {
      chaptersStore.add(chapter)
    }

    await transactionDone(transaction)

    return { chapters, story }
  } finally {
    db.close()
  }
}

function createExampleChapters(createdAt: number): Chapter[] {
  return [
    {
      id: EXAMPLE_CHAPTER_IDS.root,
      storyId: EXAMPLE_STORY_ID,
      title: 'A Light in the Pines',
      content:
        'The path begins where the lanterns end. Ahead, two routes split beneath the old pines: a narrow bridge over dark water, and a trail marked by pale lights.',
      parentChapterIds: [],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: EXAMPLE_CHAPTER_IDS.bridge,
      storyId: EXAMPLE_STORY_ID,
      title: 'Cross the Moonlit Bridge',
      content:
        'The bridge sways with every careful step. Halfway across, a bell rings from a tower you could not see from the shore.',
      parentChapterIds: [EXAMPLE_CHAPTER_IDS.root],
      createdAt: createdAt + 1,
      updatedAt: createdAt + 1,
    },
    {
      id: EXAMPLE_CHAPTER_IDS.trail,
      storyId: EXAMPLE_STORY_ID,
      title: 'Follow the Willow Lights',
      content:
        'The pale lights drift between the trees, always just far enough ahead to keep you moving. Their glow gathers around a gate covered in ivy.',
      parentChapterIds: [EXAMPLE_CHAPTER_IDS.root],
      createdAt: createdAt + 2,
      updatedAt: createdAt + 2,
    },
    {
      id: EXAMPLE_CHAPTER_IDS.tower,
      storyId: EXAMPLE_STORY_ID,
      title: 'The Bell Tower',
      content:
        'At the top of the tower, the bell rope is tied around a sealed letter. The letter names you as the keeper of the road, and the lanterns outside flare to life.',
      parentChapterIds: [EXAMPLE_CHAPTER_IDS.bridge],
      createdAt: createdAt + 3,
      updatedAt: createdAt + 3,
    },
    {
      id: EXAMPLE_CHAPTER_IDS.garden,
      storyId: EXAMPLE_STORY_ID,
      title: 'The Hidden Garden',
      content:
        'Beyond the ivy gate, every path circles a quiet garden. In its center waits a lantern already lit, as though someone expected you to arrive.',
      parentChapterIds: [EXAMPLE_CHAPTER_IDS.trail],
      createdAt: createdAt + 4,
      updatedAt: createdAt + 4,
    },
  ]
}

function sortByCreatedAt<TItem extends { id: string; createdAt: number }>(
  items: TItem[],
): TItem[] {
  return [...items].sort((firstItem, secondItem) => {
    if (firstItem.createdAt !== secondItem.createdAt) {
      return firstItem.createdAt - secondItem.createdAt
    }

    return firstItem.id.localeCompare(secondItem.id)
  })
}
