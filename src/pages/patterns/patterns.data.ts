import { patterns } from '../../data/catalog'

export const ALL_PATTERNS = [
  ...patterns,
  { title: '输出契约与质量闸门', tag: 'Quality', description: '产物不仅要存在，还要通过结构、可播放性、时长、像素文字、无障碍和来源元数据检查。', projects: 'anime-armory · one-2-all' },
  { title: '结构化生成防线', tag: 'Structured Output', description: 'Schema 约束、JSON 修复、字段默认、数组上限、评分 clamp 和错误清洗形成多层防线。', projects: 'ai-pm · douyin-ai-growth' },
  { title: '端到端 Trace ID', tag: 'Observability', description: 'HTTP、队列、图节点、检索、模型和工具使用同一关联 id，失败才可还原。', projects: 'one-2-all · monitoring' },
]
