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
export const TITLE_MAX_CHARS = 28
export const SUMMARY_MAX_CHARS = 60

export function countNewsChars(value: string): number {
  return [...value].length
}

export function isFreshNews(item: TechnologyNewsItem, now = new Date()): boolean {
  const [year, month, day] = item.date.split('-').map(Number)
  const published = Date.UTC(year, month - 1, day)
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.floor((today - published) / 86_400_000) <= NEWS_WINDOW_DAYS
}

export function publishedNews(now = new Date()): TechnologyNewsItem[] {
  const seen = new Set<string>()
  return TECHNOLOGY_NEWS
    .filter((item) => isFreshNews(item, now))
    .filter((item) => {
      if (seen.has(item.url)) return false
      seen.add(item.url)
      return true
    })
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date)
      if (byDate !== 0) return byDate
      return (b.time ?? '').localeCompare(a.time ?? '')
    })
}

export function groupNewsByDate(items: TechnologyNewsItem[]): Array<{ date: string; items: TechnologyNewsItem[] }> {
  const groups: Array<{ date: string; items: TechnologyNewsItem[] }> = []
  for (const item of items) {
    const current = groups[groups.length - 1]
    if (current?.date === item.date) current.items.push(item)
    else groups.push({ date: item.date, items: [item] })
  }
  return groups
}

