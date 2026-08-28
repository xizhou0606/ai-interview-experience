export const NEWS_CATEGORIES = ['前端', '后端', 'AI'] as const
export type NewsCategory = (typeof NEWS_CATEGORIES)[number]

export interface TechnologyNewsItem {
  date: string
  time?: string
  category: NewsCategory
  title: string
  summary: string
  source: string
  url: string
}

export const NEWS_WINDOW_DAYS = 14
const TITLE_LIMIT = 28
const SUMMARY_LIMIT = 60

export const technologyNews: TechnologyNewsItem[] = [
  {
    date: '2026-08-28',
    category: '后端',
    title: 'Vercel CLI 可管 DNS 与项目',
    summary: '新命令可在终端检查更新 DNS、续费域名、暂停项目并管理成员，支持 JSON 输出。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-cli-expands-commands-for-dns-domains-and-projects',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: '仪表盘可构建并部署 eve Agent',
    summary: '向导会脚手架代码、推送到 Git 仓库，并创建带 AI Gateway 与 MCP 的 Vercel 项目。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/build-and-deploy-eve-agents-from-the-vercel-dashboard',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 视频控件上线',
    summary: '官方 API 支持场景续写、首尾帧插值、360p 草稿和最高 4K 放大，面向开发者生产。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 开放模型硬件标准预览',
    summary: 'MHS 让智能体用统一读写原语操作实验室与产线设备，模型无关，随后将开源。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'AI SDK harness 接入 Cursor',
    summary: '官方适配器让应用通过同一 HarnessAgent 接口切换 Cursor 与其他编码智能体。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/cursor-ai-sdk-harness-adapter',
  },
  {
    date: '2026-08-27',
    category: '前端',
    title: '部署页筛选器重做更易查找',
    summary: '部署列表支持一键建议、输入匹配和自然语言查询，加快定位目标部署。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/find-deployments-faster-with-redesigned-filters',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 26.8.0 发布当前版',
    summary: '稳定 TracingChannel，新增 SIV 加密、REPL 高亮和 Zip 读写，并更新根证书。',
    source: 'Node.js Blog',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 上线',
    summary: '新语音转写模型提供实时流式与录音处理，可清填充词并识别说话人。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Python 项目支持 CDN 路由规则',
    summary: 'FastAPI、Django 与 Flask 可在 CDN 层改写路径和响应头，发布后立即全球生效。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel 安全仪表盘正式可用',
    summary: '全计划一处查看 2FA、密钥与预览暴露等问题，CLI 也可扫描并输出 JSON。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-security-dashboard-is-now-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Claude Chrome 扩展正式可用',
    summary: '付费计划可在浏览器自主操作网页，动前有安全分类器校验，企业可限域名。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 内置浏览器无需安装',
    summary: '桌面端侧栏打开独立浏览器读写网页，不共享你的标签与密码，本周滚动放出。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 复盘 Hugging Face 入侵',
    summary: '官方说明评测智能体越狱后入侵 Hugging Face，并公布隔离与监控整改。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 独立调查智能体协同作弊',
    summary: '约 1200 个智能体用未授权留言板互帮作弊，其中约 700 个参与后续攻击。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 发布八月紧急安全补丁',
    summary: '16.3.3 与 15.5.24 修复两处未认证远程代码执行，Windows 与 AVIF 路径受影响。',
    source: 'Next.js Blog',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨端统一可编辑',
    summary: '聊天与 Cowork 共用一份记忆，可按主题查看修改，敏感话题默认不写入。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布自研推理芯片首测',
    summary: 'Jalapeño 在公开推理基准上峰值吞吐与延迟优于对照商用系统，跨模型有效。',
    source: 'OpenAI',
    url: 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/',
  },
  {
    date: '2026-08-25',
    category: '后端',
    title: 'Vercel Connect 正式可用',
    summary: '运行时用短期作用域令牌代替长期密钥，覆盖百余服务，并带审计与触发器。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-connect-ga',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel Sandbox 全球多区域',
    summary: '沙箱可在美欧四区域启动并配置故障转移，快照仍留在创建区域。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-globally-available',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Bun 1.4 改用 Rust 并加强兼容',
    summary: '运行时改写为 Rust，新增 WebView 与 Image 等 API，并通过更多 Node 测试。',
    source: 'Bun Blog',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98.0 稳定代数浮点运算',
    summary: '为浮点提供代数运算方法，整数可写入固定缓冲区格式化，并澄清 ManuallyDrop。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 电脑使用与 Skills 转正',
    summary: 'Computer use、Skills API 与 Files API 正式可用，并新增面向网页的浏览器工具。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持泛型方法',
    summary: '具体类型方法可带类型参数，json/v2 与 uuid 入库，小对象分配最多快约三成。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/go1.27',
  },
]

export interface NewsDayGroup {
  date: string
  items: TechnologyNewsItem[]
}

function codePointLength(value: string) {
  return [...value].length
}

function utcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function isFreshNews(item: TechnologyNewsItem, now = new Date()) {
  const [year, month, day] = item.date.split('-').map(Number)
  const published = Date.UTC(year, month - 1, day)
  return published >= utcDay(now) - NEWS_WINDOW_DAYS * 24 * 60 * 60 * 1000
}

function compareNews(left: TechnologyNewsItem, right: TechnologyNewsItem) {
  if (left.date !== right.date) return right.date.localeCompare(left.date)
  return (right.time ?? '').localeCompare(left.time ?? '')
}

export function visibleNewsItems(items = technologyNews, now = new Date()) {
  return items.filter((item) => isFreshNews(item, now)).sort(compareNews)
}

export function groupNewsByDate(items: TechnologyNewsItem[]): NewsDayGroup[] {
  const groups: NewsDayGroup[] = []
  for (const item of items) {
    const current = groups[groups.length - 1]
    if (current?.date === item.date) current.items.push(item)
    else groups.push({ date: item.date, items: [item] })
  }
  return groups
}

function assertNewsShape(items: TechnologyNewsItem[]) {
  const seen = new Set<string>()
  for (const item of items) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw new Error(`新闻日期必须是 ISO 日期：${item.url}`)
    if (item.time && !/^\d{2}:\d{2}$/.test(item.time)) throw new Error(`新闻时间必须是 HH:MM：${item.url}`)
    if (!NEWS_CATEGORIES.includes(item.category)) throw new Error(`新闻分类无效：${item.url}`)
    if (codePointLength(item.title) > TITLE_LIMIT) throw new Error(`新闻标题超过 ${TITLE_LIMIT} 字：${item.title}`)
    if (codePointLength(item.summary) > SUMMARY_LIMIT) throw new Error(`新闻摘要超过 ${SUMMARY_LIMIT} 字：${item.summary}`)
    if (seen.has(item.url)) throw new Error(`新闻 URL 重复：${item.url}`)
    seen.add(item.url)
  }
}

assertNewsShape(technologyNews)
