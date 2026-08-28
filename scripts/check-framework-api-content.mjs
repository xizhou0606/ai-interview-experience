import process from 'node:process'
import { createServer } from 'vite'

const root = process.cwd()
const server = await createServer({ root, logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' })
let frameworkApiReferences
let frameworkApiCatalogs
try {
  ;({ frameworkApiReferences, frameworkApiCatalogs } = await server.ssrLoadModule('/src/data/framework-apis/index.ts'))
} finally {
  await server.close()
}

const failures = []
const slugs = new Set()
const requiredStrings = ['slug', 'technologySlug', 'name', 'group', 'kind', 'maturity', 'signature', 'beginner', 'whenToUse', 'example', 'exampleLanguage', 'returns', 'interview', 'pitfall', 'officialUrl']
const structuredLearningSlugs = new Set(['turborepo', 'vite', 'ai-sdk-6', 'mcp', 'langgraph', 'mastra', 'qdrant', 'bullmq', 'langchain', 'livekit-agents', 'langfuse', 'better-auth', 'nanobot', 'openai-compatible', 'openai-javascript-sdk', 'solid-js', 'tanstack'])
for (const api of frameworkApiReferences) {
  if (slugs.has(api.slug)) failures.push(`duplicate slug: ${api.slug}`)
  slugs.add(api.slug)
  for (const field of requiredStrings) if (typeof api[field] !== 'string' || !api[field].trim()) failures.push(`${api.slug}: missing ${field}`)
  if (!api.officialUrl?.startsWith('https://')) failures.push(`${api.slug}: officialUrl must use https`)
  if (api.beginner.length < 24) failures.push(`${api.slug}: beginner explanation is too short`)
  if (api.whenToUse.length < 12) failures.push(`${api.slug}: usage guidance is too short`)
  if (api.example.length < 12) failures.push(`${api.slug}: example is too short`)
  if (api.returns.length < 12) failures.push(`${api.slug}: return explanation is too short`)
  if (api.interview.length < 24) failures.push(`${api.slug}: interview answer is too short`)
  if (api.pitfall.length < 20) failures.push(`${api.slug}: pitfall explanation is too short`)
  if (api.technologySlug === 'ai-sdk-6' && (!api.imports || api.imports.length < 16)) failures.push(`${api.slug}: AI SDK entry must include an explicit import`)
  if (structuredLearningSlugs.has(api.technologySlug)) {
    if (!['core', 'advanced', 'reference'].includes(api.learningLevel)) failures.push(`${api.slug}: structured entry must declare a learningLevel`)
    if (!['server', 'client', 'both'].includes(api.runtime)) failures.push(`${api.slug}: structured entry must declare a runtime boundary`)
    if (!Array.isArray(api.parameters) || api.parameters.length < (api.learningLevel === 'core' ? 3 : 1)) failures.push(`${api.slug}: structured entry needs parameter-level teaching metadata`)
    for (const parameter of api.parameters ?? []) {
      if (!parameter.name || !parameter.type || typeof parameter.required !== 'boolean' || !parameter.description || parameter.description.length < 12) failures.push(`${api.slug}: incomplete parameter metadata for ${parameter.name || 'unknown parameter'}`)
    }
    if (!api.expectedOutput || api.expectedOutput.length < 20) failures.push(`${api.slug}: structured entry needs a concrete expected output`)
    if (!Array.isArray(api.errorCases) || api.errorCases.length < 1 || api.errorCases.some((item) => !item.condition || !item.handling || item.handling.length < 16)) failures.push(`${api.slug}: structured entry needs actionable error recovery`)
    if (!Array.isArray(api.relatedApis) || api.relatedApis.length < 1) failures.push(`${api.slug}: structured entry needs related API guidance`)
  }
}

const aiSdkByName = new Map(frameworkApiReferences.filter((api) => api.technologySlug === 'ai-sdk-6').map((api) => [api.name, api]))
for (const technologySlug of structuredLearningSlugs) {
  const byName = new Map(frameworkApiReferences.filter((api) => api.technologySlug === technologySlug).map((api) => [api.name, api]))
  for (const related of [...byName.values()].flatMap((api) => api.relatedApis ?? [])) {
    if (!byName.has(related)) failures.push(`${technologySlug} related API does not exist in locked catalog: ${related}`)
  }
}
for (const name of ['transcribe', 'generateSpeech', 'useObject']) {
  if (aiSdkByName.get(name)?.maturity !== 'experimental') failures.push(`ai-sdk-${name}: experimental API is incorrectly marked stable`)
}
const agentStream = aiSdkByName.get('createAgentUIStream')
if (!agentStream?.signature.includes('uiMessages') || !agentStream.signature.includes('Promise<AsyncIterableStream')) failures.push('createAgentUIStream: signature must use uiMessages and Promise<AsyncIterableStream>')
for (const name of ['createAgentUIStreamResponse', 'pipeAgentUIStreamToResponse']) {
  const api = aiSdkByName.get(name)
  if (!api?.signature.includes('uiMessages') || !api.signature.includes('Promise<')) failures.push(`${name}: signature must use uiMessages and return Promise`)
}
const middleware = aiSdkByName.get('LanguageModelV3Middleware')
if (middleware?.maturity !== 'type-only' || !middleware.signature.includes("specificationVersion: 'v3'")) failures.push("LanguageModelV3Middleware: AI SDK 6 type must declare specificationVersion: 'v3'")
const openAiCompatibleByName = new Map(frameworkApiReferences.filter((api) => api.technologySlug === 'openai-compatible').map((api) => [api.name, api]))
for (const name of ['provider(modelId)', 'provider.languageModel', 'provider.chatModel', 'provider.completionModel']) {
  if (!openAiCompatibleByName.get(name)?.signature.includes('LanguageModelV4')) failures.push(`${name}: @ai-sdk/openai-compatible 3.0.11 must return LanguageModelV4`)
}
if (!openAiCompatibleByName.get('provider.embeddingModel')?.signature.includes('EmbeddingModelV4')) failures.push('provider.embeddingModel: @ai-sdk/openai-compatible 3.0.11 must return EmbeddingModelV4')
if (!openAiCompatibleByName.get('provider.imageModel')?.signature.includes('ImageModelV4')) failures.push('provider.imageModel: @ai-sdk/openai-compatible 3.0.11 must return ImageModelV4')
for (const brokenPath of ['stdio-mcp-transport', 'create-provider-registry', 'language-model-v3-middleware']) {
  if (frameworkApiReferences.some((api) => api.technologySlug === 'ai-sdk-6' && api.officialUrl.endsWith(brokenPath))) failures.push(`AI SDK still contains known invalid official link: ${brokenPath}`)
}

const exactCatalogs = new Map([
  ['turborepo', { expected: 33, basis: 'learner-facing Turborepo 2.9.15 commands and configuration contracts' }],
  ['vite', { expected: 57, basis: 'learner-facing Vite 8.1.5 APIs and key configuration contracts' }],
  ['ai-sdk-6', { expected: 56, basis: 'Core + UI APIs' }],
  ['mcp', { expected: 31, basis: '2025-11-25 request + notification methods' }],
  ['langgraph', { expected: 63, basis: 'learner-facing public Python APIs' }],
  ['mastra', { expected: 101, basis: 'learner-facing Mastra 1.x reference APIs' }],
  ['qdrant', { expected: 60, basis: 'learner-facing @qdrant/js-client-rest facade APIs' }],
  ['bullmq', { expected: 108, basis: 'learner-facing BullMQ 5.x APIs' }],
  ['langchain', { expected: 101, basis: 'learner-facing LangChain JS 1.x APIs' }],
  ['livekit-agents', { expected: 103, basis: 'learner-facing LiveKit Agents Python APIs' }],
  ['langfuse', { expected: 60, basis: 'learner-facing Langfuse JS/TS v5 APIs' }],
  ['better-auth', { expected: 93, basis: 'learner-facing Better Auth 1.6 APIs' }],
  ['nanobot', { expected: 86, basis: 'learner-facing nanobot v0.2.2 APIs' }],
  ['openai-compatible', { expected: 10, basis: 'learner-facing @ai-sdk/openai-compatible APIs' }],
  ['openai-javascript-sdk', { expected: 77, basis: 'learner-facing OpenAI JavaScript SDK APIs' }],
  ['solid-js', { expected: 48, basis: 'learner-facing Solid 1.x APIs' }],
  ['tanstack', { expected: 59, basis: 'learner-facing TanStack React application APIs' }],
])
for (const [technologySlug, catalog] of exactCatalogs) {
  const actual = frameworkApiReferences.filter((api) => api.technologySlug === technologySlug).length
  if (actual !== catalog.expected) failures.push(`${technologySlug}: expected ${catalog.expected} ${catalog.basis}, received ${actual}`)
}

const catalogSlugs = new Set()
for (const catalog of frameworkApiCatalogs) {
  if (catalogSlugs.has(catalog.technologySlug)) failures.push(`duplicate framework catalog: ${catalog.technologySlug}`)
  catalogSlugs.add(catalog.technologySlug)
  const actual = frameworkApiReferences.filter((api) => api.technologySlug === catalog.technologySlug).length
  if (actual !== catalog.expectedCount) failures.push(`${catalog.technologySlug}: catalog claims ${catalog.expectedCount}, received ${actual}`)
  if (!catalog.officialIndexUrl?.startsWith('https://')) failures.push(`${catalog.technologySlug}: catalog officialIndexUrl must use https`)
  if (!catalog.coverageBasis || catalog.coverageBasis.length < 16) failures.push(`${catalog.technologySlug}: catalog coverageBasis is too short`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(catalog.verifiedAt)) failures.push(`${catalog.technologySlug}: invalid verifiedAt`)
}
for (const technologySlug of new Set(frameworkApiReferences.map((api) => api.technologySlug))) {
  if (!catalogSlugs.has(technologySlug)) failures.push(`${technologySlug}: framework APIs exist without catalog coverage metadata`)
}

if (failures.length) {
  console.error(`Framework API content check failed:\n${failures.map((item) => `- ${item}`).join('\n')}`)
  process.exit(1)
}

console.log(`Framework API content check passed: ${frameworkApiReferences.length} complete references; ${[...exactCatalogs].map(([slug, catalog]) => `${slug} ${catalog.expected}/${catalog.expected}`).join(', ')}.`)
