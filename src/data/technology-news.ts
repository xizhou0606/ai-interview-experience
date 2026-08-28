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

const NEWS_WINDOW_DAYS = 14
const DAY_MS = 86_400_000

export const TECHNOLOGY_NEWS: TechnologyNewsItem[] = [
  {
    date: '2026-08-28',
    category: 'AI',
    title: '仪表盘可构建并部署 eve Agent',
    summary: '仪表盘可生成 eve Agent 并推送到 Git，同时接入聊天、Slack 与 MCP。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/build-and-deploy-eve-agents-from-the-vercel-dashboard',
  },
  {
    date: '2026-08-28',
    category: '后端',
    title: 'Vercel CLI 扩展 DNS 与项目命令',
    summary: '新 CLI 可检查更新 DNS、续订域名、配置项目并管理成员，支持交互与自动化。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-cli-expands-commands-for-dns-domains-and-projects',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 Flash 可控视频生成',
    summary: 'Omni 1.1 支持场景续写、首尾帧插值与 4K 放大，已对 Gemini API 开放。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 预览模型硬件标准',
    summary: '研究预览开放，让 Agent 经 MCP 等协议安全操作实验室与制造设备。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Cursor 接入 AI SDK Harness 层',
    summary: 'Cursor 现可通过官方适配器接入 AI SDK Harness，与其他运行时共用接口。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/cursor-ai-sdk-harness-adapter',
  },
  {
    date: '2026-08-27',
    category: '前端',
    title: 'Vercel 部署页筛选器全面改版',
    summary: '部署页可用一键建议、输入匹配和自然语言查询筛选部署，更快定位目标版本。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/find-deployments-faster-with-redesigned-filters',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'OpenAI 公布 Jalapeño 首测结果',
    summary: 'OpenAI 官方文公布自研推理芯片 Jalapeño 首批 InferenceX 实测，强调模型到芯片的全栈协同。',
    source: 'OpenAI',
    url: 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Claude Chrome 扩展正式全面可用',
    summary: '付费套餐可在 Chrome 中让 Claude 跨标签操作网页，动作先经安全分类器校验再自动执行。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 内置浏览器无需安装扩展',
    summary: 'Claude 桌面端 Cowork 自带独立浏览器，可浏览、填表并与 Chrome 扩展并存，登录可按站点导入。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 详述 Hugging Face 越权事件',
    summary: 'OpenAI 披露内部评测 Agent 突破隔离并侵入 Hugging Face，已暂停相关训练并加强网络隔离。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 发布 Hugging Face 事件调查',
    summary: 'METR 独立调查 OpenAI Agent 在 Hugging Face 事件中的行为、推理与协作，还原越权过程。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-26',
    time: '22:10',
    category: '后端',
    title: 'Node.js 26.8.1 修复版本号显示',
    summary: 'Current 线紧急发布，修正 node --version 误报 alpha 版本号，不含功能变更。',
    source: 'Node.js Blog',
    url: 'https://nodejs.org/en/blog/release/v26.8.1',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 26.8.0 增强加密与压缩',
    summary: 'Current 线加入 SIV 加密、稳定追踪通道、ZIP API 与 MIME 解析。',
    source: 'Node.js Blog',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    time: '14:28',
    category: '后端',
    title: 'Node.js 24.20.0 LTS 加入包映射',
    summary: 'LTS 增加包映射、权限回收、WASM JSPI 与异步存储 using 作用域。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v24.20.0',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 开放实时转写',
    summary: '高精度语音转写上线，支持实时流式与录音转写，开发者现可预览接入。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel Python 项目支持路由规则',
    summary: 'FastAPI、Django、Flask 应用可用路由规则设置响应头与 rewrite，无需重新部署。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel 安全仪表盘正式全面可用',
    summary: '全套餐可在控制台或 CLI 查看账户与项目安全态势，并运行 vercel security check。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-security-dashboard-is-now-generally-available',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 8 月安全补丁修复远程执行',
    summary: '16.3.3 与 15.5.24 修复 AVIF 图像优化与 Windows 托管下的未认证远程代码执行漏洞。',
    source: 'Next.js Blog',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨聊天与 Cowork 打通',
    summary: '聊天与 Cowork 共用记忆，可按主题查看编辑；敏感话题默认不写入，用户可自行开启。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: '后端',
    title: 'Vercel Connect 正式全面可用',
    summary: '应用用现有 OIDC 身份申请短时令牌，不再长期保存第三方密钥，Hobby 含每月免费额度。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-connect-ga',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel Sandbox 现已全球多区域可用',
    summary: 'Sandbox 可在 iad1、sfo1、cle1、cdg1 运行，可设项目默认区域与故障转移。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-globally-available',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel 环境变量分 Config 与 Secret',
    summary: '仪表盘与 CLI 添加环境变量时可标 Config 或 Secret；Secret 保存后对成员只写不可读。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/environment-variables-now-use-config-and-secret-types',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel Bun 函数支持更大包与时长',
    summary: 'Bun runtime 函数包体可达 5GB，最长运行 30 分钟，适合大型依赖与长任务。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/bun-runtime-now-supports-large-functions-and-extended-max-duration',
  },
  {
    date: '2026-08-21',
    category: 'AI',
    title: 'Claude Security 改用 Mythos 5',
    summary: 'Enterprise 可用 Mythos 5 扫描代码并建议补丁；Anthropic 还将能力接入合作方防御产品。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders',
  },
  {
    date: '2026-08-21',
    category: '后端',
    title: 'Vercel 生产预览流量可常开追踪',
    summary: '可为生产与预览流量设置采样规则，无需复现即可查看真实请求的追踪跨度。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/always-on-tracing-for-production-and-preview-traffic',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Computer use 与 Skills API 转正',
    summary: 'Computer use、Skills 与 Files API 正式可用，并新增浏览器操作工具。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Bun 1.4 用 Rust 重写并提升兼容',
    summary: 'Bun 核心从 Zig 迁到 Rust，新增多项原生 API，Node 测试套件再增 1517 项通过。',
    source: 'Bun Blog',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 修复热更新与 SSR',
    summary: '补丁修复循环导入热更新、Lightning CSS 空目标和 SSR 计算键，并放宽 DevTools 版本范围。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98.0 稳定代数浮点方法',
    summary: '稳定代数浮点运算与整数格式化，并明确 ManuallyDrop 与 Box 的安全交互。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    time: '07:15',
    category: '后端',
    title: 'crates.io 清除 arrayref 供应链攻击',
    summary: '被入侵账号发布恶意 arrayref 0.3.10 等版本；官方已删除并建议检查本地 cargo 缓存。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/supply-chain-attack-on-arrayref/',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 发布泛型方法与 json/v2',
    summary: '语言支持泛型方法，encoding/json 默认走 v2，并加入 ML-DSA 与 goroutine 泄漏分析。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/go1.27',
  },
  {
    date: '2026-08-18',
    category: '前端',
    title: 'Next.js 16.3 实现类应用即时导航',
    summary: '即时导航结合缓存组件与预取，服务器渲染也能接近单页应用手感。',
    source: 'Next.js Blog',
    url: 'https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3',
  },
  {
    date: '2026-08-18',
    category: 'AI',
    title: 'OpenAI 放缓前沿模型扩训练节奏',
    summary: '因网络能力评估与 Hugging Face 事件，OpenAI 暂停部分 RL 训练并加强监控与对齐。',
    source: 'OpenAI',
    url: 'https://openai.com/index/pacing-model-development-cyber-capabilities/',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Anthropic 说明 Claude 文本水印原理',
    summary: '未来模型用 SynthID-Text 在采样中嵌入不可见水印，以符合欧盟 AI 法案，不影响输出质量。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
]

export function isFreshNews(item: TechnologyNewsItem, now = new Date()): boolean {
  const [year, month, day] = item.date.split('-').map(Number)
  const itemUtc = Date.UTC(year, month - 1, day)
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const ageDays = (nowUtc - itemUtc) / DAY_MS
  return ageDays >= 0 && ageDays <= NEWS_WINDOW_DAYS
}

export function groupNewsByDate(items: TechnologyNewsItem[] = TECHNOLOGY_NEWS, now = new Date()) {
  const groups = new Map<string, TechnologyNewsItem[]>()
  for (const item of items.filter((entry) => isFreshNews(entry, now))) {
    const list = groups.get(item.date) ?? []
    list.push(item)
    groups.set(item.date, list)
  }
  return [...groups.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, dateItems]) => ({
      date,
      items: [...dateItems].sort((left, right) => (right.time ?? '').localeCompare(left.time ?? '')),
    }))
}

function assertNewsConstraints(items: TechnologyNewsItem[]) {
  const seen = new Set<string>()
  for (const item of items) {
    const titleLength = [...item.title].length
    const summaryLength = [...item.summary].length
    if (titleLength > 28) throw new Error(`新闻标题超过 28 字：${item.title}（${titleLength}）`)
    if (summaryLength > 60) throw new Error(`新闻摘要超过 60 字：${item.title}（${summaryLength}）`)
    if (!NEWS_CATEGORIES.includes(item.category)) throw new Error(`新闻分类无效：${item.url}`)
    if (seen.has(item.url)) throw new Error(`新闻 URL 重复：${item.url}`)
    seen.add(item.url)
  }
}

assertNewsConstraints(TECHNOLOGY_NEWS)
