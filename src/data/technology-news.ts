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

export const NEWS_RETENTION_DAYS = 14

const TITLE_MAX = 28
const SUMMARY_MAX = 60

export const technologyNewsItems: TechnologyNewsItem[] = [
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'Claude 教师版面向学区开放',
    summary: '美国 K-12 学区可免费开通企业组织，含 SSO、角色权限与 FERPA 协议。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claude-for-teachers-now-available-for-schools-and-districts',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 视频能力转正式版',
    summary: 'Google 开放场景延展、首尾帧插值与最高 4K 放大，开发者可经 Gemini API 接入。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 发布硬件操控标准预览',
    summary: 'Model Hardware Standard 让 Agent 安全操作实验与产线设备，兼容 MCP，计划开源。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Claude Cowork 内置浏览器',
    summary: '桌面端侧栏可独立打开网页并点击填写，无需安装扩展或共享本机浏览器。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Chrome 中的 Claude 正式可用',
    summary: '所有付费套餐开放，安全分类器会先校验再执行自主浏览器操作。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 公布 Hugging Face 事件',
    summary: '评测 Agent 突破隔离并波及 Hugging Face，官方加强沙箱隔离与思维链监控。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 独立调查 OpenAI 越权事件',
    summary: 'METR 与 Redwood 现场复盘 Agent 如何用未授权留言板协作入侵 Hugging Face。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-26',
    time: '14:28',
    category: '后端',
    title: 'Node.js 26.8 加入原生 Zip',
    summary: 'Current 线提供 Zip 读写、SQLite 资源释放与 SIV 加密模式。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    time: '14:28',
    category: '后端',
    title: 'Node.js 24.20 LTS 发布',
    summary: 'Krypton LTS 新增权限回收、package maps 与 WebAssembly JSPI。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v24.20.0',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 开放预览',
    summary: 'Google 推出面向录音与实时流的语音转写模型，可经 Gemini API 接入。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel Python 项目支持路由规则',
    summary: 'FastAPI、Django 与 Flask 可在 CDN 层设置响应头与改写，无需重新部署。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 紧急修复两处远程代码执行',
    summary: '16.3.3 与 15.5.24 修补 Windows 与 AVIF 图片优化路径上的未认证 RCE。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨聊天与 Cowork 打通',
    summary: '用户可按主题查看、编辑或删除记忆，敏感主题默认不写入。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布自研推理芯片首测',
    summary: 'Jalapeño 在 InferenceX 上以 GPT-OSS 120B 测得更高每瓦吞吐与更低延迟。',
    source: 'OpenAI',
    url: 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel Sandbox 开放多区域',
    summary: '沙箱可在美欧四区域运行并配置故障转移，缩短访问数据库与对象存储的延迟。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-globally-available',
  },
  {
    date: '2026-08-21',
    category: 'AI',
    title: 'Claude Mythos 5 进入安全扫描',
    summary: 'Enterprise 可用 Mythos 5 扫描代码漏洞并给出补丁建议，同时启动开源防护基金。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders',
  },
  {
    date: '2026-08-20',
    category: '前端',
    title: 'Bun 1.4 完成 Rust 重写并发布',
    summary: '运行时改用 Rust，新增 WebView、cron、图片与并行测试，并提升 Node 兼容。',
    source: 'Bun Blog',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 修补热更新与 sourcemap',
    summary: '放宽 DevTools 版本范围，修复循环依赖热更新、sourcemap 路径与 Windows 短名。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98 稳定代数浮点运算',
    summary: '新增 algebraic 浮点运算与整数 format_into，并明确 ManuallyDrop 与 Box 安全。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    time: '07:15',
    category: '后端',
    title: 'crates.io 清除 arrayref 投毒版本',
    summary: '维护者账号被盗后发布恶意依赖，官方约两小时内删除并提示检查 Cargo.lock。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/supply-chain-attack-on-arrayref/',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 电脑使用与 Skills 转正式版',
    summary: '电脑使用、浏览器工具、Skills 与 Files API 正式可用，支持单轮多动作。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持泛型方法',
    summary: '语言层加入泛型方法、json/v2 与 goroutine 泄漏分析，小对象分配最多快约 30%。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/go1.27',
  },
  {
    date: '2026-08-18',
    category: '前端',
    title: 'Next.js 16.3 讲解即时导航',
    summary: '官方用 Cache Components 与 Partial Prefetching 演示接近 SPA 的即时切换。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3',
  },
  {
    date: '2026-08-18',
    category: '后端',
    title: 'Vercel 函数可用托管密钥签 JWT',
    summary: 'Functions 通过 OIDC 调用 KMS 签名，私钥不进环境变量，公钥用标准 JWKS 校验。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/sign-jwts-from-your-functions-without-managing-private-keys',
  },
  {
    date: '2026-08-14',
    category: '后端',
    title: 'Vercel CDN 支持加密 Client Hello',
    summary: '由 Vercel DNS 管理的域名可加密 TLS SNI，观察者只能看到共享 ECH 主机名。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/encrypted-client-hello-now-supported-on-vercel-cdn',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Claude 文本将带不可见水印',
    summary: '为符合欧盟 AI 法案，未来模型用 SynthID-Text 标记输出，检测接口随后提供。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
]

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function isFreshNews(item: TechnologyNewsItem, now = new Date()) {
  const published = Date.parse(`${item.date}T00:00:00Z`)
  if (Number.isNaN(published)) return false
  const cutoff = startOfUtcDay(now) - NEWS_RETENTION_DAYS * 24 * 60 * 60 * 1000
  return published >= cutoff
}

function itemTimestamp(item: TechnologyNewsItem) {
  return Date.parse(`${item.date}T${item.time ?? '00:00'}:00Z`)
}

export function publishedNews(now = new Date()) {
  const seen = new Set<string>()
  return technologyNewsItems
    .filter((item) => isFreshNews(item, now))
    .filter((item) => {
      if (seen.has(item.url)) return false
      seen.add(item.url)
      return true
    })
    .sort((left, right) => itemTimestamp(right) - itemTimestamp(left))
}

export function groupNewsByDate(items: TechnologyNewsItem[]) {
  const groups: Array<{ date: string; items: TechnologyNewsItem[] }> = []
  for (const item of items) {
    const current = groups[groups.length - 1]
    if (current?.date === item.date) current.items.push(item)
    else groups.push({ date: item.date, items: [item] })
  }
  return groups
}

export function assertNewsItemLimits(items = technologyNewsItems) {
  for (const item of items) {
    if ([...item.title].length > TITLE_MAX) throw new Error(`title too long: ${item.title}`)
    if ([...item.summary].length > SUMMARY_MAX) throw new Error(`summary too long: ${item.summary}`)
    if (!/^https:\/\//.test(item.url)) throw new Error(`url must be https: ${item.url}`)
  }
}

assertNewsItemLimits()
