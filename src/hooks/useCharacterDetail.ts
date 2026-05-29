import { useEffect, useMemo, useRef, useState } from 'react'

import { getErrorMessage } from '@/lib/errors'
import { deleteCharacter, getCharacterById } from '@/services/characterService'
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
  CharacterIllustration,
  CharacterIllustrationImportMode,
  ImportCharacterIllustrationInput,
  Story,
  UpdateCharacterIllustrationInput,
} from '@/services/types'

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
  const [illustrationPreviewUrl, setIllustrationPreviewUrl] = useState<
    string | undefined
  >()
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
  const illustrationObjectUrlsRef = useRef<string[]>([])
  const illustrationPreviewUrlRef = useRef<string | undefined>(undefined)

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
      clearIllustrationImportDraft()
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
      revokeIllustrationPreviewObjectUrl()
      revokeIllustrationObjectUrls()
    }
  }, [characterId, services, storyId])

  function cancelConfirmation() {
    setConfirmationState({ mode: 'closed' })
  }

  function setIllustrationFile(file: File | undefined) {
    revokeIllustrationPreviewObjectUrl()
    setIllustrationFileState(file)
    setIllustrationPreviewUrl(undefined)

    if (file) {
      const previewUrl = URL.createObjectURL(file)
      illustrationPreviewUrlRef.current = previewUrl
      setIllustrationPreviewUrl(previewUrl)
    }
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

  function cancelIllustrationImport() {
    if (isImportingIllustration) {
      return
    }

    clearIllustrationImportDraft()
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
      clearIllustrationImportDraft()
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
    cancelConfirmation,
    cancelIllustrationImport,
    canImportIllustration,
    character,
    confirmDeleteCharacter,
    confirmDeleteIllustration,
    confirmationState,
    errorMessage,
    activeIllustrationActionId,
    illustrationErrorMessage,
    illustrationFile,
    illustrationImportLabel,
    illustrationImportMode,
    illustrationImportResetKey,
    illustrationPreviewUrl,
    illustrationLabelDrafts,
    illustrations,
    isDeleting,
    isImportingIllustration,
    isLoadingIllustrations,
    importIllustration,
    moveIllustration,
    requestDeleteCharacter,
    requestDeleteIllustration,
    saveIllustrationLabel,
    setIllustrationFile,
    setIllustrationImportLabel,
    setIllustrationImportMode,
    setIllustrationLabelDraft,
    status,
    story,
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

  function clearIllustrationImportDraft() {
    revokeIllustrationPreviewObjectUrl()
    setIllustrationPreviewUrl(undefined)
    setIllustrationFileState(undefined)
    setIllustrationImportLabelState('')
    setIllustrationImportModeState('normalized')
    setIllustrationImportResetKey((currentKey) => currentKey + 1)
  }

  function revokeIllustrationPreviewObjectUrl() {
    if (illustrationPreviewUrlRef.current) {
      URL.revokeObjectURL(illustrationPreviewUrlRef.current)
    }

    illustrationPreviewUrlRef.current = undefined
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
