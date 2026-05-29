import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CharacterConfirmationDialog } from './CharacterConfirmationDialog'
import { CharacterDialogSlot } from './CharacterDialogSlot'
import {
  formatGender,
  getCharacterDialogTitle,
} from './characterDisplay'
import type { useStoryCharacters } from '@/hooks/useStoryCharacters'
import type { Character } from '@/services/types'

type CharacterController = ReturnType<typeof useStoryCharacters>

function createCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'character-1',
    storyId: 'story-1',
    name: 'Mira',
    gender: 'female',
    properties: [{ key: 'age', value: '32' }],
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

function createController(
  overrides: Partial<CharacterController> = {},
): CharacterController {
  return {
    addProperty: vi.fn(),
    cancelConfirmation: vi.fn(),
    characters: [],
    confirmDeleteSelectedCharacter: vi.fn(),
    confirmDiscardChanges: vi.fn(),
    confirmationState: { mode: 'closed' },
    dialogState: { mode: 'closed' },
    draft: { gender: 'female', name: '', properties: [] },
    errorMessage: undefined,
    hasUnsavedChanges: false,
    isDeleting: false,
    isLoading: false,
    isSaving: false,
    moveProperty: vi.fn(),
    openCreateDialog: vi.fn(),
    openEditDialog: vi.fn(),
    openViewDialog: vi.fn(),
    requestCloseDialog: vi.fn(),
    requestDeleteSelectedCharacter: vi.fn(),
    removeProperty: vi.fn(),
    saveCharacter: vi.fn(),
    setGender: vi.fn(),
    setName: vi.fn(),
    updateProperty: vi.fn(),
    ...overrides,
  }
}

describe('Character dialog components', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders nothing for closed dialog state', () => {
    const view = render(
      <CharacterDialogSlot
        characterDialog={createController()}
        titleId="character-title"
      />,
    )

    expect(view.container.textContent).toBe('')
  })

  it('renders the create form and delegates form actions', () => {
    const controller = createController({
      dialogState: { mode: 'create' },
      draft: {
        gender: 'female',
        name: 'Mira',
        properties: [{ id: 'property-1', key: 'age', value: '32' }],
      },
      errorMessage: 'Could not save.',
    })

    render(
      <CharacterDialogSlot
        characterDialog={controller}
        titleId="character-title"
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Add Character' })
    expect(within(dialog).getByRole('alert').textContent).toBe(
      'Could not save.',
    )
    fireEvent.change(within(dialog).getByLabelText('Name'), {
      target: { value: 'Rowan' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: /^save$/i }))

    expect(controller.setName).toHaveBeenCalledWith('Rowan')
    expect(controller.saveCharacter).toHaveBeenCalled()
  })

  it('renders saving state in edit forms', () => {
    render(
      <CharacterDialogSlot
        characterDialog={createController({
          dialogState: { character: createCharacter(), mode: 'edit' },
          draft: { gender: 'female', name: 'Mira', properties: [] },
          isSaving: true,
        })}
        titleId="character-title"
      />,
    )

    expect(screen.getByRole('button', { name: /^saving\.\.\.$/i })).toBeTruthy()
  })

  it('renders view actions and switches to edit', () => {
    const character = createCharacter()
    const controller = createController({
      dialogState: { character, mode: 'view' },
    })

    render(
      <CharacterDialogSlot
        characterDialog={controller}
        titleId="character-title"
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Mira' })
    expect(within(dialog).getByText('Female')).toBeTruthy()
    fireEvent.click(within(dialog).getByRole('button', { name: /^edit$/i }))
    fireEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(controller.openEditDialog).toHaveBeenCalledWith(character)
    expect(controller.requestDeleteSelectedCharacter).toHaveBeenCalled()
  })

  it('renders discard and delete confirmations', () => {
    const discardController = createController({
      confirmationState: { mode: 'discard-changes' },
    })
    const { rerender } = render(
      <CharacterConfirmationDialog
        characterDialog={discardController}
        titleId="confirmation-title"
      />,
    )

    let dialog = screen.getByRole('dialog', {
      name: 'Discard Character Changes?',
    })
    fireEvent.click(
      within(dialog).getByRole('button', { name: /discard changes/i }),
    )
    expect(discardController.confirmDiscardChanges).toHaveBeenCalled()

    const deleteController = createController({
      confirmationState: {
        character: createCharacter(),
        mode: 'delete-character',
      },
    })
    rerender(
      <CharacterConfirmationDialog
        characterDialog={deleteController}
        titleId="confirmation-title"
      />,
    )

    dialog = screen.getByRole('dialog', { name: 'Delete Character?' })
    expect(dialog.textContent).toContain('Delete "Mira"?')
    fireEvent.click(
      within(dialog).getByRole('button', { name: /delete character/i }),
    )
    expect(deleteController.confirmDeleteSelectedCharacter).toHaveBeenCalled()
  })

  it('formats character display text', () => {
    expect(formatGender('female')).toBe('Female')
    expect(formatGender('male')).toBe('Male')
    expect(getCharacterDialogTitle({ mode: 'create' })).toBe('Add Character')
    expect(
      getCharacterDialogTitle({
        character: createCharacter(),
        mode: 'edit',
      }),
    ).toBe('Edit Mira')
  })
})
