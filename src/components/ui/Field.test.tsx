import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Field } from '@/components/ui/Field'
import { TextInput } from '@/components/ui/TextInput'

describe('Field', () => {
  afterEach(() => {
    cleanup()
  })

  it('associates its label with the wrapped control', () => {
    render(
      <Field label="Title">
        <TextInput name="title" />
      </Field>,
    )

    expect(screen.getByLabelText('Title')).toHaveProperty('name', 'title')
  })

  it('renders optional help text', () => {
    render(
      <Field helpText="Use a short working title." label="Title">
        <TextInput name="title" />
      </Field>,
    )

    expect(screen.getByText('Use a short working title.')).toBeTruthy()
  })
})
