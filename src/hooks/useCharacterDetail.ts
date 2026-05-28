import { useEffect, useMemo, useRef, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import {
  deleteCharacter,
  getCharacterById,
  updateCharacter,
} from '@/services/characterService'
import {
  deleteCharacterIllustration,
  getCharacterIllustrationFile,
  getCharacterIllustrationsByCharacterId,
  importCharacterIllustration,
  updateCharacterIllustration,
} from '@/services/characterIllustrationService'
import { getStoryById } from '@/services/storyService'
import type {
  Character,
  CharacterGender,
  CharacterIllustration,
  CharacterIllustrationImportMode,
  CharacterProperty,
  ImportCharacterIllustrationInput,
  Story,
  UpdateCharacterInput,
  UpdateCharacterIllustrationInput,
} from '@/services/types'

interface CharacterPropertyDraft {
  readonly id: string
  readonly key: string
  readonly value: string
}

export interface CharacterFormDraft {
  readonly gender: CharacterGender
  readonly name: string
  readonly properties: CharacterPropertyDraft[]
}

export interface CharacterIllustrationView {
  readonly illustration: CharacterIllustration
  readonly imageUrl: string | undefined
}

type CharacterDetailStatus =
  | 'error'
  | 'loading'
  | 'missing-character'
  | 'missing-story'
  | 'ready'

type CharacterDetailConfirmationState =
  | { readonly mode: 'closed' }
  | { readonly mode: 'delete-character' }
  | { readonly illustrationId: string; readonly mode: 'delete-illustration' }
  | { readonly mode: 'discard-changes' }

export interface CharacterDetailServices {
  readonly deleteCharacter: (id: string) => Promise<boolean>
  readonly deleteCharacterIllustration: (id: string) => Promise<boolean>
  readonly getCharacterById: (id: string) => Promise<Character | undefined>
  readonly getCharacterIllustrationFile: (
    fileId: string,
  ) => Promise<Blob | undefined>
  readonly getCharacterIllustrationsByCharacterId: (
    characterId: string,
  ) => Promise<CharacterIllustration[]>
  readonly getStoryById: (id: string) => Promise<Story | undefined>
  readonly importCharacterIllustration: (
    input: ImportCharacterIllustrationInput,
  ) => Promise<CharacterIllustration>
  readonly updateCharacter: (
    id: string,
    input: UpdateCharacterInput,
  ) => Promise<Character | undefined>
  readonly updateCharacterIllustration: (
    id: string,
    input: UpdateCharacterIllustrationInput,
  ) => Promise<CharacterIllustration | undefined>
}

export const DEFAULT_CHARACTER_DETAIL_SERVICES: CharacterDetailServices = {
  deleteCharacter,
  deleteCharacterIllustration,
  getCharacterById,
  getCharacterIllustrationFile,
  getCharacterIllustrationsByCharacterId,
  getStoryById,
  importCharacterIllustration,
  updateCharacter,
  updateCharacterIllustration,
}

interface UseCharacterDetailOptions {
  readonly characterId: string
  readonly onDeleted: () => void
  readonly services?: CharacterDetailServices
  readonly storyId: string
}

export function useCharacterDetail({
  characterId,
  onDeleted,
  services = DEFAULT_CHARACTER_DETAIL_SERVICES,
  storyId,
}: UseCharacterDetailOptions) {
  const [status, setStatus] = useState<CharacterDetailStatus>('loading')
  const [story, setStory] = useState<Story | undefined>()
  const [character, setCharacter] = useState<Character | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [illustrations, setIllustrations] = useState<CharacterIllustrationView[]>(
    [],
  )
  const [illustrationLabelDrafts, setIllustrationLabelDrafts] = useState<
    Record<string, string>
  >({})
  const [illustrationFile, setIllustrationFileState] = useState<
    File | undefined
  >()
  const [illustrationImportLabel, setIllustrationImportLabelState] =
    useState('')
  const [illustrationImportMode, setIllustrationImportModeState] =
    useState<CharacterIllustrationImportMode>('normalized')
  const [illustrationErrorMessage, setIllustrationErrorMessage] = useState<
    string | undefined
  >()
  const [isLoadingIllustrations, setIsLoadingIllustrations] = useState(false)
  const [isImportingIllustration, setIsImportingIllustration] = useState(false)
  const [illustrationImportResetKey, setIllustrationImportResetKey] =
    useState(0)
  const [activeIllustrationActionId, setActiveIllustrationActionId] = useState<
    string | undefined
  >()
  const [confirmationState, setConfirmationState] =
    useState<CharacterDetailConfirmationState>({ mode: 'closed' })
  const [draft, setDraft] = useState<CharacterFormDraft>(createEmptyDraft())
  const [savedDraft, setSavedDraft] = useState<CharacterFormDraft>(
    createEmptyDraft(),
  )
  const illustrationObjectUrlsRef = useRef<string[]>([])

  const hasUnsavedChanges = useMemo(
    () => isEditing && serializeDraft(draft) !== serializeDraft(savedDraft),
    [draft, isEditing, savedDraft],
  )

  const canImportIllustration = useMemo(
    () => Boolean(character && illustrationFile) && !isImportingIllustration,
    [character, illustrationFile, isImportingIllustration],
  )

  useEffect(() => {
    let isCurrent = true

    async function loadCharacterDetail() {
      setStatus('loading')
      setErrorMessage(undefined)
      setStory(undefined)
      setCharacter(undefined)
      setIllustrations([])
      setIllustrationLabelDrafts({})
      setIllustrationErrorMessage(undefined)
      setIsEditing(false)
      setConfirmationState({ mode: 'closed' })
      revokeIllustrationObjectUrls()

      try {
        const loadedStory = await services.getStoryById(storyId)

        if (!isCurrent) {
          return
        }

        if (!loadedStory) {
          setStatus('missing-story')
          return
        }

        const loadedCharacter = await services.getCharacterById(characterId)

        if (!isCurrent) {
          return
        }

        if (!loadedCharacter || loadedCharacter.storyId !== storyId) {
          setStory(loadedStory)
          setStatus('missing-character')
          return
        }

        const nextDraft = createDraftFromCharacter(loadedCharacter)
        const loadedIllustrations = await loadIllustrationViews(
          services,
          loadedCharacter.id,
        )

        if (!isCurrent) {
          loadedIllustrations.objectUrls.forEach((objectUrl) => {
            URL.revokeObjectURL(objectUrl)
          })
          return
        }

        illustrationObjectUrlsRef.current = loadedIllustrations.objectUrls
        setStory(loadedStory)
        setCharacter(loadedCharacter)
        setIllustrations(loadedIllustrations.views)
        setIllustrationLabelDrafts(
          createIllustrationLabelDrafts(loadedIllustrations.views),
        )
        setDraft(nextDraft)
        setSavedDraft(nextDraft)
        setStatus('ready')
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error))
          setStatus('error')
        }
      }
    }

    void loadCharacterDetail()

    return () => {
      isCurrent = false
      revokeIllustrationObjectUrls()
    }
  }, [characterId, services, storyId])

  function beginEdit() {
    if (!character) {
      return
    }

    const nextDraft = createDraftFromCharacter(character)
    setDraft(nextDraft)
    setSavedDraft(nextDraft)
    setErrorMessage(undefined)
    setIsEditing(true)
  }

  function requestCancelEdit() {
    if (hasUnsavedChanges) {
      setConfirmationState({ mode: 'discard-changes' })
      return
    }

    cancelEditWithoutConfirmation()
  }

  function cancelEditWithoutConfirmation() {
    if (character) {
      const nextDraft = createDraftFromCharacter(character)
      setDraft(nextDraft)
      setSavedDraft(nextDraft)
    }

    setConfirmationState({ mode: 'closed' })
    setIsEditing(false)
  }

  function cancelConfirmation() {
    setConfirmationState({ mode: 'closed' })
  }

  function confirmDiscardChanges() {
    cancelEditWithoutConfirmation()
  }

  function setName(name: string) {
    setDraft((currentDraft) => ({ ...currentDraft, name }))
  }

  function setGender(gender: CharacterGender) {
    setDraft((currentDraft) => ({ ...currentDraft, gender }))
  }

  function setIllustrationFile(file: File | undefined) {
    setIllustrationFileState(file)
  }

  function setIllustrationImportLabel(label: string) {
    setIllustrationImportLabelState(label)
  }

  function setIllustrationImportMode(importMode: CharacterIllustrationImportMode) {
    setIllustrationImportModeState(importMode)
  }

  function setIllustrationLabelDraft(illustrationId: string, label: string) {
    setIllustrationLabelDrafts((currentDrafts) => ({
      ...currentDrafts,
      [illustrationId]: label,
    }))
  }

  function addProperty() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      properties: [
        ...currentDraft.properties,
        createPropertyDraft({ key: '', value: '' }),
      ],
    }))
  }

  function updateProperty(
    propertyId: string,
    input: Partial<Pick<CharacterPropertyDraft, 'key' | 'value'>>,
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      properties: currentDraft.properties.map((property) =>
        property.id === propertyId ? { ...property, ...input } : property,
      ),
    }))
  }

  function removeProperty(propertyId: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      properties: currentDraft.properties.filter(
        (property) => property.id !== propertyId,
      ),
    }))
  }

  function moveProperty(propertyId: string, direction: -1 | 1) {
    setDraft((currentDraft) => {
      const currentIndex = currentDraft.properties.findIndex(
        (property) => property.id === propertyId,
      )
      const nextIndex = currentIndex + direction

      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= currentDraft.properties.length
      ) {
        return currentDraft
      }

      const nextProperties = [...currentDraft.properties]
      const [property] = nextProperties.splice(currentIndex, 1)
      nextProperties.splice(nextIndex, 0, property)

      return {
        ...currentDraft,
        properties: nextProperties,
      }
    })
  }

  async function saveCharacter() {
    if (!isEditing || !character || !canSaveDraft(draft)) {
      return
    }

    setIsSaving(true)
    setErrorMessage(undefined)

    try {
      const updatedCharacter = await services.updateCharacter(
        character.id,
        createCharacterInput(draft),
      )

      if (!updatedCharacter || updatedCharacter.storyId !== storyId) {
        setStatus('missing-character')
        return
      }

      const nextDraft = createDraftFromCharacter(updatedCharacter)
      setCharacter(updatedCharacter)
      setDraft(nextDraft)
      setSavedDraft(nextDraft)
      setIsEditing(false)
      setStatus('ready')
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function importIllustration() {
    if (!character || !illustrationFile || isImportingIllustration) {
      return
    }

    setIsImportingIllustration(true)
    setIllustrationErrorMessage(undefined)

    try {
      await services.importCharacterIllustration({
        characterId: character.id,
        file: illustrationFile,
        importMode: illustrationImportMode,
        label: illustrationImportLabel,
      })
      setIllustrationFileState(undefined)
      setIllustrationImportLabelState('')
      setIllustrationImportModeState('normalized')
      setIllustrationImportResetKey((currentKey) => currentKey + 1)
      await refreshIllustrations(character.id)
    } catch (error) {
      setIllustrationErrorMessage(getErrorMessage(error))
    } finally {
      setIsImportingIllustration(false)
    }
  }

  async function saveIllustrationLabel(illustrationId: string) {
    const label = illustrationLabelDrafts[illustrationId] ?? ''
    await updateIllustration(illustrationId, { label })
  }

  async function moveIllustration(illustrationId: string, direction: -1 | 1) {
    const currentIndex = illustrations.findIndex(
      ({ illustration }) => illustration.id === illustrationId,
    )
    const targetIndex = currentIndex + direction

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= illustrations.length
    ) {
      return
    }

    await updateIllustration(illustrationId, {
      order: createMovedIllustrationOrder(illustrations, targetIndex, direction),
    })
  }

  function requestDeleteIllustration(illustrationId: string) {
    setConfirmationState({ illustrationId, mode: 'delete-illustration' })
  }

  async function confirmDeleteIllustration() {
    if (confirmationState.mode !== 'delete-illustration') {
      return
    }

    const illustrationId = confirmationState.illustrationId
    const currentCharacterId = character?.id
    setActiveIllustrationActionId(illustrationId)
    setIllustrationErrorMessage(undefined)

    try {
      const wasDeleted =
        await services.deleteCharacterIllustration(illustrationId)

      if (wasDeleted && currentCharacterId) {
        await refreshIllustrations(currentCharacterId)
      }

      setConfirmationState({ mode: 'closed' })
    } catch (error) {
      setIllustrationErrorMessage(getErrorMessage(error))
    } finally {
      setActiveIllustrationActionId(undefined)
    }
  }

  function requestDeleteCharacter() {
    if (character) {
      setConfirmationState({ mode: 'delete-character' })
    }
  }

  async function confirmDeleteCharacter() {
    if (!character || confirmationState.mode !== 'delete-character') {
      return
    }

    setIsDeleting(true)
    setErrorMessage(undefined)

    try {
      const wasDeleted = await services.deleteCharacter(character.id)

      if (!wasDeleted) {
        setStatus('missing-character')
        setConfirmationState({ mode: 'closed' })
        return
      }

      onDeleted()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    addProperty,
    beginEdit,
    cancelConfirmation,
    canImportIllustration,
    character,
    confirmDeleteCharacter,
    confirmDeleteIllustration,
    confirmDiscardChanges,
    confirmationState,
    draft,
    errorMessage,
    hasUnsavedChanges,
    activeIllustrationActionId,
    illustrationErrorMessage,
    illustrationFile,
    illustrationImportLabel,
    illustrationImportMode,
    illustrationImportResetKey,
    illustrationLabelDrafts,
    illustrations,
    isDeleting,
    isEditing,
    isImportingIllustration,
    isLoadingIllustrations,
    isSaving,
    importIllustration,
    moveIllustration,
    moveProperty,
    removeProperty,
    requestCancelEdit,
    requestDeleteCharacter,
    requestDeleteIllustration,
    saveCharacter,
    saveIllustrationLabel,
    setGender,
    setIllustrationFile,
    setIllustrationImportLabel,
    setIllustrationImportMode,
    setIllustrationLabelDraft,
    setName,
    status,
    story,
    updateProperty,
  }

  async function updateIllustration(
    illustrationId: string,
    input: UpdateCharacterIllustrationInput,
  ) {
    const currentCharacterId = character?.id

    if (!currentCharacterId) {
      return
    }

    setActiveIllustrationActionId(illustrationId)
    setIllustrationErrorMessage(undefined)

    try {
      const updatedIllustration =
        await services.updateCharacterIllustration(illustrationId, input)

      if (!updatedIllustration) {
        setIllustrationErrorMessage('Character Illustration could not be found.')
        return
      }

      await refreshIllustrations(currentCharacterId)
    } catch (error) {
      setIllustrationErrorMessage(getErrorMessage(error))
    } finally {
      setActiveIllustrationActionId(undefined)
    }
  }

  async function refreshIllustrations(currentCharacterId: string) {
    setIsLoadingIllustrations(true)

    try {
      const loadedIllustrations = await loadIllustrationViews(
        services,
        currentCharacterId,
      )

      revokeIllustrationObjectUrls()
      illustrationObjectUrlsRef.current = loadedIllustrations.objectUrls
      setIllustrations(loadedIllustrations.views)
      setIllustrationLabelDrafts(
        createIllustrationLabelDrafts(loadedIllustrations.views),
      )
    } finally {
      setIsLoadingIllustrations(false)
    }
  }

  function revokeIllustrationObjectUrls() {
    illustrationObjectUrlsRef.current.forEach((objectUrl) => {
      URL.revokeObjectURL(objectUrl)
    })
    illustrationObjectUrlsRef.current = []
  }
}

async function loadIllustrationViews(
  services: CharacterDetailServices,
  characterId: string,
): Promise<{
  readonly objectUrls: string[]
  readonly views: CharacterIllustrationView[]
}> {
  const illustrations =
    await services.getCharacterIllustrationsByCharacterId(characterId)
  const objectUrls: string[] = []
  const views = await Promise.all(
    illustrations.map(async (illustration) => {
      const file = await services.getCharacterIllustrationFile(
        illustration.fileId,
      )
      const imageUrl = file ? URL.createObjectURL(file) : undefined

      if (imageUrl) {
        objectUrls.push(imageUrl)
      }

      return { illustration, imageUrl }
    }),
  )

  return { objectUrls, views }
}

function createIllustrationLabelDrafts(
  views: readonly CharacterIllustrationView[],
): Record<string, string> {
  return Object.fromEntries(
    views.map(({ illustration }) => [illustration.id, illustration.label]),
  )
}

function createMovedIllustrationOrder(
  illustrations: readonly CharacterIllustrationView[],
  targetIndex: number,
  direction: -1 | 1,
): number {
  const targetOrder = illustrations[targetIndex].illustration.order

  if (direction < 0) {
    if (targetIndex === 0) {
      return targetOrder - 1
    }

    const previousOrder = illustrations[targetIndex - 1].illustration.order
    return (previousOrder + targetOrder) / 2
  }

  if (targetIndex === illustrations.length - 1) {
    return targetOrder + 1
  }

  const nextOrder = illustrations[targetIndex + 1].illustration.order
  return (targetOrder + nextOrder) / 2
}

function createEmptyDraft(): CharacterFormDraft {
  return {
    gender: 'female',
    name: '',
    properties: [],
  }
}

function createDraftFromCharacter(character: Character): CharacterFormDraft {
  return {
    gender: character.gender,
    name: character.name,
    properties: character.properties.map((property) =>
      createPropertyDraft(property),
    ),
  }
}

function createPropertyDraft(
  property: CharacterProperty,
): CharacterPropertyDraft {
  return {
    id: crypto.randomUUID(),
    key: property.key,
    value: property.value,
  }
}

function createCharacterInput(
  draft: CharacterFormDraft,
): UpdateCharacterInput {
  return {
    name: draft.name.trim(),
    gender: draft.gender,
    properties: normalizeDraftProperties(draft.properties),
  }
}

function normalizeDraftProperties(
  properties: readonly CharacterPropertyDraft[],
): CharacterProperty[] {
  return properties
    .map((property) => ({
      key: property.key.trim(),
      value: property.value.trim(),
    }))
    .filter((property) => property.key.length > 0)
}

function canSaveDraft(draft: CharacterFormDraft): boolean {
  return draft.name.trim().length > 0
}

function serializeDraft(draft: CharacterFormDraft): string {
  return JSON.stringify({
    gender: draft.gender,
    name: draft.name,
    properties: draft.properties.map((property) => ({
      key: property.key,
      value: property.value,
    })),
  })
}
