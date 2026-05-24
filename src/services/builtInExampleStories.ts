import { sortByCreatedAt } from '@/lib/sorting'
import { createIndexedDbRepositoryUnitOfWork } from '@/repositories/indexedDb/unitOfWork'
import type { Chapter, Story, StoryProvenance } from '@/services/types'

export interface BuiltInExampleStorySummary {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly storyProvenance: StoryProvenance
}

export type CreateOrReuseExampleStoryCopyResult =
  | {
      readonly status: 'created' | 'reused'
      readonly story: Story
      readonly chapters: Chapter[]
    }
  | {
      readonly status: 'not-found'
    }

interface BuiltInExampleStoryDefinition extends BuiltInExampleStorySummary {
  readonly chapters: readonly BuiltInExampleChapterDefinition[]
}

interface BuiltInExampleChapterDefinition {
  readonly templateId: string
  readonly title: string
  readonly content: string
  readonly parentTemplateId: string | null
}

const BUILT_IN_EXAMPLE_STORIES: readonly BuiltInExampleStoryDefinition[] = [
  {
    id: 'bee-man-of-orn',
    title: 'The Bee-Man of Orn',
    description:
      'A wandering bee-keeper follows an old prophecy toward an unexpected identity.',
    storyProvenance: {
      sourceWorks: [
        {
          title: 'The Bee-Man of Orn',
          author: 'Frank R. Stockton',
          publication:
            'The Bee-Man of Orn and Other Fanciful Tales, first published 1887',
          publicDomainBasis:
            'Project Gutenberg eBook #12067, public domain in the USA.',
        },
      ],
      adaptationNote:
        'Adapted into a branching TreeTales starter from the source premise.',
      displayText:
        'Adapted from "The Bee-Man of Orn" by Frank R. Stockton, first published 1887.',
    },
    chapters: [
      {
        templateId: 'intro',
        title: 'The Bee-Man and the Junior Sorcerer',
        content:
          'The Bee-Man keeps his hives outside Orn until a junior sorcerer arrives with news that his shape may not be his own.',
        parentTemplateId: null,
      },
      {
        templateId: 'road',
        title: 'Toward the Great Wizard',
        content:
          'The road away from Orn promises answers, but every traveler seems to carry a different warning about what a true shape costs.',
        parentTemplateId: 'intro',
      },
    ],
  },
  {
    id: 'magicians-gifts',
    title: "The Magicians' Gifts",
    description:
      'Three gifts promise power, but each choice asks what kind of wisdom is worth keeping.',
    storyProvenance: {
      sourceWorks: [
        {
          title: "The Magicians' Gifts",
          author: 'Juliana Horatia Ewing',
          publication: 'Old-Fashioned Fairy Tales, first published 1880',
          publicDomainBasis:
            'Project Gutenberg eBook #15592, public domain in the USA.',
        },
      ],
      adaptationNote:
        'Adapted into a branching TreeTales starter from the source premise.',
      displayText:
        'Adapted from "The Magicians\' Gifts" by Juliana Horatia Ewing, first published 1880.',
    },
    chapters: [
      {
        templateId: 'intro',
        title: 'The Three Bright Gifts',
        content:
          'The magicians set their gifts before the child, each one shining with a different promise for the years ahead.',
        parentTemplateId: null,
      },
      {
        templateId: 'choice',
        title: 'Choose the Quiet Gift',
        content:
          'The quietest gift does not dazzle the room, but it changes how every future path can be understood.',
        parentTemplateId: 'intro',
      },
    ],
  },
  {
    id: 'wonderful-toymaker',
    title: 'The Wonderful Toymaker',
    description:
      'A royal nursery, a strange craftsman, and a toy that may teach more than obedience.',
    storyProvenance: {
      sourceWorks: [
        {
          title: 'The Wonderful Toymaker',
          author: 'Evelyn Sharp',
          publication: 'All the Way to Fairyland, first published 1898',
          publicDomainBasis:
            'Project Gutenberg eBook #30400, public domain in the USA.',
        },
      ],
      adaptationNote:
        'Adapted into a branching TreeTales starter from the source premise.',
      displayText:
        'Adapted from "The Wonderful Toymaker" by Evelyn Sharp, first published 1898.',
    },
    chapters: [
      {
        templateId: 'intro',
        title: 'A Toy Fit for a Palace',
        content:
          'The Wonderful Toymaker arrives at the palace with a toy no one has seen before, and the nursery holds its breath.',
        parentTemplateId: null,
      },
      {
        templateId: 'workshop',
        title: 'Follow the Toymaker',
        content:
          'Past the palace gates, the Toymaker knows a road where toys are not made to flatter princes but to wake them up.',
        parentTemplateId: 'intro',
      },
    ],
  },
] as const

const repositoryUnitOfWork = createIndexedDbRepositoryUnitOfWork()

export function listBuiltInExampleStories(): BuiltInExampleStorySummary[] {
  return BUILT_IN_EXAMPLE_STORIES.map((starter) => ({
    id: starter.id,
    title: starter.title,
    description: starter.description,
    storyProvenance: starter.storyProvenance,
  }))
}

export async function createOrReuseExampleStoryCopy(
  builtInExampleStoryId: string,
): Promise<CreateOrReuseExampleStoryCopyResult> {
  const builtInExampleStory = BUILT_IN_EXAMPLE_STORIES.find(
    (starter) => starter.id === builtInExampleStoryId,
  )

  if (!builtInExampleStory) {
    return { status: 'not-found' }
  }

  return repositoryUnitOfWork.run(async ({ stories, chapters }) => {
    const existingStory = await stories.findStoryByBuiltInExampleStoryId(
      builtInExampleStory.id,
    )

    if (existingStory) {
      const existingChapters = await chapters.findChaptersByStoryId(
        existingStory.id,
      )

      return {
        status: 'reused',
        chapters: sortByCreatedAt(existingChapters),
        story: existingStory,
      }
    }

    const now = Date.now()
    const story: Story = {
      id: crypto.randomUUID(),
      title: builtInExampleStory.title,
      description: builtInExampleStory.description,
      builtInExampleStoryId: builtInExampleStory.id,
      storyProvenance: builtInExampleStory.storyProvenance,
      createdAt: now,
      updatedAt: now,
    }
    const exampleChapters = createExampleChapters(
      builtInExampleStory.chapters,
      story.id,
      now,
    )

    await stories.insertStory(story)

    for (const chapter of exampleChapters) {
      await chapters.insertChapter(chapter)
    }

    return {
      status: 'created',
      chapters: exampleChapters,
      story,
    }
  })
}

function createExampleChapters(
  chapterDefinitions: readonly BuiltInExampleChapterDefinition[],
  storyId: string,
  createdAt: number,
): Chapter[] {
  const chapterIdsByTemplateId = new Map(
    chapterDefinitions.map((chapterDefinition) => [
      chapterDefinition.templateId,
      crypto.randomUUID(),
    ]),
  )

  return chapterDefinitions.map((chapterDefinition, index) => {
    const id = chapterIdsByTemplateId.get(chapterDefinition.templateId)
    const parentChapterId = chapterDefinition.parentTemplateId
      ? chapterIdsByTemplateId.get(chapterDefinition.parentTemplateId)
      : null

    if (!id || parentChapterId === undefined) {
      throw new Error('Built-in Example Story chapter definition is invalid.')
    }

    return {
      id,
      storyId,
      title: chapterDefinition.title,
      content: chapterDefinition.content,
      parentChapterId,
      createdAt: createdAt + index,
      updatedAt: createdAt + index,
    }
  })
}
