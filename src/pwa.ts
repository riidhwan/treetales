let serviceWorkerRegistered = false

export function registerAppServiceWorker() {
  if (serviceWorkerRegistered || !('serviceWorker' in navigator)) {
    return
  }

  serviceWorkerRegistered = true

  if (import.meta.env.DEV) {
    void unregisterLocalServiceWorkers().catch((error: unknown) => {
      console.error('TreeTales service worker cleanup failed', error)
    })
    return
  }

  void navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
    console.error('TreeTales service worker registration failed', error)
  })
}

async function unregisterLocalServiceWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations()

  await Promise.all(
    registrations.map((registration) => registration.unregister()),
  )

  if (!('caches' in window)) {
    return
  }

  const cacheNames = await caches.keys()

  await Promise.all(
    cacheNames
      .filter((cacheName) => cacheName.startsWith('treetales-'))
      .map((cacheName) => caches.delete(cacheName)),
  )
}
