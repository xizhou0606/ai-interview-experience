import process from 'node:process'
import { createServer } from 'vite'

const server = await createServer({ root: process.cwd(), logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' })
let catalog
let comparisonData
try {
  catalog = await server.ssrLoadModule('/src/data/catalog.ts')
  comparisonData = await server.ssrLoadModule('/src/data/technology-comparisons.ts')
} finally {
  await server.close()
}

const failures = []
const comparisons = comparisonData.technologyComparisons
const bySlug = new Map(comparisons.map((item) => [item.technologySlug, item]))
if (bySlug.size !== comparisons.length) failures.push('technology comparison slugs must be unique')

for (const technology of catalog.frameworkTechnologies) {
  const comparison = bySlug.get(technology.slug)
  if (!comparison) {
    failures.push(`${technology.slug}: missing mainstream comparison`)
    continue
  }
  if (!comparison.decisionSummary || comparison.decisionSummary.length < 40) failures.push(`${technology.slug}: decision summary is too short`)
  if (!Array.isArray(comparison.alternatives) || comparison.alternatives.length !== 3) failures.push(`${technology.slug}: must compare exactly 3 mainstream alternatives`)
  const names = new Set()
  for (const alternative of comparison.alternatives ?? []) {
    if (!alternative.alternative || names.has(alternative.alternative)) failures.push(`${technology.slug}: duplicate or missing alternative name`)
    names.add(alternative.alternative)
    for (const field of ['difference', 'chooseCurrentWhen', 'chooseAlternativeWhen']) {
      if (!alternative[field] || alternative[field].length < 24) failures.push(`${technology.slug}/${alternative.alternative}: ${field} is too short`)
    }
    if (!['low', 'medium', 'high'].includes(alternative.migrationCost?.level)) failures.push(`${technology.slug}/${alternative.alternative}: invalid migration cost`)
    if (!alternative.migrationCost?.reason || alternative.migrationCost.reason.length < 20) failures.push(`${technology.slug}/${alternative.alternative}: migration reason is too short`)
  }
}

for (const practice of catalog.engineeringPatternTechnologies) {
  if (bySlug.has(practice.slug)) failures.push(`${practice.slug}: engineering practice must not be presented as a technology-stack comparison`)
}

if (failures.length) {
  console.error(`Technology comparison check failed:\n${failures.map((item) => `- ${item}`).join('\n')}`)
  process.exit(1)
}

console.log(`Technology comparison check passed: ${catalog.frameworkTechnologies.length} stacks × 3 alternatives = ${catalog.frameworkTechnologies.length * 3} decision comparisons.`)
