import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  createOrReuseExampleStoryCopy,
  listBuiltInExampleStories,
} from '@/services/builtInExampleStories'
import { deleteStory, getStories, getStoryById } from '@/services/storyService'
import type { Chapter } from '@/services/types'
import { deleteTestDatabase, installFakeIndexedDb } from '@/test/indexedDb'

const BEE_MAN_ADAPTATION_NOTE =
  'Adapted into a branching TreeTales starter from the source premise. The main path follows the Bee-Man through the domain, mountain, dragon rescue, and magical return; alternate branches let him reject the prophecy, retreat from danger, or keep his old shape after the rescue.'

const MAGICIANS_GIFTS_ADAPTATION_NOTE =
  'Adapted into a branching TreeTales starter from the source premise. The main path follows the prince from christening gifts through misused wishes, failed counsel, remorse, self-command, and restoration; alternate branches let him learn earlier from wise counsel, cling to command, or choose humility after harm.'

const WONDERFUL_TOYMAKER_ADAPTATION_NOTE =
  "Adapted into a branching TreeTales starter from the source premise. The main path follows Princess Petulant, Martin, the pine dwarfs, the conversation country, the rescue, and the Toymaker's two tops; alternate branches let the Princess practice patience, Martin become trapped by talk, or the children stay longer with the Toymaker."

function createMockUuid(index: number): ReturnType<Crypto['randomUUID']> {
  return `00000000-0000-4000-8000-${(index + 1).toString().padStart(12, '0')}`
}

function mockRandomUuids(count: number) {
  const uuids = Array.from(
    { length: count },
    (_, index) => createMockUuid(index),
  )

  vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
    const uuid = uuids.shift()

    if (!uuid) {
      throw new Error('No mocked UUIDs remaining.')
    }

    return uuid
  })
}

function getChapterByTitle(chapters: readonly Chapter[], title: string) {
  const chapter = chapters.find((candidate) => candidate.title === title)

  if (!chapter) {
    throw new Error(`Missing chapter: ${title}`)
  }

  return chapter
}

