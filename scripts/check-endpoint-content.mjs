import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const sourceRoot = resolve(root, '../ai-interview')
const manifestPath = resolve(root, 'src/data/endpoints/ai-interview-manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const failures = []
const allowedMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
const keys = new Set()

if (manifest.meta?.commit !== 'ee897c2801eb') failures.push('manifest commit does not match audited baseline')
if (manifest.meta?.explicitBusinessEndpointCount !== 216) failures.push('meta endpoint count must equal 216')
if (manifest.endpoints?.length !== 216) failures.push(`endpoint array must contain 216, found ${manifest.endpoints?.length ?? 0}`)

for (const endpoint of manifest.endpoints ?? []) {
  const key = `${endpoint.method} ${endpoint.path}`
  if (keys.has(key)) failures.push(`duplicate endpoint ${key}`)
  keys.add(key)
  if (!allowedMethods.has(endpoint.method)) failures.push(`invalid method ${key}`)
  if (!endpoint.path?.startsWith('/api/')) failures.push(`invalid mounted path ${key}`)
  if (!endpoint.group) failures.push(`missing group ${key}`)
  if (!Number.isInteger(endpoint.line) || endpoint.line < 1) failures.push(`invalid source line ${key}`)
  if (!endpoint.sourcePath || !existsSync(resolve(sourceRoot, endpoint.sourcePath))) failures.push(`invalid source path ${key}`)
  if (!Array.isArray(endpoint.auth)) failures.push(`auth chain must be an array ${key}`)
}

if (failures.length) {
  console.error(`Endpoint content check failed:\n${failures.map((item) => `- ${item}`).join('\n')}`)
  process.exit(1)
}

const groups = new Set(manifest.endpoints.map((endpoint) => endpoint.group))
console.log(`Endpoint content check passed: ${manifest.endpoints.length} unique endpoints across ${groups.size} router families.`)
