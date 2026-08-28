import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { createServer } from 'vite'

const root = process.cwd()
const dataDir = resolve(root, 'src/data/apis')
const sourceRoots = {
  'ai-interview': resolve(root, '../ai-interview'),
  'ai-pm': resolve(root, '../.codex-main-snapshots/ai-pm'),
  'unified-auth-sdk': resolve(root, '../unified-auth-sdk'),
  resume: resolve(root, '../.codex-main-snapshots/resume'),
  'douyin-ai-growth': resolve(root, '../douyin-ai-growth'),
  'ai-playlet': resolve(root, '../ai-playlet'),
  'one-2-all': resolve(root, '../.codex-main-snapshots/one-2-all'),
  'anime-armory': resolve(root, '../.codex-main-snapshots/anime-armory-4f991dd'),
  monitoring: resolve(root, '../.codex-main-snapshots/monitoring'),
  'ai-robot': resolve(root, '../ai-robot'),
}
const endpointManifest = JSON.parse(readFileSync(resolve(root, 'src/data/endpoints/ai-interview-manifest.json'), 'utf8'))
const manifestEndpointKeys = new Set(endpointManifest.endpoints.map((entry) => `${entry.method} ${entry.path}`))
function collectTypeScriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? collectTypeScriptFiles(resolve(directory, entry.name)) : entry.name.endsWith('.ts') ? [resolve(directory, entry.name)] : [])
}
const files = collectTypeScriptFiles(dataDir).filter((file) => file.slice(dataDir.length + 1).includes('/'))
const declaredSlugs = files.flatMap((file) => {
  const source = readFileSync(file, 'utf8')
  return [...source.matchAll(/\n\s*slug:\s*'([^']+)'/g)].map((match) => match[1])
})

const server = await createServer({ root, logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' })
let apiEntries
try {
  ;({ apiEntries } = await server.ssrLoadModule('/src/data/apis/index.ts'))
} finally {
  await server.close()
}

const failures = []
const slugs = new Set()
const deepEndpointSlugs = new Map()
for (const entry of apiEntries) {
  if (slugs.has(entry.slug)) failures.push(`duplicate slug: ${entry.slug}`)
  slugs.add(entry.slug)
}

for (const slug of declaredSlugs) {
  if (!slugs.has(slug)) failures.push(`declared API is not exported by data index: ${slug}`)
}
for (const entry of apiEntries) {
  const requiredStrings = ['slug', 'name', 'signature', 'summary', 'whenToUse', 'sourcePath', 'verifiedCommit']
  for (const field of requiredStrings) {
    if (typeof entry[field] !== 'string' || !entry[field].trim()) failures.push(`${entry.slug}: missing ${field}`)
  }
  const sourceRoot = sourceRoots[entry.project]
  if (!sourceRoot || !existsSync(resolve(sourceRoot, entry.sourcePath))) failures.push(`${entry.slug}: invalid sourcePath ${entry.sourcePath}`)
  if (entry.implementationStatus && entry.implementationStatus !== 'production' && !entry.statusNote?.trim()) {
    failures.push(`${entry.slug}: non-production status requires statusNote`)
  }
  if (!Array.isArray(entry.parameters)) failures.push(`${entry.slug}: missing parameters`)
  if (!entry.returns?.type || !entry.returns?.description) failures.push(`${entry.slug}: incomplete returns`)
  if (!entry.example?.code || !entry.example?.language || !entry.example?.explanation?.length) failures.push(`${entry.slug}: incomplete example`)
  if (!entry.effect?.title || !entry.effect?.description || !entry.effect?.metrics?.length || !entry.effect?.output?.length) failures.push(`${entry.slug}: incomplete effect`)
  if (!entry.errors?.length) failures.push(`${entry.slug}: missing error recovery`)
  if (!entry.bestPractices?.length) failures.push(`${entry.slug}: missing best practices`)
  if (!entry.tests?.length) failures.push(`${entry.slug}: missing test evidence path`)
  for (const test of entry.tests ?? []) {
    if (!sourceRoot || !test.path || !existsSync(resolve(sourceRoot, test.path))) failures.push(`${entry.slug}: invalid test path ${test.path ?? '(missing)'}`)
    if (!test.proves?.trim()) failures.push(`${entry.slug}: test evidence is missing its proof boundary`)
  }
  if (!entry.officialSources?.length) failures.push(`${entry.slug}: missing official source URL`)
  for (const source of entry.officialSources ?? []) {
    if (!source.url?.startsWith('https://')) failures.push(`${entry.slug}: official source must use https ${source.url ?? '(missing)'}`)
  }
  for (const related of entry.related ?? []) {
    if (!slugs.has(related)) failures.push(`${entry.slug}: unresolved related API ${related}`)
  }
  if (entry.kind === 'http' && entry.project === 'ai-interview') {
    const candidates = [entry.name, entry.signature].flatMap((value) => {
      const match = value.match(/(GET|POST|PATCH|DELETE|PUT)\s+(\/api\/\S+)/)
      return match ? [`${match[1]} ${match[2].split('?')[0]}`] : []
    })
    const key = candidates.find((candidate) => manifestEndpointKeys.has(candidate))
    if (!key) failures.push(`${entry.slug}: HTTP detail does not map to the 216-endpoint manifest`)
    else if (deepEndpointSlugs.has(key) && deepEndpointSlugs.get(key) !== entry.slug) failures.push(`${entry.slug}: duplicate HTTP detail for ${key}`)
    else deepEndpointSlugs.set(key, entry.slug)
  }
}

if (failures.length) {
  console.error(`API content check failed:\n${failures.map((item) => `- ${item}`).join('\n')}`)
  process.exit(1)
}
console.log(`API content check passed: ${apiEntries.length} complete entries; ${deepEndpointSlugs.size}/${manifestEndpointKeys.size} HTTP endpoints have deep details.`)
