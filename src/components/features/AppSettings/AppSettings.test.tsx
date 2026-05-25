import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppSettings } from '@/components/features/AppSettings'
import type { AppSettingsServices } from '@/hooks/useAppSettings'

function createServices(
  hasGeminiApiKey: boolean,
  overrides: Partial<AppSettingsServices> = {},
): AppSettingsServices {
  let hasSavedKey = hasGeminiApiKey

  return {
    clearGeminiApiKey: vi.fn(
      overrides.clearGeminiApiKey ??
        (() => {
          hasSavedKey = false
          return Promise.resolve(true)
        }),
    ),
    getWritingAssistSettings: vi.fn(
      overrides.getWritingAssistSettings ??
        (() => Promise.resolve({ hasGeminiApiKey: hasSavedKey })),
    ),
    saveGeminiApiKey: vi.fn(
      overrides.saveGeminiApiKey ??
        (() => {
          hasSavedKey = true
          return Promise.resolve()
        }),
    ),
  }
}

function getGeminiApiKeyInput(): HTMLInputElement {
  const input = screen.getByPlaceholderText('Paste Gemini API key')

  if (!(input instanceof HTMLInputElement)) {
    throw new TypeError('Gemini API key field is not an input.')
  }

  return input
}

function getSaveKeyButton(): HTMLButtonElement {
  const button = screen.getByRole('button', { name: 'Save key' })

  if (!(button instanceof HTMLButtonElement)) {
    throw new TypeError('Save key control is not a button.')
  }

  return button
}

function getGeminiApiKeyForm(): HTMLFormElement {
  const form = getGeminiApiKeyInput().closest('form')

  if (!(form instanceof HTMLFormElement)) {
    throw new TypeError('Gemini API key field is not inside a form.')
  }

  return form
}

describe('AppSettings', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders the Writing Assist settings category and saves a new key', async () => {
    const services = createServices(false)

    render(<AppSettings onBackToLibrary={vi.fn()} services={services} />)

    expect(
      await screen.findByRole('heading', { name: 'App Settings' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /Writing Assist/ }),
    ).toBeTruthy()
    expect(screen.getByPlaceholderText('Paste Gemini API key')).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('Paste Gemini API key'), {
      target: { value: ' test-key ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save key' }))

    await waitFor(() => {
      expect(services.saveGeminiApiKey).toHaveBeenCalledWith('test-key')
    })
    expect(await screen.findByText('Gemini API key saved.')).toBeTruthy()
    expect(screen.queryByDisplayValue('test-key')).toBeNull()
  })

  it('indicates a saved key without showing or revealing the saved value', async () => {
    const services = createServices(true)

    render(<AppSettings onBackToLibrary={vi.fn()} services={services} />)

    expect(
      await screen.findByText(
        'A Gemini API key is saved for this browser. TreeTales does not show or reveal saved key values.',
      ),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Replace' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Clear key' })).toBeTruthy()
    expect(screen.queryByPlaceholderText('Paste Gemini API key')).toBeNull()
  })

  it('replaces a saved key from a blank input and can cancel replacement', async () => {
    const services = createServices(true)

    render(<AppSettings onBackToLibrary={vi.fn()} services={services} />)

    fireEvent.click(await screen.findByRole('button', { name: 'Replace' }))

    expect(getGeminiApiKeyInput().value).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByPlaceholderText('Paste Gemini API key')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Replace' }))
    fireEvent.change(screen.getByPlaceholderText('Paste Gemini API key'), {
      target: { value: 'replacement-key' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save key' }))

    await waitFor(() => {
      expect(services.saveGeminiApiKey).toHaveBeenCalledWith('replacement-key')
    })
  })

  it('clears a saved key without confirmation', async () => {
    const services = createServices(true)

    render(<AppSettings onBackToLibrary={vi.fn()} services={services} />)

    fireEvent.click(await screen.findByRole('button', { name: 'Clear key' }))

    await waitFor(() => {
      expect(services.clearGeminiApiKey).toHaveBeenCalledOnce()
    })
    expect(await screen.findByText('Gemini API key cleared.')).toBeTruthy()
    expect(getGeminiApiKeyInput().value).toBe('')
  })

  it('requires a non-empty key before saving', async () => {
    const services = createServices(false)

    render(<AppSettings onBackToLibrary={vi.fn()} services={services} />)

    expect(await screen.findByPlaceholderText('Paste Gemini API key')).toBeTruthy()
    expect(getSaveKeyButton().disabled).toBe(true)

    fireEvent.submit(getGeminiApiKeyForm())

    expect(
      await screen.findByText('Enter a Gemini API key before saving.'),
    ).toBeTruthy()
    expect(services.saveGeminiApiKey).not.toHaveBeenCalled()
  })

  it('shows a load failure state', async () => {
    const services = createServices(false, {
      getWritingAssistSettings: () =>
        Promise.reject(new Error('Could not load App Settings.')),
    })

    render(<AppSettings onBackToLibrary={vi.fn()} services={services} />)

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not load App Settings.',
    )
  })

  it('shows a save failure without exposing the entered key as saved', async () => {
    const services = createServices(false, {
      saveGeminiApiKey: () => Promise.reject(new Error('Save failed.')),
    })

    render(<AppSettings onBackToLibrary={vi.fn()} services={services} />)

    fireEvent.change(await screen.findByPlaceholderText('Paste Gemini API key'), {
      target: { value: 'bad-key' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save key' }))

    expect(await screen.findByText('Save failed.')).toBeTruthy()
    expect(screen.queryByText('Gemini API key saved.')).toBeNull()
  })

  it('shows a clear failure and keeps the saved-key state', async () => {
    const services = createServices(true, {
      clearGeminiApiKey: () =>
        Promise.reject(new Error('Could not clear the Gemini API key.')),
    })

    render(<AppSettings onBackToLibrary={vi.fn()} services={services} />)

    fireEvent.click(await screen.findByRole('button', { name: 'Clear key' }))

    expect(await screen.findByText('Could not clear the Gemini API key.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Replace' })).toBeTruthy()
  })

  it('navigates back to the Library dashboard', async () => {
    const onBackToLibrary = vi.fn()
    const services = createServices(false)

    render(
      <AppSettings onBackToLibrary={onBackToLibrary} services={services} />,
    )

    fireEvent.click(
      await screen.findByRole('button', { name: 'Back to Library' }),
    )

    expect(onBackToLibrary).toHaveBeenCalledOnce()
  })
})
