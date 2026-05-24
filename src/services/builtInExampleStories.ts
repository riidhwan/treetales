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
        'Adapted into a branching TreeTales starter from the source premise. The main path follows the Bee-Man through the domain, mountain, dragon rescue, and magical return; alternate branches let him reject the prophecy, retreat from danger, or keep his old shape after the rescue.',
      displayText:
        'Adapted from "The Bee-Man of Orn" by Frank R. Stockton, first published 1887.',
    },
    chapters: [
      {
        templateId: 'intro',
        title: 'The Hive at Orn',
        content: `The Bee-Man lives at the edge of Orn in a hut that is more hive than house. Honeycomb fills the corners, bees work in the pocket of his old leather doublet, and the villagers know him as the strange, brown, contented keeper of every buzzing swarm.

One afternoon a Junior Sorcerer stops beside the hives with a troubling announcement: by the rules of magic, the Bee-Man has been transformed from some other shape. The sorcerer cannot say what that shape was, but he promises that learned masters can restore it if the Bee-Man discovers the truth.

The old peace of the hut begins to hum with questions. If the Bee-Man has a proper form somewhere in the world, should he search for it, or should he trust the life his bees already know?`,
        parentTemplateId: null,
      },
      {
        templateId: 'begin-quest',
        title: 'Carry the Traveling Hive',
        content: `Before sunrise the Bee-Man binds a new hive of twigs and straw to his back. He fills it with comb, bees, and enough honey for the road, then leaves Orn with a cloud of companions glittering around him.

He decides that his old skill may serve the new search. When he finds a bee tree, something in him says, "That is what you are looking for." Perhaps his original form will call to him in the same way.

By noon the question has grown sharper: if he was once noble, monstrous, helpless, or ordinary, is honesty enough reason to become that thing again?`,
        parentTemplateId: 'intro',
      },
      {
        templateId: 'keep-hive',
        title: 'Stay with the Bees',
        content: `The Bee-Man listens to the low talk of the hive until the Junior Sorcerer's certainty begins to sound less certain. The bees know him by his hands, his step, and the smoke he never uses too roughly. None of them waits for a better Bee-Man to arrive.

When the sorcerer returns for notes, the Bee-Man offers him honey and a plain answer. He will not spend his last strength chasing a shape that has never fed a bee, saved a swarm, or shared a winter roof with him.

The Junior Sorcerer goes away disappointed, but the Bee-Man sleeps well. In Orn, the hives prosper, and the villagers learn that a prophecy may be loud without being wise.`,
        parentTemplateId: 'intro',
      },
      {
        templateId: 'fair-domain',
        title: 'Search the Fair Domain',
        content: `The road leads to a rich domain of lawns, gardens, bright horses, silken guests, and a palace whose windows flash like water. The Bee-Man hides his hive and doublet behind a shrub so his bees will not frighten the polished company.

For two days he watches every creature there: noble riders, songbirds, sleek dogs, jeweled ladies, and the handsome Lord of the Domain. If beauty and power are signs of an original form, this place has signs enough.

Yet the Bee-Man cannot tell whether he is drawn toward truth or merely dazzled by comfort.`,
        parentTemplateId: 'begin-quest',
      },
      {
        templateId: 'black-mountain',
        title: 'Enter the Black Mountain',
        content: `Beyond the domain rises a black mountain with a cave-mouth at its foot. The Bee-Man has heard that its tunnels hold dragons, imps, and unpleasant creatures whose names are better left unpracticed.

At the entrance he meets a Languid Youth who has come to have his energies improved, provided someone else will do the entering first. Together they step into the dark, where a polished little imp offers horrors as if they were medicines.

If the Bee-Man was once something dreadful, the mountain may tell him. If he was not, it may still test what sort of creature he has become.`,
        parentTemplateId: 'begin-quest',
      },
      {
        templateId: 'approach-lord',
        title: 'Follow the Lord of the Domain',
        content: `The Bee-Man follows the Lord of the Domain through the garden paths, hoping for the pull that will prove a former life of rank and ease. Instead, the lord turns, sees a shabby old man behind him, and drives him into the bushes with a contemptuous kick.

The Bee-Man runs back to his hidden hive with more certainty than he has found anywhere else. Whatever he once was, he was not a person who would strike a poor stranger for standing in a garden.

He leaves the domain poorer in illusions, but richer in one useful rule: a true form cannot be measured by velvet, horses, or the size of a gate.`,
        parentTemplateId: 'fair-domain',
      },
      {
        templateId: 'become-lord',
        title: 'Claim the Palace Shape',
        content: `The Bee-Man mistakes longing for recognition and sends for the sorcerers before the Lord of the Domain ever turns around. They are delighted by so neat an answer and transform him into a nobleman with polished boots, a ringing bell, and servants who expect orders.

For a week he tries to live as if the palace were his natural hive. But bees gather at the windows, beggars wait at the gates, and every command sounds strange in his mouth.

At last he opens the storehouses, gives away the honeyed cakes, and walks back toward Orn in borrowed clothes. The sorcerers call it a failed restoration; the Bee-Man calls it proof that splendor can be another kind of disguise.`,
        parentTemplateId: 'fair-domain',
      },
      {
        templateId: 'rescue-child',
        title: 'Throw the Hive at the Dragon',
        content: `Deep in the mountain, a black dragon with fiery wings carries a crying child into its cave. The Bee-Man's first thought is to run, and his second is worse: someone ought to do something.

He hurries back for his traveling hive, charges into the cave, and throws it straight at the dragon's face. The hive bursts, the bees pour out in a furious storm, and the dragon staggers backward under stings to its eyes, nose, and smoking mouth.

While the bees fight like an army, the Bee-Man gathers up the child and runs for daylight.`,
        parentTemplateId: 'black-mountain',
      },
      {
        templateId: 'leave-mountain',
        title: 'Turn Back from the Roar',
        content: `The dragon's roar shakes dust from the ceiling, and the Bee-Man imagines claws, fire, and a future in which no one ever learns what he used to be. He takes one step toward the cave, then another step away.

Outside, the Languid Youth praises caution, but the Bee-Man hears the baby's cry long after the mountain has fallen behind them. He may still find the Junior Sorcerer, and he may still gain a restored shape, but one question follows him louder than the prophecy.

If his original form was brave, why did it not answer when someone needed him?`,
        parentTemplateId: 'black-mountain',
      },
      {
        templateId: 'return-child',
        title: 'Return the Lost Child',
        content: `The Bee-Man and the newly energetic Youth carry the child into a nearby village. A woman sits outside her cottage tearing at her hair with grief, and when she sees the child she runs forward with a cry that leaves no doubt.

The mother covers the child with kisses and thanks the Bee-Man until he grows embarrassed. Neighbors bring food, water, and a soft place to rest. For the first time since leaving Orn, the Bee-Man feels strongly drawn toward a living being - not a lord, not a monster, but the small rescued child.

Perhaps, he thinks, he was transformed from a baby. Every life begins there. Every old shape once had that chance.`,
        parentTemplateId: 'rescue-child',
      },
      {
        templateId: 'fresh-start',
        title: 'Accept the Fresh Start',
        content: `The Junior Sorcerer arrives with senior masters, all very pleased to find a case that can be written up neatly. They perform the restoration, and the Bee-Man becomes a baby in the grateful mother's arms.

The sorcerers congratulate one another. The Youth goes home full of energy. The child grows under a kind roof, learns the hum of summer fields, and one day wanders farther and farther toward Orn.

Years later an old Senior Sorcerer passes a small hut alive with bees. Inside sits a leathery old man eating honey. The sorcerer knows him at once and can only stare: the fresh start has grown, by its own nature, back into a Bee-Man.`,
        parentTemplateId: 'return-child',
      },
      {
        templateId: 'chosen-shape',
        title: 'Keep the Shape That Helped',
        content: `The Bee-Man sends word to the Junior Sorcerer, but not for a transformation. He asks the young magician to witness the answer he has found.

He was drawn to the child because the child needed him, not because he used to be one. The hive on his back, his tough skin, his patience with small winged lives - these were not mistakes to be corrected. They were the very things that let him save someone.

So the Bee-Man returns to Orn unchanged. Sometimes the rescued child visits and sits safely among the hives. When people ask what he was transformed from, he gives them honey and says he has stopped asking the question backward.`,
        parentTemplateId: 'return-child',
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
