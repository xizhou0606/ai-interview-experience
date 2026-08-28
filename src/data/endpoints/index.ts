import type { HttpEndpointEntry } from './types'
import manifest from './ai-interview-manifest.json'

export type { HttpEndpointEntry, HttpMethod } from './types'

const deepApiByPath: Record<string, string> = {
  'POST /api/agent/report': 'post-agent-report',
  'POST /api/interview/:id/:roundId/livekit-token': 'post-livekit-token',
  'POST /api/livekit/webhook': 'post-livekit-webhook',
  'POST /api/w/:slug/interview/parse-resume': 'post-interview-parse-resume',
  'POST /api/w/:slug/resume/chat': 'post-resume-chat',
}

function validatorLabel(target: string, rawSchema: string) {
  const schema = rawSchema.trim()
  if (schema.startsWith('//')) return `${target}:动态契约（由 templateVersion 决定）`
  return `${target}:${/^\w+Schema\)$/.test(schema) ? schema.slice(0, -1) : schema}`
}

function requestSummary(request: (typeof manifest.endpoints)[number]['request']) {
  const parts = [
    ...request.validators.map((item) => validatorLabel(item.target, item.schema)),
    request.params.length ? `params:${request.params.join(',')}` : '',
    request.headers.length ? `headers:${request.headers.join(',')}` : '',
    request.bodyType ? `body:${request.bodyType}` : '',
  ].filter(Boolean)
  return parts.join(' · ') || '无显式 schema；handler 内读取或无请求体'
}

function responseSummary(response: (typeof manifest.endpoints)[number]['response'], transport = response.transport) {
  const success = response.successStatuses.length ? `成功 ${response.successStatuses.join('/')}` : '成功状态由 handler 推导'
  const errors = response.errorStatuses.length ? `错误 ${response.errorStatuses.join('/')}` : '无显式业务错误状态'
  return [`${transport} · ${success}`, errors, response.unhandledError]
}

const transportOverrides: Record<string, HttpEndpointEntry['transport']> = {
  'GET /api/public/interview-rounds/:id/recordings/:conversationId': 'json',
  'GET /api/w/:slug/studio/interviews/:id/recordings/:conversationId': 'json',
}

export const httpEndpointMeta = manifest.meta

export const httpEndpoints: HttpEndpointEntry[] = manifest.endpoints.map((item) => {
  const key = `${item.method} ${item.path}`
  const transport = transportOverrides[key] ?? item.response.transport as HttpEndpointEntry['transport']
  return {
    slug: `${item.method.toLowerCase()}-${item.path.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()}`,
    method: item.method as HttpEndpointEntry['method'],
    path: item.path,
    group: item.group,
    summary: deepApiByPath[key] ? '已完成签名、案例、可见效果、错误恢复、测试与最佳实践八维精讲。' : '请求与响应契约已从 handler 静态编目；代表测试是最近 route-family 证据，不等于该端点直接覆盖。',
    sourcePath: item.sourcePath,
    sourceLine: item.line,
    auth: item.auth,
    request: requestSummary(item.request),
    responses: responseSummary(item.response, transport),
    transport,
    testPath: item.representativeTest ?? undefined,
    deepApiSlug: deepApiByPath[key],
  }
})