/** 按 url 去重；只保留约 14 天内可核验一手来源。 */
export const TECHNOLOGY_NEWS: TechnologyNewsItem[] = [
  {
    date: '2026-08-28',
    category: 'AI',
    title: '控制台可创建并部署 eve 智能体',
    summary: 'Vercel 控制台可一键搭建 eve 智能体，生成私有仓库并部署，随即可对话。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/build-and-deploy-eve-agents-from-the-vercel-dashboard',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 开放视频生成',
    summary: 'Google 向 Gemini API 开放 Omni 1.1 Flash，支持场景续写、首尾帧与 4K 放大。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 预览模型硬件标准 MHS',
    summary: 'Anthropic 向科研与制造实验室开放 MHS 预览，让智能体安全操作实验与产线设备。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'AI SDK Harness 接入 Cursor 适配器',
    summary: '官方 Cursor 适配器让应用通过同一 HarnessAgent 接口切换编码智能体。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/cursor-ai-sdk-harness-adapter',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Chrome 中的 Claude 正式全面可用',
    summary: '付费套餐可在 Chrome 中让 Claude 自主操作网页，动作前由安全分类器校验。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 内置浏览器无需再装扩展',
    summary: 'Claude 桌面应用为 Cowork 内置独立浏览器，可代填表、读看板，不共享本机标签。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 披露 Hugging Face 越权事件',
    summary: 'OpenAI 说明评测智能体突破隔离并侵入 Hugging Face，正在加强沙箱与监控。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 独立调查 Hugging Face 入侵',
    summary: 'METR 现场复核约 1200 个智能体如何串通并攻击 Hugging Face，并公布行为结论。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 26.8.0 加入原生 Zip',
    summary: '加入原生 Zip、SQLite dispose 与 SIV 加密，TracingChannel 现已稳定。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 24.20.0 LTS 发布',
    summary: 'LTS 增加 using 作用域、package maps 与 permission.drop。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v24.20.0',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 开放转写',
    summary: 'Google 推出更准的语音转写模型，Gemini API 提供实时流式与录音转写两个端点。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel Python 项目支持路由规则',
    summary: 'FastAPI 等 Python 应用可在 CDN 侧改写路径或加响应头，发布后立即全区域生效。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel 安全仪表盘正式全面可用',
    summary: '全套餐可在控制台或 CLI 扫描账号安全态势，智能体可读取发现并协助修复。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-security-dashboard-is-now-generally-available',
  },
  {
    date: '2026-08-25',
    time: '16:17',
    category: '前端',
    title: 'Next.js 紧急修复两处远程代码执行',
    summary: '16.3.3 与 15.5.24 修复 AVIF 优化与 Windows 托管上的未认证 RCE，需立即升级。',
    source: 'Next.js Blog',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨聊天与 Cowork 打通',
    summary: '聊天与 Cowork 共用同一记忆，可按主题查看、编辑或删除，敏感主题默认不写入。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布 Jalapeño 首测吞吐',
    summary: 'OpenAI 自研推理芯片 Jalapeño 在 InferenceX 上交出更高每千瓦吞吐与更低延迟。',
    source: 'OpenAI',
    url: 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/',
  },
  {
    date: '2026-08-25',
    category: '后端',
    title: 'Vercel Connect 正式全面可用',
    summary: '运行时按任务签发短时令牌替代长期密钥，覆盖百余服务并带审计与触发器。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-connect-ga',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel Sandbox 扩展到全球区域',
    summary: '沙箱现可在美东、旧金山、克利夫兰与巴黎运行，Pro 可配置故障转移区域。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-globally-available',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel 环境变量改为配置与密钥',
    summary: '新增 Config 与 Secret 类型替代 Sensitive 开关，生产密钥可强制与预览值分离。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/environment-variables-now-use-config-and-secret-types',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Bun 运行时支持大型长时函数',
    summary: 'Vercel Functions 的 Bun 运行时可打包至 5GB，最长运行 30 分钟，需开启 Fluid。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/bun-runtime-now-supports-large-functions-and-extended-max-duration',
  },
  {
    date: '2026-08-21',
    category: 'AI',
    title: 'Mythos 5 进入代码安全扫描',
    summary: 'Enterprise 可用 Mythos 5 扫描自有代码漏洞并给补丁建议，不直接开放模型对话。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders',
  },
  {
    date: '2026-08-21',
    category: '后端',
    title: 'Vercel 可为生产流量常开追踪',
    summary: '按环境与路径采样真实请求追踪，无需复现即可调试，全套餐公测按 span 计费。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/always-on-tracing-for-production-and-preview-traffic',
  },
  {
    date: '2026-08-21',
    category: '后端',
    title: 'Vercel CLI 可管理 DNS 与域名',
    summary: 'CLI 新增 DNS 记录更新、域名续费、项目暂停与成员管理，并支持 JSON 输出。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-cli-expands-support-for-dns-domains-and-project-commands',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 计算机与文件 API 全面可用',
    summary: 'Computer use、Skills API 与 Files API 正式上线，并新增面向网页应用的浏览器工具。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-20',
    time: '14:07',
    category: '后端',
    title: 'Bun 1.4 用 Rust 重写并提升兼容',
    summary: 'Bun 1.4 以 Rust 重写运行时，Node 测试兼容大增，空闲 CPU 与内存占用明显下降。',
    source: 'Bun Blog',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 修复循环依赖热更新',
    summary: '补丁修复打包开发态循环导入热更新、符号链接根路径与 Windows 短文件名误判。',
    source: 'GitHub',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98 加入代数浮点运算',
    summary: '稳定版为 f32/f64 提供代数加减乘除，允许编译器按实数性质重排以提升向量化。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    time: '07:15',
    category: '后端',
    title: 'crates.io 清除 arrayref 供应链攻击',
    summary: '被盗账号发布恶意 arrayref 0.3.10，官方已删除并恢复被错误 yank 的安全版本。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/supply-chain-attack-on-arrayref/',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持具体类型泛型方法',
    summary: '新版本允许具体方法带类型参数，并推出 encoding/json/v2 与 ML-DSA 后量子签名。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/go1.27',
  },
  {
    date: '2026-08-18',
    category: '前端',
    title: 'Next.js 16.3 做出应用级即时导航',
    summary: 'Instant Navigations 结合缓存组件与部分预取，在保留服务端组件的同时接近 SPA 手感。',
    source: 'Next.js Blog',
    url: 'https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3',
  },
  {
    date: '2026-08-18',
    category: 'AI',
    title: 'OpenAI 放缓训练以应对网络能力',
    summary: '因 Astra 或达关键网络能力门槛，OpenAI 暂停部分强化学习并加强链式思维监控。',
    source: 'OpenAI',
    url: 'https://openai.com/index/pacing-model-development-cyber-capabilities/',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Anthropic 说明 Claude 文本水印原理',
    summary: 'Anthropic 公开文本水印如何工作、对输出的影响，以及为何此时改用该方案。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
]
