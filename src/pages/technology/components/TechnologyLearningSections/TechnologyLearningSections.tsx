import { isPatternTechnology, type Technology } from '../../../../data/catalog'
import { ArticleSection } from '../ArticleSection/ArticleSection'
import { BeginnerPrimer } from '../BeginnerPrimer/BeginnerPrimer'
import { FrameworkApiReferencePanel } from '../FrameworkApiReferencePanel/FrameworkApiReferencePanel'
import { InterviewPrep } from '../InterviewPrep/InterviewPrep'
import { PatternLearningGuide } from '../PatternLearningGuide/PatternLearningGuide'
import { TechnologyMindMap } from '../TechnologyMindMap/TechnologyMindMap'
import { DockerCommandReference } from '../DockerDeploymentLabs/DockerDeploymentLabs'

export function TechnologyLearningSections({ tech }: { tech: Technology }) {
  return (
    <>
      <ArticleSection index={0} title="先判断：新项目是否需要它"><BeginnerPrimer tech={tech} /></ArticleSection>
      <ArticleSection index={1} title="选型决策：为什么选、为什么不选"><TechnologyMindMap tech={tech} /></ArticleSection>
      <ArticleSection index={2} title="面试表达：把原理和取舍讲清楚"><InterviewPrep tech={tech} /></ArticleSection>
    </>
  )
}

export function TechnologyReferenceSection({ tech }: { tech: Technology }) {
  return (
    <ArticleSection index={7} title={isPatternTechnology(tech.slug) ? `${tech.name} 方法、工具链与检查表` : tech.slug === 'docker' ? 'Dockerfile、CLI 与 Compose 常用指令' : tech.slug === 'turborepo' ? 'Monorepo 架构与 Turborepo 官方 API' : `采用之后：${tech.name} 官方 API 与案例`}>
      {isPatternTechnology(tech.slug) ? <PatternLearningGuide tech={tech} /> : tech.slug === 'docker' ? <DockerCommandReference /> : <FrameworkApiReferencePanel technologySlug={tech.slug} technologyName={tech.name} />}
    </ArticleSection>
  )
}
