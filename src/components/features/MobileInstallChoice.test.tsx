import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MobileInstallChoice } from '@/components/features/MobileInstallChoice'

describe('MobileInstallChoice', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows install errors while keeping both choices available', () => {
    const onContinue = vi.fn()
    const onInstall = vi.fn()

    render(
      <MobileInstallChoice
        canInstallNatively={false}
        installStatus="error"
        onContinue={onContinue}
        onInstall={onInstall}
      />,
    )

    expect(screen.getByRole('alert').textContent).toContain(
      'Installation could not start.',
    )

    fireEvent.click(screen.getByRole('button', { name: /install app/i }))
    fireEvent.click(
      screen.getByRole('button', { name: /continue to mobile site/i }),
    )

    expect(onInstall).toHaveBeenCalled()
    expect(onContinue).toHaveBeenCalled()
  })
})
