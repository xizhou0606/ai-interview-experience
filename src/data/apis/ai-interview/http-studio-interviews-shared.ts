import { AI_INTERVIEW_COMMIT } from '../helpers'
import type { ApiEntry, ApiParameter } from '../types'

export const INTERVIEW_SOURCE = 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/interviews/'
export const ROUND_DAO_TEST = `${INTERVIEW_SOURCE}dao/__tests__/interview-rounds.test.ts`
export const SNAPSHOT_TEST = `${INTERVIEW_SOURCE}dao/__tests__/context-snapshots.test.ts`
export const SNAPSHOT_BOUNDARY_TEST = `${INTERVIEW_SOURCE}__tests__/context-snapshot-boundary-source.test.ts`
export const PATCH_TEST = `${INTERVIEW_SOURCE}__tests__/patch-whitelist.test.ts`
export const PIPELINE_TEST = `${INTERVIEW_SOURCE}__tests__/pipeline-subtables.test.ts`
export const STAGE_PERMISSION_TEST = `${INTERVIEW_SOURCE}__tests__/stage-permission-source.test.ts`
export const TRANSITION_TEST = `${INTERVIEW_SOURCE}__tests__/transition.test.ts`
export const OFFER_ROUTE_TEST = `${INTERVIEW_SOURCE}routes/offer-drafts/__tests__/route.test.ts`
export const RECORDING_ROUTE_TEST = `${INTERVIEW_SOURCE}routes/recordings/__tests__/route.test.ts`
export const REPORT_ROUTE_TEST = `${INTERVIEW_SOURCE}routes/reports/__tests__/route.test.ts`
export const EMAIL_ROUTE_TEST = `${INTERVIEW_SOURCE}routes/round-emails/__tests__/route.test.ts`

const HONO = { label: 'Hono routing', url: 'https://hono.dev/docs/api/routing' }
const ZOD = { label: 'Zod schemas', url: 'https://zod.dev/api' }

export const DRIZZLE = { label: 'Drizzle ORM', url: 'https://orm.drizzle.team/docs/overview' }
export const DRIZZLE_TX = { label: 'Drizzle transactions', url: 'https://orm.drizzle.team/docs/transactions' }
export const LIVEKIT = { label: 'LiveKit access tokens', url: 'https://docs.livekit.io/home/server/generating-tokens/' }
export const S3 = { label: 'AWS SDK S3 v3', url: 'https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/' }
export const HTTP_CACHE = { label: 'MDN HTTP caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching' }
export const RESEND = { label: 'Resend send email', url: 'https://resend.com/docs/api-reference/emails/send-email' }
export const OWASP_IDOR = { label: 'OWASP IDOR prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html' }

export const p = (name: string, type: string, required: boolean, description: string): ApiParameter => ({ name, type, required, description })
export const err = (condition: string, behavior: string, recovery: string) => ({ condition, behavior, recovery })

type Spec = {
  slug: string; method: string; path: string; source: string; line: number; permission: string
  summary: string; when: string; parameters: ApiParameter[]; returnType: string; returnDescription: string
  example?: string; exampleNotes: string[]; effectTitle: string; effectDescription: string
  metrics: { label: string; value: string }[]; outputs: ApiEntry['effect']['output']; errors: ApiEntry['errors']
  practices: string[]; test: string; proves: string; related?: string[]; technology?: string
  sources?: ApiEntry['officialSources']; statusNote?: string
}

export function defineInterviewHttp(s: Spec): ApiEntry {
  const routeSuffix = s.path.replace('/api/w/:slug', '')
  const hasJsonBody = s.parameters.some((parameter) => parameter.type.includes('JSON'))
  const body = hasJsonBody ? ", headers: { 'content-type': 'application/json' }, body: JSON.stringify(input)" : ''
  const example = s.example ?? `const url = '/api/w/' + encodeURIComponent(slug) + '${routeSuffix}'\nconst response = await fetch(url, { method: '${s.method}'${body} })\nif (!response.ok) throw await response.json()\nconst result = await response.json()`
  return {
    slug: s.slug, name: `${s.method} ${s.path}`, signature: `${s.method} ${s.path} → ${s.returnType}`, kind: 'http', project: 'ai-interview', module: 'http-studio-interviews',
    technology: s.technology ?? 'Hono 4.12.23 + Zod + Drizzle ORM', implementationStatus: 'production', statusNote: s.statusNote ?? `生产端点；服务端要求 ${s.permission}，测试证据边界见下方。`,
    summary: s.summary, whenToUse: s.when, sourcePath: `${INTERVIEW_SOURCE}${s.source}`, sourceLine: s.line, verifiedCommit: AI_INTERVIEW_COMMIT,
    parameters: s.parameters, returns: { type: s.returnType, description: s.returnDescription }, example: { language: 'ts', code: example, explanation: s.exampleNotes },
    effect: { title: s.effectTitle, description: s.effectDescription, metrics: s.metrics, output: s.outputs }, errors: s.errors, bestPractices: s.practices,
    tests: [{ path: s.test, proves: s.proves }], officialSources: [HONO, ZOD, ...(s.sources ?? [DRIZZLE])], related: s.related ?? [],
  }
}
