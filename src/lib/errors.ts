const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.'

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return DEFAULT_ERROR_MESSAGE
}
