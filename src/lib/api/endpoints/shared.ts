import type { ApiResponse } from '@/types/api'

export type JsonApiResource = {
  id?: string
  type?: string
  attributes?: Record<string, unknown>
}

function flattenResource(resource: JsonApiResource): Record<string, unknown> {
  return { id: resource.id, ...(resource.attributes ?? {}) }
}

/** Unwrap either plain { data } or JSON:API { data: { id, attributes } } payloads. */
export function unwrapApiResponse<T>(raw: unknown): ApiResponse<T> {
  const payload = raw as Record<string, unknown>
  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    return { data: payload as unknown as T }
  }

  const inner = payload.data
  const meta = payload.meta as ApiResponse<T>['meta']

  if (Array.isArray(inner)) {
    const items = inner.map((item) => {
      if (item && typeof item === 'object' && 'attributes' in item) {
        return flattenResource(item as JsonApiResource)
      }
      return item
    })
    return { data: items as unknown as T, meta }
  }

  if (inner && typeof inner === 'object' && 'attributes' in (inner as Record<string, unknown>)) {
    return { data: flattenResource(inner as JsonApiResource) as unknown as T, meta }
  }

  return payload as unknown as ApiResponse<T>
}
