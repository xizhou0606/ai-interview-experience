export const NEWS_RETENTION_DAYS = 14
export const NEWS_TITLE_MAX = 28
export const NEWS_SUMMARY_MAX = 60

export type NewsCategory = '前端' | '后端' | 'AI'
export const NEWS_CATEGORIES: NewsCategory[] = ['前端', '后端', 'AI']

export interface TechnologyNewsItem {
  date: string
  time?: string
  category: NewsCategory
  title: string
  summary: string
  source: string
  url: string
}

function item(
  date: string,
  category: NewsCategory,
  title: string,
  summary: string,
  source: string,
  url: string,
  time?: string,
): TechnologyNewsItem {
  return time ? { date, time, category, title, summary, source, url } : { date, category, title, summary, source, url }
}

function codePointLength(value: string) {
  return [...value].length
}

function utcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function isFreshNews(entry: TechnologyNewsItem, now = new Date()) {
  const cutoff = utcDay(now) - NEWS_RETENTION_DAYS * 24 * 60 * 60 * 1000
  const published = Date.parse(`${entry.date}T00:00:00Z`)
  return Number.isFinite(published) && published >= cutoff
}

export function publishedNews(now = new Date()) {
  const seen = new Set<string>()
  return TECHNOLOGY_NEWS.filter((entry) => {
    if (seen.has(entry.url) || !isFreshNews(entry, now)) return false
    seen.add(entry.url)
    return true
  }).sort((left, right) => {
    const byDate = right.date.localeCompare(left.date)
    if (byDate !== 0) return byDate
    return (right.time ?? '').localeCompare(left.time ?? '')
  })
}

export function groupNewsByDate(items: TechnologyNewsItem[]) {
  const groups: Array<{ date: string; items: TechnologyNewsItem[] }> = []
  for (const entry of items) {
    const current = groups[groups.length - 1]
    if (current?.date === entry.date) current.items.push(entry)
    else groups.push({ date: entry.date, items: [entry] })
  }
  return groups
}