describe('builtInExampleStories', () => {
  beforeAll(() => {
    installFakeIndexedDb()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await deleteTestDatabase()
  })

  it('lists starter summaries in authored catalog order without chapter fixtures', () => {
    const starters = listBuiltInExampleStories()

    expect(starters.map((starter) => starter.id)).toEqual([
      'bee-man-of-orn',
      'magicians-gifts',
      'wonderful-toymaker',
    ])
    expect(starters[0]).toEqual({
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
        adaptationNote: BEE_MAN_ADAPTATION_NOTE,
        displayText:
          'Adapted from "The Bee-Man of Orn" by Frank R. Stockton, first published 1887.',
      },
    })
    expect(starters[1]).toMatchObject({
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
        adaptationNote: MAGICIANS_GIFTS_ADAPTATION_NOTE,
        displayText:
          'Adapted from "The Magicians\' Gifts" by Juliana Horatia Ewing, first published 1880.',
      },
    })
    expect(starters[2]).toMatchObject({
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
        adaptationNote: WONDERFUL_TOYMAKER_ADAPTATION_NOTE,
        displayText:
          'Adapted from "The Wonderful Toymaker" by Evelyn Sharp, first published 1898.',
      },
    })
    expect('chapters' in starters[0]).toBe(false)
    expect('chapters' in starters[1]).toBe(false)
    expect('chapters' in starters[2]).toBe(false)
  })

  it('returns not-found for an unknown starter id', async () => {
    await expect(
      createOrReuseExampleStoryCopy('missing-starter'),
    ).resolves.toEqual({
      status: 'not-found',
    })
  })

  it('creates an editable example story copy with generated local ids and provenance', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100)
    mockRandomUuids(13)

    const result = await createOrReuseExampleStoryCopy('bee-man-of-orn')

    expect(result.status).toBe('created')

    if (result.status !== 'created') {
      throw new Error('Expected created result.')
    }

    expect(result.story).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      title: 'The Bee-Man of Orn',
      description:
        'A wandering bee-keeper follows an old prophecy toward an unexpected identity.',
      builtInExampleStoryId: 'bee-man-of-orn',
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
        adaptationNote: BEE_MAN_ADAPTATION_NOTE,
        displayText:
          'Adapted from "The Bee-Man of Orn" by Frank R. Stockton, first published 1887.',
      },
      createdAt: 100,
      updatedAt: 100,
    })
    expect(result.chapters).toHaveLength(12)
    expect(result.chapters[0]).toMatchObject({
      id: '00000000-0000-4000-8000-000000000002',
      storyId: result.story.id,
      title: 'The Hive at Orn',
      parentChapterId: null,
      createdAt: 100,
      updatedAt: 100,
    })
    expect(result.chapters[0].content).toContain('Junior Sorcerer')
    expect(result.chapters.at(-1)).toMatchObject({
      id: '00000000-0000-4000-8000-000000000013',
      storyId: result.story.id,
      title: 'Keep the Shape That Helped',
      createdAt: 111,
      updatedAt: 111,
    })
    await expect(getStories()).resolves.toEqual([result.story])
  })

  it('creates the Bee-Man story with branches and multiple endings', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100)
    mockRandomUuids(13)

    const result = await createOrReuseExampleStoryCopy('bee-man-of-orn')

    if (result.status !== 'created') {
      throw new Error('Expected created result.')
    }

    const intro = getChapterByTitle(result.chapters, 'The Hive at Orn')
    const travelingHive = getChapterByTitle(
      result.chapters,
      'Carry the Traveling Hive',
    )
    const fairDomain = getChapterByTitle(
      result.chapters,
      'Search the Fair Domain',
    )
    const blackMountain = getChapterByTitle(
      result.chapters,
      'Enter the Black Mountain',
    )
    const returnChild = getChapterByTitle(
      result.chapters,
      'Return the Lost Child',
    )

    const branchTitlesByParentId = new Map<string, string[]>()

    for (const chapter of result.chapters) {
      if (!chapter.parentChapterId) {
        continue
      }

      branchTitlesByParentId.set(chapter.parentChapterId, [
        ...(branchTitlesByParentId.get(chapter.parentChapterId) ?? []),
        chapter.title,
      ])
    }

    expect(branchTitlesByParentId.get(intro.id)).toEqual([
      'Carry the Traveling Hive',
      'Stay with the Bees',
    ])
    expect(branchTitlesByParentId.get(travelingHive.id)).toEqual([
      'Search the Fair Domain',
      'Enter the Black Mountain',
    ])
    expect(branchTitlesByParentId.get(fairDomain.id)).toEqual([
      'Follow the Lord of the Domain',
      'Claim the Palace Shape',
    ])
    expect(branchTitlesByParentId.get(blackMountain.id)).toEqual([
      'Throw the Hive at the Dragon',
      'Turn Back from the Roar',
    ])
    expect(branchTitlesByParentId.get(returnChild.id)).toEqual([
      'Accept the Fresh Start',
      'Keep the Shape That Helped',
    ])

    const parentIds = new Set(
      result.chapters
        .map((chapter) => chapter.parentChapterId)
        .filter((parentChapterId): parentChapterId is string =>
          Boolean(parentChapterId),
        ),
    )
    const endingTitles = result.chapters
      .filter((chapter) => !parentIds.has(chapter.id))
      .map((chapter) => chapter.title)

    expect(endingTitles).toEqual([
      'Stay with the Bees',
      'Follow the Lord of the Domain',
      'Claim the Palace Shape',
      'Turn Back from the Roar',
      'Accept the Fresh Start',
      'Keep the Shape That Helped',
    ])
  })

  it('creates the Magicians Gifts story with generated ids and provenance', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(200)
    mockRandomUuids(14)

    const result = await createOrReuseExampleStoryCopy('magicians-gifts')

    expect(result.status).toBe('created')

    if (result.status !== 'created') {
      throw new Error('Expected created result.')
    }

    expect(result.story).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      title: "The Magicians' Gifts",
      description:
        'Three gifts promise power, but each choice asks what kind of wisdom is worth keeping.',
      builtInExampleStoryId: 'magicians-gifts',
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
        adaptationNote: MAGICIANS_GIFTS_ADAPTATION_NOTE,
        displayText:
          'Adapted from "The Magicians\' Gifts" by Juliana Horatia Ewing, first published 1880.',
      },
      createdAt: 200,
      updatedAt: 200,
    })
    expect(result.chapters).toHaveLength(13)
    expect(result.chapters[0]).toMatchObject({
      id: '00000000-0000-4000-8000-000000000002',
      storyId: result.story.id,
      title: 'Three Gifts at the Cradle',
      parentChapterId: null,
      createdAt: 200,
      updatedAt: 200,
    })
    expect(result.chapters[0].content).toContain('hasty temper')
    expect(result.chapters.at(-1)).toMatchObject({
      id: '00000000-0000-4000-8000-000000000014',
      storyId: result.story.id,
      title: 'The Godfather Returns',
      createdAt: 212,
      updatedAt: 212,
    })
  })

  it('creates the Magicians Gifts story with branches and multiple endings', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(200)
    mockRandomUuids(14)

    const result = await createOrReuseExampleStoryCopy('magicians-gifts')

    if (result.status !== 'created') {
      throw new Error('Expected created result.')
    }

    const intro = getChapterByTitle(result.chapters, 'Three Gifts at the Cradle')
    const recklessPrince = getChapterByTitle(
      result.chapters,
      'Wishes That Cannot Turn Back',
    )
    const wiseWoman = getChapterByTitle(
      result.chapters,
      'The Narrowest Road',
    )
    const youngAdviser = getChapterByTitle(
      result.chapters,
      'The Faithful Young Adviser',
    )
    const glassCoffin = getChapterByTitle(result.chapters, 'The Glass Coffin')

    const branchTitlesByParentId = new Map<string, string[]>()

    for (const chapter of result.chapters) {
      if (!chapter.parentChapterId) {
        continue
      }

      branchTitlesByParentId.set(chapter.parentChapterId, [
        ...(branchTitlesByParentId.get(chapter.parentChapterId) ?? []),
        chapter.title,
      ])
    }

    expect(branchTitlesByParentId.get(intro.id)).toEqual([
      'Wishes That Cannot Turn Back',
      'Ask for an Ordinary Blessing',
    ])
    expect(branchTitlesByParentId.get(recklessPrince.id)).toEqual([
      'The Narrowest Road',
      'Rule by Wishing',
    ])
    expect(branchTitlesByParentId.get(wiseWoman.id)).toEqual([
      'The Faithful Young Adviser',
      'Keep the Old Counsel',
    ])
    expect(branchTitlesByParentId.get(youngAdviser.id)).toEqual([
      'The Hound at the Hermitage',
      'Stay Before Worse Is Done',
    ])
    expect(branchTitlesByParentId.get(glassCoffin.id)).toEqual([
      'Return to the Hermit',
      'Lay Down the Crown',
    ])

    const parentIds = new Set(
      result.chapters
        .map((chapter) => chapter.parentChapterId)
        .filter((parentChapterId): parentChapterId is string =>
          Boolean(parentChapterId),
        ),
    )
    const endingTitles = result.chapters
      .filter((chapter) => !parentIds.has(chapter.id))
      .map((chapter) => chapter.title)

    expect(endingTitles).toEqual([
      'Ask for an Ordinary Blessing',
      'Rule by Wishing',
      'Keep the Old Counsel',
      'Stay Before Worse Is Done',
      'Lay Down the Crown',
      'The Godfather Returns',
    ])
  })

  it('creates the Wonderful Toymaker story with generated ids and provenance', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(300)
    mockRandomUuids(15)

    const result = await createOrReuseExampleStoryCopy('wonderful-toymaker')

    expect(result.status).toBe('created')

    if (result.status !== 'created') {
      throw new Error('Expected created result.')
    }

    expect(result.story).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      title: 'The Wonderful Toymaker',
      description:
        'A royal nursery, a strange craftsman, and a toy that may teach more than obedience.',
      builtInExampleStoryId: 'wonderful-toymaker',
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
        adaptationNote: WONDERFUL_TOYMAKER_ADAPTATION_NOTE,
        displayText:
          'Adapted from "The Wonderful Toymaker" by Evelyn Sharp, first published 1898.',
      },
      createdAt: 300,
      updatedAt: 300,
    })
    expect(result.chapters).toHaveLength(14)
    expect(result.chapters[0]).toMatchObject({
      id: '00000000-0000-4000-8000-000000000002',
      storyId: result.story.id,
      title: 'No Toy Will Do',
      parentChapterId: null,
      createdAt: 300,
      updatedAt: 300,
    })
    expect(result.chapters[0].content).toContain('Princess Petulant')
    expect(result.chapters.at(-1)).toMatchObject({
      id: '00000000-0000-4000-8000-000000000015',
      storyId: result.story.id,
      title: 'Ride the Rocking-Horses Home',
      createdAt: 313,
      updatedAt: 313,
    })
  })

  it('creates the Wonderful Toymaker story with branches and multiple endings', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(300)
    mockRandomUuids(15)

    const result = await createOrReuseExampleStoryCopy('wonderful-toymaker')

    if (result.status !== 'created') {
      throw new Error('Expected created result.')
    }

    const intro = getChapterByTitle(result.chapters, 'No Toy Will Do')
    const askBobolink = getChapterByTitle(
      result.chapters,
      'Ask the Purple Enchanter',
    )
    const pineDwarfs = getChapterByTitle(
      result.chapters,
      'The Pine Dwarfs Secret',
    )
    const conversationCountry = getChapterByTitle(
      result.chapters,
      'The Country That Makes Conversation',
    )
    const toymakerValley = getChapterByTitle(
      result.chapters,
      'The Valley of Toys',
    )

    const branchTitlesByParentId = new Map<string, string[]>()

    for (const chapter of result.chapters) {
      if (!chapter.parentChapterId) {
        continue
      }

      branchTitlesByParentId.set(chapter.parentChapterId, [
        ...(branchTitlesByParentId.get(chapter.parentChapterId) ?? []),
        chapter.title,
      ])
    }

    expect(branchTitlesByParentId.get(intro.id)).toEqual([
      'Ask the Purple Enchanter',
      'Wait Without Crying',
    ])
    expect(branchTitlesByParentId.get(askBobolink.id)).toEqual([
      'The Pine Dwarfs Secret',
      'Lose Count of the Turnings',
    ])
    expect(branchTitlesByParentId.get(pineDwarfs.id)).toEqual([
      'The Country That Makes Conversation',
      'Hold the Silence',
    ])
    expect(branchTitlesByParentId.get(conversationCountry.id)).toEqual([
      'The Princess Stops Her Ears',
      'Become Conversation',
    ])
    expect(branchTitlesByParentId.get(toymakerValley.id)).toEqual([
      'Choose the World-Singing Top',
      'Choose the Fairyland Top',
      'Stay One More Game',
      'Ride the Rocking-Horses Home',
    ])

    const parentIds = new Set(
      result.chapters
        .map((chapter) => chapter.parentChapterId)
        .filter((parentChapterId): parentChapterId is string =>
          Boolean(parentChapterId),
        ),
    )
    const endingTitles = result.chapters
      .filter((chapter) => !parentIds.has(chapter.id))
      .map((chapter) => chapter.title)

    expect(endingTitles).toEqual([
      'Wait Without Crying',
      'Lose Count of the Turnings',
      'Hold the Silence',
      'Become Conversation',
      'Choose the World-Singing Top',
      'Choose the Fairyland Top',
      'Stay One More Game',
      'Ride the Rocking-Horses Home',
    ])
  })

  it('reuses an existing example story copy without changing timestamps or duplicate chapters', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100)
    mockRandomUuids(13)

    const created = await createOrReuseExampleStoryCopy('bee-man-of-orn')
    const reused = await createOrReuseExampleStoryCopy('bee-man-of-orn')

    expect(created.status).toBe('created')
    expect(reused.status).toBe('reused')

    if (created.status !== 'created' || reused.status !== 'reused') {
      throw new Error('Expected created then reused results.')
    }

    expect(reused.story).toEqual(created.story)
    expect(reused.chapters).toEqual(created.chapters)
    expect(reused.story.updatedAt).toBe(100)
    await expect(getStories()).resolves.toEqual([created.story])
  })

  it('creates a fresh copy from the catalog after deleting the previous copy', async () => {
    let now = 100
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    mockRandomUuids(26)
    const created = await createOrReuseExampleStoryCopy('bee-man-of-orn')

    if (created.status !== 'created') {
      throw new Error('Expected created result.')
    }

    await deleteStory(created.story.id)
    now = 500

    const recreated = await createOrReuseExampleStoryCopy('bee-man-of-orn')

    expect(recreated.status).toBe('created')

    if (recreated.status !== 'created') {
      throw new Error('Expected recreated result.')
    }

    expect(recreated.story.id).toBe('00000000-0000-4000-8000-000000000014')
    expect(recreated.story.createdAt).toBe(500)
    expect(recreated.story.builtInExampleStoryId).toBe('bee-man-of-orn')
    await expect(getStoryById(created.story.id)).resolves.toBeUndefined()
  })
})
