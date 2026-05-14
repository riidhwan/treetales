let serviceWorkerRegistered = false

export function registerAppServiceWorker() {
  if (serviceWorkerRegistered || !('serviceWorker' in navigator)) {
    return
  }

  serviceWorkerRegistered = true
  void navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
    console.error('TreeTales service worker registration failed', error)
  })
}
