import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CharacterDetail } from '@/components/features/CharacterDetail'
import { CharacterDetailContent } from '@/components/features/CharacterDetail/CharacterDetail/CharacterDetailContent'
import type {
  CharacterDetailServices,
  useCharacterDetail,
} from '@/hooks/useCharacterDetail'
import type { Character, Story } from '@/services/types'

function createStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 'story-1',
    title: 'The Old Road',
    description: 'A choice in the woods',
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

function createCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'character-1',
    storyId: 'story-1',
    name: 'Mira',
    gender: 'female',
    properties: [
      { key: 'age', value: '32' },
      { key: 'description', value: 'A long history\nwith line breaks' },
    ],
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

function createServices(options: {
  readonly character?: Character
  readonly story?: Story
} = {}): CharacterDetailServices {
  const character = 'character' in options ? options.character : createCharacter()
  const story = 'story' in options ? options.story : createStory()

  return {
    getCharacterById: vi.fn(() => Promise.resolve(character)),
    getStoryById: vi.fn(() => Promise.resolve(story)),
  }
}

function renderCharacterDetail({
  onBackToStory = vi.fn(),
  services = createServices(),
}: {
  readonly onBackToStory?: (storyId: string) => void
  readonly services?: CharacterDetailServices
} = {}) {
  return render(
    <CharacterDetail
      characterId="character-1"
      onBackToStory={onBackToStory}
      services={services}
      storyId="story-1"
    />,
  )
}

describe('CharacterDetail', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('loads the story and character for a direct URL view', async () => {
    const services = createServices()
    const onBackToStory = vi.fn()

    renderCharacterDetail({ onBackToStory, services })

    expect(await screen.findByRole('heading', { name: 'Mira' })).toBeTruthy()
    expect(screen.getByText('The Old Road')).toBeTruthy()
    expect(screen.getByText('Gender')).toBeTruthy()
    expect(screen.getByText('Female')).toBeTruthy()
    expect(screen.getByText(/A long history\s+with line breaks/)).toBeTruthy()
    expect(screen.queryByText('Custom properties')).toBeNull()
    expect(services.getStoryById).toHaveBeenCalledWith('story-1')
    expect(services.getCharacterById).toHaveBeenCalledWith('character-1')

    fireEvent.click(screen.getByRole('button', { name: 'Story Detail' }))

    expect(onBackToStory).toHaveBeenCalledWith('story-1')
  })

  it('shows the no-properties fallback and inline load errors', async () => {
    const services = createServices({
      character: createCharacter({ properties: [] }),
    })
    const { rerender } = render(
      <CharacterDetail
        characterId="character-1"
        onBackToStory={vi.fn()}
        services={services}
        storyId="story-1"
      />,
    )

    expect(await screen.findByText('No custom properties yet.')).toBeTruthy()

    const failingServices = {
      ...createServices(),
      getStoryById: vi.fn(() =>
        Promise.reject(new Error('Could not load character.')),
      ),
    }
    rerender(
      <CharacterDetail
        characterId="character-1"
        onBackToStory={vi.fn()}
        services={failingServices}
        storyId="story-1"
      />,
    )

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not load character.',
    )
  })

  it('shows missing states for absent story and absent character', async () => {
    const missingStoryServices = createServices({ story: undefined })
    const { rerender } = render(
      <CharacterDetail
        characterId="character-1"
        onBackToStory={vi.fn()}
        services={missingStoryServices}
        storyId="story-1"
      />,
    )

    expect(
      await screen.findByText(
        'This story may have been deleted or is unavailable in this browser.',
      ),
    ).toBeTruthy()

    const missingCharacterServices = createServices({ character: undefined })
    rerender(
      <CharacterDetail
        characterId="character-1"
        onBackToStory={vi.fn()}
        services={missingCharacterServices}
        storyId="story-1"
      />,
    )

    expect(await screen.findByText('Character could not be found.')).toBeTruthy()
  })

  it('renders nothing when ready detail content has no character context', () => {
    const view = render(
      <CharacterDetailContent
        characterDetail={
          {
            character: undefined,
            status: 'ready',
          } as unknown as ReturnType<typeof useCharacterDetail>
        }
        titleId="character-title"
      />,
    )

    expect(view.container.textContent).toBe('')
  })
})
