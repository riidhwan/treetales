import { useEffect, useState } from 'react'

export const MOBILE_INSTALL_CHOICE_DISMISSED_KEY =
  'treetales.mobileInstallChoiceDismissed'

type InstallStatus =
  | 'accepted'
  | 'dismissed'
  | 'error'
  | 'guidance'
  | 'idle'
  | 'pending'

interface BeforeInstallPromptChoice {
  readonly outcome: 'accepted' | 'dismissed'
  readonly platform: string
}

interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<BeforeInstallPromptChoice>
  prompt: () => Promise<void>
}

interface NavigatorWithStandalone extends Navigator {
  readonly standalone?: boolean
}

interface MobileInstallChoiceState {
  readonly canInstallNatively: boolean
  readonly installStatus: InstallStatus
  readonly isReady: boolean
  readonly shouldShowInstallChoice: boolean
  readonly continueToMobileSite: () => void
  readonly installApp: () => Promise<void>
}

const ANDROID_NATIVE_INSTALL_FALLBACK_DELAY_MS = 1500
const INSTALL_GUIDANCE_STATUS: InstallStatus = 'guidance'

export function useMobileInstallChoice(): MobileInstallChoiceState {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [installStatus, setInstallStatus] = useState<InstallStatus>('idle')
  const [isReady, setIsReady] = useState(false)
  const [shouldShowInstallChoice, setShouldShowInstallChoice] = useState(false)

  useEffect(() => {
    const isNativeInstallCandidate = isAndroidChromiumBrowser(window)
    const shouldShow =
      isMobileBrowser(window) &&
      !isRunningStandalone(window) &&
      !hasDismissedInstallChoice(window)

    setShouldShowInstallChoice(shouldShow)
    setInstallStatus(
      shouldShow && isNativeInstallCandidate ? 'pending' : INSTALL_GUIDANCE_STATUS,
    )
    setIsReady(true)

    let fallbackTimer: number | undefined

    if (shouldShow && isNativeInstallCandidate) {
      fallbackTimer = window.setTimeout(() => {
        setInstallStatus((currentStatus) =>
          currentStatus === 'pending' ? INSTALL_GUIDANCE_STATUS : currentStatus,
        )
      }, ANDROID_NATIVE_INSTALL_FALLBACK_DELAY_MS)
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      if (fallbackTimer !== undefined) {
        window.clearTimeout(fallbackTimer)
      }
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setInstallStatus('idle')
    }

    const handleAppInstalled = () => {
      rememberDismissedInstallChoice(window)
      setShouldShowInstallChoice(false)
      setInstallStatus('accepted')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
      if (fallbackTimer !== undefined) {
        window.clearTimeout(fallbackTimer)
      }
    }
  }, [])

  const continueToMobileSite = () => {
    rememberDismissedInstallChoice(window)
    setShouldShowInstallChoice(false)
  }

  const installApp = async () => {
    if (!deferredPrompt) {
      if (installStatus === 'pending') {
        return
      }

      setInstallStatus(INSTALL_GUIDANCE_STATUS)
      return
    }

    setInstallStatus('idle')

    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      setDeferredPrompt(null)

      if (choice.outcome === 'accepted') {
        rememberDismissedInstallChoice(window)
        setShouldShowInstallChoice(false)
        setInstallStatus('accepted')
        return
      }

      setInstallStatus('dismissed')
    } catch {
      setInstallStatus('error')
    }
  }

  return {
    canInstallNatively: deferredPrompt !== null,
    continueToMobileSite,
    installApp,
    installStatus,
    isReady,
    shouldShowInstallChoice,
  }
}

function hasDismissedInstallChoice(currentWindow: Window) {
  try {
    return (
      currentWindow.localStorage.getItem(MOBILE_INSTALL_CHOICE_DISMISSED_KEY) ===
      'true'
    )
  } catch {
    return false
  }
}

function rememberDismissedInstallChoice(currentWindow: Window) {
  try {
    currentWindow.localStorage.setItem(
      MOBILE_INSTALL_CHOICE_DISMISSED_KEY,
      'true',
    )
  } catch {
    return
  }
}

function isMobileBrowser(currentWindow: Window) {
  const userAgent = currentWindow.navigator.userAgent
  const hasMobileUserAgent =
    /Android|iPhone|iPad|iPod|IEMobile|Mobile|Opera Mini/i.test(userAgent)
  const hasMobileViewport = matchesMedia(currentWindow, '(max-width: 767px)')
  const hasCoarsePointer = matchesMedia(currentWindow, '(pointer: coarse)')

  return hasMobileUserAgent || (hasMobileViewport && hasCoarsePointer)
}

function isAndroidChromiumBrowser(currentWindow: Window) {
  const userAgent = currentWindow.navigator.userAgent

  return /Android/i.test(userAgent) && /Chrome|Chromium|CriOS|EdgA/i.test(userAgent)
}

function isRunningStandalone(currentWindow: Window) {
  const navigatorWithStandalone =
    currentWindow.navigator as NavigatorWithStandalone

  return (
    matchesMedia(currentWindow, '(display-mode: standalone)') ||
    navigatorWithStandalone.standalone === true
  )
}

function matchesMedia(currentWindow: Window, query: string) {
  if (typeof currentWindow.matchMedia !== 'function') {
    return false
  }

  return currentWindow.matchMedia(query).matches
}
