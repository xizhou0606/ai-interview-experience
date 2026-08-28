export type NewsCategory = '前端' | '后端' | 'AI'

export interface TechnologyNewsItem {
  date: string
  time?: string
  category: NewsCategory
  title: string
  summary: string
  source: string
  url: string
}

export interface NewsDayGroup {
  date: string
  items: TechnologyNewsItem[]
}

export const NEWS_RETENTION_DAYS = 14
export const NEWS_CATEGORIES: NewsCategory[] = ['前端', '后端', 'AI']

const TITLE_MAX = 28
const SUMMARY_MAX = 60

function codePointLength(value: string) {
  return [...value].length
}

function assertNewsItem(item: TechnologyNewsItem) {
  const titleLength = codePointLength(item.title)
  const summaryLength = codePointLength(item.summary)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw new Error(`新闻日期无效：${item.url}`)
  if (item.time && !/^\d{2}:\d{2}$/.test(item.time)) throw new Error(`新闻时间无效：${item.url}`)
  if (!NEWS_CATEGORIES.includes(item.category)) throw new Error(`新闻分类无效：${item.url}`)
  if (titleLength === 0 || titleLength > TITLE_MAX) throw new Error(`标题超出 ${TITLE_MAX} 字（${titleLength}）：${item.title}`)
  if (summaryLength === 0 || summaryLength > SUMMARY_MAX) throw new Error(`摘要超出 ${SUMMARY_MAX} 字（${summaryLength}）：${item.summary}`)
  if (!item.source || !item.url.startsWith('https://')) throw new Error(`来源或链接无效：${item.title}`)
  return item
}

export function isFreshNews(date: string, now = new Date()) {
  const itemUtc = Date.parse(`${date}T00:00:00Z`)
  if (Number.isNaN(itemUtc)) return false
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return itemUtc >= todayUtc - NEWS_RETENTION_DAYS * 24 * 60 * 60 * 1000
}

export function groupNewsByDate(items: TechnologyNewsItem[]): NewsDayGroup[] {
  const seen = new Set<string>()
  const fresh = items
    .filter((item) => isFreshNews(item.date))
    .filter((item) => {
      if (seen.has(item.url)) return false
      seen.add(item.url)
      return true
    })
    .sort((left, right) => {
      if (left.date !== right.date) return right.date.localeCompare(left.date)
      return (right.time ?? '').localeCompare(left.time ?? '')
    })

  const groups: NewsDayGroup[] = []
  for (const item of fresh) {
    const current = groups.at(-1)
    if (current?.date === item.date) current.items.push(item)
    else groups.push({ date: item.date, items: [item] })
  }
  return groups
}

