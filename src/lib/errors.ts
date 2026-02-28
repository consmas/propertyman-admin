import { ApiError } from '@/types'

export function getErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}
