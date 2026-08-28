import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../src/', import.meta.url))
const violations = []

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (['.ts', '.tsx'].includes(extname(entry.name))) await inspect(path)
  }
}

async function inspect(path) {
  const source = await readFile(path, 'utf8')
  const local = relative(root, path)
  const lines = source.split('\n').length

  if (!local.startsWith('data/') && lines > 220) {
    violations.push(`${local}: ${lines} lines exceeds the 220-line production module limit`)
  }
  if ((local.startsWith('components/') || local.startsWith('features/')) && /from ['"][^'"]*pages\//.test(source)) {
    violations.push(`${local}: shared modules must not import from pages`)
  }
  if (local.startsWith('components/') && local.endsWith('.tsx')) {
    const segments = local.split('/')
    if (segments.length < 4) violations.push(`${local}: shared components require domain/ComponentName/ComponentName.tsx folders`)
  }
}

await walk(root)

if (violations.length) {
  console.error(`Architecture check failed:\n${violations.map((item) => `- ${item}`).join('\n')}`)
  process.exit(1)
}

console.log('Architecture check passed: module size and dependency direction are valid.')