/** 近 14 天一手来源；按 url 去重，过期条目直接从本数组删除。 */
export const TECHNOLOGY_NEWS: TechnologyNewsItem[] = [
  item('2026-08-28', 'AI', '仪表盘可直接创建 eve 智能体', 'Vercel 仪表盘可脚手架并部署 eve 智能体，生成私有仓库与可对话项目。', 'Vercel Changelog', 'https://vercel.com/changelog/build-and-deploy-eve-agents-from-the-vercel-dashboard'),
  item('2026-08-27', 'AI', 'Gemini Omni 1.1 开放视频控制', 'Omni 1.1 Flash 经 Gemini API 提供场景续写、首尾帧、360p 草稿与 4K 放大。', 'Google Blog', 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/'),
  item('2026-08-27', 'AI', 'Anthropic 预览模型硬件标准', 'MHS 研究预览让智能体经 MCP 安全操控实验与制造设备。', 'Anthropic', 'https://www.anthropic.com/news/model-hardware-standard-research-preview'),
  item('2026-08-27', 'AI', 'AI SDK 接入 Cursor 编程智能体', '官方 Cursor 适配器让应用经同一 HarnessAgent 接口切换编程智能体。', 'Vercel Changelog', 'https://vercel.com/changelog/cursor-ai-sdk-harness-adapter'),
  item('2026-08-26', 'AI', 'Chrome 中的 Claude 正式可用', '付费计划可让 Claude 在浏览器自主操作，动作经安全分类器校验。', 'Claude Blog', 'https://claude.com/blog/claude-in-chrome-generally-available'),
  item('2026-08-26', 'AI', 'Cowork 内置浏览器无需扩展', '桌面端 Cowork 自带独立浏览器，可导航、读页与填表，无需 Chrome 扩展。', 'Claude Blog', 'https://claude.com/blog/cowork-built-in-browser'),
  item('2026-08-26', 'AI', 'OpenAI 公布 Hugging Face 事件', 'OpenAI 就评测智能体突破隔离并侵入 Hugging Face 发布调查与加固计划。', 'OpenAI', 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/'),
  item('2026-08-26', 'AI', 'METR 独立调查越狱评测事件', 'METR 与 Redwood 发布 OpenAI 评测智能体入侵 Hugging Face 的独立调查。', 'METR', 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/'),
  item('2026-08-26', '后端', 'Node.js 26.8.1 修正版本号', '带外修复 node --version 误报 alpha，Current 线请改用 26.8.1。', 'Node.js Blog', 'https://nodejs.org/en/blog/release/v26.8.1', '22:10'),
  item('2026-08-26', '后端', 'Node.js 26.8 增强加密与压缩', 'Current 线加入 SIV 加密、Zip 读写、REPL 高亮，并稳定 TracingChannel。', 'Node.js Blog', 'https://nodejs.org/en/blog/release/v26.8.0'),
  item('2026-08-26', '后端', 'Node.js 24.20 LTS 增强权限加载', 'LTS 加入 package maps、权限审计、流迭代器与 WASM JSPI。', 'Node.js Blog', 'https://nodejs.org/en/blog/release/v24.20.0'),
  item('2026-08-26', 'AI', 'Gemini 3.5 Transcribe 开放预览', '实时与录音转写进入 Gemini API，支持说话人标注与 85 种语言。', 'Google Blog', 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/'),
  item('2026-08-26', '后端', 'Python 项目可用 CDN 路由规则', 'FastAPI 等 Python 应用可在 CDN 层改写路径与响应头，无需重新部署。', 'Vercel Changelog', 'https://vercel.com/changelog/python-projects-now-support-routing-rules'),
  item('2026-08-26', '后端', 'Vercel 安全仪表盘正式可用', '全计划可扫描 2FA、OIDC 与预览暴露等问题，CLI 提供 vercel security check。', 'Vercel Changelog', 'https://vercel.com/changelog/vercel-security-dashboard-is-now-generally-available'),
  item('2026-08-25', '前端', 'Next.js 紧急修复两处远程执行', '16.3.3 与 15.5.24 修补 AVIF 优化与 Windows 托管的未认证远程代码执行。', 'Next.js Blog', 'https://nextjs.org/blog/august-2026-security-release'),
  item('2026-08-25', 'AI', 'Claude 记忆跨聊天与 Cowork', '聊天与 Cowork 共用可编辑记忆，敏感主题默认不保存，用户可开关。', 'Claude Blog', 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it'),
  item('2026-08-25', 'AI', 'OpenAI 公布自研推理芯片结果', 'Jalapeño 首测在 InferenceX 上吞吐与时延优于对照商用推理系统。', 'OpenAI', 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/'),
  item('2026-08-24', '后端', 'Vercel Sandbox 扩展至四区域', 'Sandbox 可在 iad1、sfo1、cle1、cdg1 运行，Pro 可配置故障转移区域。', 'Vercel Changelog', 'https://vercel.com/changelog/vercel-sandbox-is-now-globally-available'),
  item('2026-08-24', '后端', '环境变量改为配置与密钥类型', '敏感开关改为 Config/Secret，密钥保存后不可回读，生产可强制隔离。', 'Vercel Changelog', 'https://vercel.com/changelog/environment-variables-now-use-config-and-secret-types'),
  item('2026-08-21', 'AI', 'Mythos 5 进入 Claude 安全扫描', '企业可用 Mythos 5 扫描自有代码并建议补丁，不直接开放模型对话。', 'Claude Blog', 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders'),
  item('2026-08-20', 'AI', '计算机使用与 Skills API 转正', 'Computer use、Skills API 与 Files API 正式可用，并新增浏览器工具。', 'Claude Blog', 'https://claude.com/blog/computer-use-skills-api-files-api'),
  item('2026-08-20', '后端', 'Bun 1.4 以 Rust 重写运行时', '运行时改写为 Rust，新增 WebView、定时任务与并行测试，兼容更多 Node。', 'Bun Blog', 'https://bun.com/blog/bun-v1.4'),
  item('2026-08-20', '前端', 'Vite 8.2.2 修复热更新与 SSR', '补丁让循环依赖走热更新、修正 sourcemap 路径，并修复 SSR 解构计算键。', 'Vite GitHub', 'https://github.com/vitejs/vite/releases/tag/v8.2.2', '04:08'),
  item('2026-08-20', '后端', 'Rust 1.98 稳定代数浮点运算', 'f32/f64 新增 algebraic 方法，整数可缓冲格式化，并澄清 ManuallyDrop。', 'Rust Blog', 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/'),
  item('2026-08-20', '后端', 'crates.io 清除 arrayref 恶意版本', 'arrayref 0.3.10 被植入恶意依赖后下架，官方建议检查本地 Cargo 缓存。', 'Rust Blog', 'https://blog.rust-lang.org/2026/08/20/supply-chain-attack-on-arrayref/', '07:15'),
  item('2026-08-19', '后端', 'Go 1.27 支持泛型方法与 json/v2', '语言加入泛型方法，标准库提供 json/v2、ML-DSA 与 UUID，goroutine 泄漏分析转正。', 'Go Blog', 'https://go.dev/blog/go1.27'),
  item('2026-08-19', '后端', 'Python Queues SDK 进入测试', 'Python 可发布与消费 Vercel Queues，并与 Next.js 生产者跨运行时协作。', 'Vercel Changelog', 'https://vercel.com/changelog/vercel-python-queues-sdk-is-now-available-in-beta'),
  item('2026-08-18', '后端', 'Functions 可托管签名 JWT', 'Vercel KMS 让函数用 OIDC 签名 JWT，私钥不出环境变量，JWKS 可公开校验。', 'Vercel Changelog', 'https://vercel.com/changelog/sign-jwts-from-your-functions-without-managing-private-keys'),
  item('2026-08-14', '前端', 'Vercel CDN 支持加密 Client Hello', '由 Vercel DNS 管理的域名可加密 SNI，观察者只看到 vercel-ech.com。', 'Vercel Changelog', 'https://vercel.com/changelog/encrypted-client-hello-now-supported-on-vercel-cdn'),
  item('2026-08-14', 'AI', 'Claude 将嵌入文本水印', '未来模型用 SynthID-Text 合规打标，不影响质量，且无法追溯到用户。', 'Anthropic', 'https://www.anthropic.com/news/claude-text-watermark'),
]

for (const entry of TECHNOLOGY_NEWS) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) throw new Error(`Invalid news date: ${entry.url}`)
  if (entry.time && !/^\d{2}:\d{2}$/.test(entry.time)) throw new Error(`Invalid news time: ${entry.url}`)
  if (!NEWS_CATEGORIES.includes(entry.category)) throw new Error(`Invalid news category: ${entry.url}`)
  if (codePointLength(entry.title) > NEWS_TITLE_MAX) throw new Error(`News title too long: ${entry.title}`)
  if (codePointLength(entry.summary) > NEWS_SUMMARY_MAX) throw new Error(`News summary too long: ${entry.summary}`)
}

const duplicateUrl = TECHNOLOGY_NEWS.find((entry, index) => TECHNOLOGY_NEWS.findIndex((other) => other.url === entry.url) !== index)
if (duplicateUrl) throw new Error(`Duplicate news URL: ${duplicateUrl.url}`)
