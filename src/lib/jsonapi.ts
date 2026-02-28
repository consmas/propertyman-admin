// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

import type { JsonApiResource, JsonApiResponse, JsonApiMeta } from '@/types'

/**
 * Extract plain attributes + id from a JSON:API resource.
 */
export function parseResource<T extends AnyRecord>(
  resource: JsonApiResource<T>
): T & { id: string } {
  return { id: resource.id, ...resource.attributes }
}

/**
 * Parse a JSON:API list response into a flat array + meta.
 */
export function parseList<T extends AnyRecord>(
  response: JsonApiResponse<JsonApiResource<T>[]>
): { data: Array<T & { id: string }>; meta: JsonApiMeta } {
  const data = response.data.map(parseResource<T>)
  return { data, meta: response.meta ?? {} }
}

/**
 * Parse a JSON:API single resource response.
 */
export function parseSingle<T extends AnyRecord>(
  response: JsonApiResponse<JsonApiResource<T>>
): T & { id: string } {
  return parseResource<T>(response.data)
}

/**
 * Build a JSON:API create/update payload.
 */
export function buildPayload<T extends AnyRecord>(
  type: string,
  attributes: T,
  id?: string
): { data: { id?: string; type: string; attributes: T } } {
  return { data: { ...(id ? { id } : {}), type, attributes } }
}
