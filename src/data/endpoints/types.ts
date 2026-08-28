export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface HttpEndpointEntry {
  slug: string
  method: HttpMethod
  path: string
  group: string
  summary: string
  sourcePath: string
  sourceLine: number
  auth: string[]
  permission?: string
  request?: string
  responses?: string[]
  transport?: 'json' | 'binary' | 'stream'
  testPath?: string
  deepApiSlug?: string
}
