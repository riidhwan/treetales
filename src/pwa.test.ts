import { afterEach, describe, expect, it, vi } from 'vitest'

interface ServiceWorkerRegistrationMock {
  readonly unregister: ReturnType<typeof vi.fn>
}

interface ServiceWorkerContainerMock {
  readonly getRegistrations: ReturnType<typeof vi.fn>
  readonly register: ReturnType<typeof vi.fn>
}

interface CacheStorageMock {
  readonly delete: ReturnType<typeof vi.fn>
  readonly keys: ReturnType<typeof vi.fn>
}

async function importPwaModule() {
  vi.resetModules()

  return import('@/pwa')
}

function installServiceWorkerMock(
  registrations: ServiceWorkerRegistrationMock[],
) {
  const serviceWorker: ServiceWorkerContainerMock = {
    getRegistrations: vi.fn(() => Promise.resolve(registrations)),
    register: vi.fn(() => Promise.resolve()),
  }

  Object.defineProperty(window.navigator, 'serviceWorker', {
    configurable: true,
    value: serviceWorker,
  })

  return serviceWorker
}

function installCachesMock(cacheNames: string[]) {
  const cachesMock: CacheStorageMock = {
    delete: vi.fn(() => Promise.resolve(true)),
    keys: vi.fn(() => Promise.resolve(cacheNames)),
  }

  Object.defineProperty(window, 'caches', {
    configurable: true,
    value: cachesMock,
  })

  return cachesMock
}

describe('registerAppServiceWorker', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('does nothing when service workers are unavailable', async () => {
    Object.defineProperty(window.navigator, 'serviceWorker', {
      configurable: true,
      value: undefined,
    })

    const { registerAppServiceWorker } = await importPwaModule()

    expect(() => registerAppServiceWorker()).not.toThrow()
  })

  it('unregisters TreeTales service workers and caches in development', async () => {
    const firstRegistration = { unregister: vi.fn(() => Promise.resolve(true)) }
    const secondRegistration = { unregister: vi.fn(() => Promise.resolve(true)) }
    const serviceWorker = installServiceWorkerMock([
      firstRegistration,
      secondRegistration,
    ])
    const cachesMock = installCachesMock([
      'treetales-app-shell-v1',
      'unrelated-cache',
    ])
    const { registerAppServiceWorker } = await importPwaModule()

    registerAppServiceWorker()

    await vi.waitFor(() => {
      expect(firstRegistration.unregister).toHaveBeenCalled()
      expect(secondRegistration.unregister).toHaveBeenCalled()
    })
    expect(serviceWorker.register).not.toHaveBeenCalled()
    expect(cachesMock.delete).toHaveBeenCalledWith('treetales-app-shell-v1')
    expect(cachesMock.delete).not.toHaveBeenCalledWith('unrelated-cache')
  })

  it('runs development cleanup only once per module instance', async () => {
    const serviceWorker = installServiceWorkerMock([])
    installCachesMock([])
    const { registerAppServiceWorker } = await importPwaModule()

    registerAppServiceWorker()
    registerAppServiceWorker()

    await vi.waitFor(() => {
      expect(serviceWorker.getRegistrations).toHaveBeenCalledTimes(1)
    })
  })

  it('skips cache cleanup when CacheStorage is unavailable in development', async () => {
    const serviceWorker = installServiceWorkerMock([])
    const windowWithOptionalCaches = window as Omit<Window, 'caches'> & {
      caches?: CacheStorage
    }

    delete windowWithOptionalCaches.caches
    const { registerAppServiceWorker } = await importPwaModule()

    registerAppServiceWorker()

    await vi.waitFor(() => {
      expect(serviceWorker.getRegistrations).toHaveBeenCalled()
    })
    expect(serviceWorker.register).not.toHaveBeenCalled()
  })

  it('registers the service worker in production mode', async () => {
    vi.stubEnv('DEV', false)
    const serviceWorker = installServiceWorkerMock([])
    const { registerAppServiceWorker } = await importPwaModule()

    registerAppServiceWorker()

    await vi.waitFor(() => {
      expect(serviceWorker.register).toHaveBeenCalledWith('/sw.js')
    })
    expect(serviceWorker.getRegistrations).not.toHaveBeenCalled()
  })
})
