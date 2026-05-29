import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createCharacterCreateInput,
  createCharacterDraftFromCharacter,
  createCharacterUpdateInput,
  createEmptyCharacterDraft,
  useCharacterForm,
} from '@/hooks/useCharacterForm'
import type { Character } from '@/services/types'

function createCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'character-1',
    storyId: 'story-1',
    name: 'Mira',
    gender: 'female',
    properties: [
      { key: 'age', value: '32' },
      { key: 'role', value: 'cartographer' },
    ],
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

describe('useCharacterForm', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('tracks edits only when active and resets the saved draft boundary', () => {
    const { rerender, result } = renderHook(
      ({ isActive }) => useCharacterForm({ isActive }),
      { initialProps: { isActive: false } },
    )

    expect(result.current.draft).toEqual(createEmptyCharacterDraft())
    expect(result.current.canSave).toBe(false)
    expect(result.current.hasUnsavedChanges).toBe(false)

    act(() => {
      result.current.setName('Mira')
    })

    expect(result.current.canSave).toBe(true)
    expect(result.current.hasUnsavedChanges).toBe(false)

    rerender({ isActive: true })

    expect(result.current.hasUnsavedChanges).toBe(true)

    act(() => {
      result.current.resetDraft(createCharacterDraftFromCharacter(createCharacter()))
    })

    expect(result.current.hasUnsavedChanges).toBe(false)
    expect(result.current.draft.name).toBe('Mira')
    expect(result.current.draft.properties).toHaveLength(2)
  })

  it('adds, updates, removes, and reorders Character Properties', () => {
    const { result } = renderHook(() => useCharacterForm({ isActive: true }))

    act(() => {
      result.current.addProperty()
      result.current.addProperty()
    })

    const [firstProperty, secondProperty] = result.current.draft.properties

    act(() => {
      result.current.updateProperty(firstProperty.id, {
        key: 'age',
        value: '32',
      })
      result.current.updateProperty(secondProperty.id, {
        key: 'role',
        value: 'cartographer',
      })
      result.current.moveProperty(secondProperty.id, -1)
      result.current.moveProperty(secondProperty.id, -1)
      result.current.moveProperty('missing-property', 1)
      result.current.removeProperty(firstProperty.id)
    })

    expect(result.current.draft.properties).toEqual([
      {
        id: secondProperty.id,
        key: 'role',
        value: 'cartographer',
      },
    ])
  })

  it('creates trimmed service input and drops properties with blank keys', () => {
    const draft = {
      gender: 'male' as const,
      name: ' Toma ',
      properties: [
        { id: 'property-1', key: ' age ', value: ' 41 ' },
        { id: 'property-2', key: ' ', value: 'ignored' },
      ],
    }

    expect(createCharacterCreateInput('story-1', draft)).toEqual({
      storyId: 'story-1',
      name: 'Toma',
      gender: 'male',
      properties: [{ key: 'age', value: '41' }],
    })
    expect(createCharacterUpdateInput(draft)).toEqual({
      name: 'Toma',
      gender: 'male',
      properties: [{ key: 'age', value: '41' }],
    })
  })
})