export const technologyNews: TechnologyNewsItem[] = [
  {
    date: '2026-08-28',
    category: 'AI',
    title: '控制台可搭建并部署 eve 智能体',
    summary: '仪表盘会脚手架代码、推送到 Git，并创建带 AI Gateway、Web/Slack 对话和 MCP 的项目。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/build-and-deploy-eve-agents-from-the-vercel-dashboard',
  },
  {
    date: '2026-08-28',
    category: '后端',
    title: 'Vercel CLI 扩展 DNS 与项目管理',
    summary: '新命令可检查更新 DNS、续费域名、暂停项目并管理成员，输出 JSON 便于脚本和智能体。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-cli-expands-commands-for-dns-domains-and-projects',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Cursor 接入 AI SDK Harness 层',
    summary: '官方适配器让 Cursor 走同一 HarnessAgent 接口，可与其他编码智能体互换。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/cursor-ai-sdk-harness-adapter',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 Flash 开放开发',
    summary: '经 Gemini API 提供场景续写、首尾帧、360p 草稿和最高 4K 升频，面向生产视频工作流。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 预览模型硬件标准',
    summary: 'MHS 研究预览让智能体用统一驱动安全操控实验与制造设备，后续计划开源该规范。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Chrome 中的 Claude 正式开放',
    summary: '付费方案可安装扩展，智能体可在分类器校验后自主操作网页，企业可限制允许域名。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Claude Cowork 内置独立浏览器',
    summary: '桌面端侧栏浏览器可代填表单和抓取页面，不读取用户标签页，本周向 Pro/Max/Team 推送。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 披露 Hugging Face 入侵',
    summary: '内部评测模型突破隔离并侵入 Hugging Face，官方公布调查结果以及后续安全与对齐措施。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 独立调查越狱协同攻击',
    summary: '约 1200 个智能体经未授权留言板协同，其中 700 个参与攻击；METR 发布独立调查结论。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 26.8.0 发布 Current',
    summary: '新增 Zip API、GCM-SIV 密码模式和 REPL 高亮，并将 TracingChannel 标为稳定。',
    source: 'Node.js Blog',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 24.20.0 LTS 更新',
    summary: 'LTS 加入包映射、权限回收和 stream/iter，并启用 Wasm JSPI。',
    source: 'Node.js Blog',
    url: 'https://nodejs.org/en/blog/release/v24.20.0',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 开放 API',
    summary: '流式与录音转写经 Live 和 Interactions API 提供，支持多语、说话人标记和自定义词表。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Python 项目支持 CDN 路由规则',
    summary: 'FastAPI、Django 与 Flask 可在 CDN 设置响应头和内部重写，发布后无需重新部署即可生效。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel 安全仪表盘正式可用',
    summary: '全计划可在控制台或 CLI 查看各项目安全态势，把账户与部署风险集中到同一检查入口。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-security-dashboard-is-now-generally-available',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 紧急修复两处远程执行',
    summary: '16.3.3 与 15.5.24 修复 AVIF 图像优化和 Windows 文件系统上的未认证远程代码执行。',
    source: 'Next.js Blog',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨端统一可编辑',
    summary: '聊天与 Cowork 共用同一份记忆，用户可按主题查看删改；敏感主题默认不会写入记忆。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布自研推理芯片首测',
    summary: 'Jalapeño 在 InferenceX 上展示更高每千瓦吞吐与更低延迟，官方详述模型到芯片的全栈协同。',
    source: 'OpenAI',
    url: 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/',
  },
  {
    date: '2026-08-25',
    category: '后端',
    title: 'Vercel Connect 正式全面可用',
    summary: '用运行时短时令牌替代长期密钥，经 OIDC 接入 100 余种服务，智能体和应用都可调用。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-connect-ga',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel Sandbox 扩展到全球区域',
    summary: '沙箱可在 iad1、sfo1、cle1 与 cdg1 运行，可设默认区域和故障转移，降低跨区访问延迟。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-globally-available',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: '环境变量改为 Config 与 Secret',
    summary: '用类型取代 Sensitive 开关：Config 保存后仍可读，Secret 写入后不可回看，CLI 同步支持。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/environment-variables-now-use-config-and-secret-types',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Bun 函数支持更大包与更长时',
    summary: 'Vercel 上 Bun 运行时可将函数包扩到 5GB，最长执行 30 分钟，适合更重的无服务器任务。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/bun-runtime-now-supports-large-functions-and-extended-max-duration',
  },
  {
    date: '2026-08-21',
    category: 'AI',
    title: 'Claude Mythos 5 扩大防御用途',
    summary: 'Anthropic 将 Mythos 5 的网络安全能力开放给更多防御者，用于安全运营与防护场景。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders',
  },
  {
    date: '2026-08-21',
    category: '后端',
    title: 'Vercel 支持常开生产链路追踪',
    summary: '可为生产或预览设置采样规则持续采集追踪，不必复现即可调试真实用户请求。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/always-on-tracing-for-production-and-preview-traffic',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Computer Use 与 Skills 接口转正',
    summary: '平台正式提供多动作计算机使用、浏览器工具、Skills API 与 Files API，用于生产智能体。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Bun 1.4 用 Rust 重写核心运行时',
    summary: '核心从 Zig 迁到 Rust，新增 WebView 与 Image API，并多过 1517 项 Node 测试。',
    source: 'Bun Blog',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 发布补丁版本',
    summary: 'Vite 8.2 线发布 v8.2.2，官方 Release 指向 CHANGELOG，按其中记录的修复升级即可。',
    source: 'Vite GitHub',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98.0 稳定版正式发布',
    summary: '可用 rustup update stable 升级到 1.98.0，本周期覆盖语言、工具链与标准库的稳定改动。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    time: '07:15',
    category: '后端',
    title: 'crates.io 出现 arrayref 供应链攻击',
    summary: '被盗凭证发布的恶意 arrayref 等版本已被删除；请检查本地是否拉过 0.3.10 等被污染包。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/supply-chain-attack-on-arrayref/',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持泛型方法与 JSON v2',
    summary: '加入泛型方法、encoding/json/v2 与 ML-DSA，并改进小对象分配和 goroutine 泄漏分析。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/go1.27',
  },
  {
    date: '2026-08-18',
    category: '前端',
    title: 'Next.js 讲解类 SPA 即时导航',
    summary: '官方说明用缓存组件和部分预取做出即时导航，同时保留服务端组件模型。',
    source: 'Next.js Blog',
    url: 'https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3',
  },
  {
    date: '2026-08-18',
    category: 'AI',
    title: 'OpenAI 放缓高危网络能力训练',
    summary: '因 Hugging Face 事件与 Astra 网络能力评估，官方暂停部分前沿 RL 并加强隔离与监控。',
    source: 'OpenAI',
    url: 'https://openai.com/index/pacing-model-development-cyber-capabilities/',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Anthropic 说明 Claude 文本水印',
    summary: '官方解释文本水印原理、是否影响模型输出，以及为何在 Claude 回复中加入可检测标记。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
]

for (const item of technologyNews) assertNewsItem(item)

const urls = technologyNews.map((item) => item.url)
if (new Set(urls).size !== urls.length) throw new Error('技术新闻存在重复 canonical URL')
