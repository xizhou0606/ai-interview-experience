import { HeroSection } from './components/HeroSection/HeroSection'
import { LearningMapSection } from './components/LearningMapSection/LearningMapSection'
import { MethodSection } from './components/MethodSection/MethodSection'
import { ProjectShowcase } from './components/ProjectShowcase/ProjectShowcase'
import { StatBar } from './components/StatBar/StatBar'

export function HomePage() {
  return <main><HeroSection /><StatBar /><LearningMapSection /><ProjectShowcase /><MethodSection /></main>
}
