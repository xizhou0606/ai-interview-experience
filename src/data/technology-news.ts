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
const MS_PER_DAY = 24 * 60 * 60 * 1000

export const technologyNews: TechnologyNewsItem[] = [
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'SonarQube猎手智能体正式可用',
    summary: '云端企业版可扫越权与业务逻辑漏洞，发现后先验证可利用性再作为常规问题入库。',
    source: 'Sonar',
    url: 'https://www.sonarsource.com/blog/hunter-agent-detects-logical-flaws/',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: '腾讯开源Hy4预览大模型',
    summary: '混元发布770B总参、49B激活的MoE模型，上下文超1M，已开源并开放API。',
    source: 'Tencent',
    url: 'https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: '多向量嵌入模型现可官方微调',
    summary: '官方库提供训练器，可从零训练或按领域微调ColBERT式多向量检索模型。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/train-multi-vector-encoder',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Chat SDK接入X加密私信',
    summary: '新适配器处理端到端加密与验签，机器人可主动私信，流式回复靠消息编辑。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/chat-sdk-now-supports-xchat',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Vercel Python队列SDK进入公测',
    summary: '可用Python发布与消费队列，并与Next.js交叉投递，支持重试、分片与投递保证。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-python-queues-sdk-is-now-available-in-beta',
  },
  {
    date: '2026-08-18',
    time: '13:46',
    category: 'AI',
    title: '嵌入库v6支持ColBERT多向量',
    summary: 'v6.0新增MultiVectorEncoder，可加载ColBERT与视觉文档检索模型。',
    source: 'Sentence Transformers',
    url: 'https://github.com/huggingface/sentence-transformers/releases/tag/v6.0.0',
  },
  {
    date: '2026-08-24',
    time: '04:58',
    category: '前端',
    title: 'create-vite 9.2支持nub包管理器',
    summary: '官方脚手架新增nub包管理器，并更新React编译器实验说明与ESLint链接。',
    source: 'Vite GitHub',
    url: 'https://github.com/vitejs/vite/releases/tag/create-vite@9.2.0',
  },
  {
    date: '2026-08-17',
    time: '19:20',
    category: 'AI',
    title: 'Azure托管Claude开放智能体五能力',
    summary: 'Foundry在Azure托管部署上开放结构化输出、网页搜索抓取、MCP连接与工具检索。',
    source: 'Microsoft Foundry',
    url: 'https://devblogs.microsoft.com/foundry/five-new-claude-capabilities-now-available-in-foundry/',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Gradio推出可视化工作流画布',
    summary: '用图节点描述流水线，同一工作流可拖拽运行、暴露REST并一键部署到Spaces。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/gradio-workflow-guide',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Muse Image开放开发者API',
    summary: 'Meta Model API按每张0.01美元提供生成、编辑与多图合成，接口对齐OpenAI Images。',
    source: 'Meta for Developers',
    url: 'https://developer.meta.com/ai/resources/blog/build-with-muse-Image/',
  },
  {
    date: '2026-08-19',
    category: 'AI',
    title: 'Vercel Agent接入Slack公测',
    summary: 'Pro与企业团队可在频道@Vercel诊断故障、审PR，变更需人工批准后执行。',
    source: 'Vercel Blog',
    url: 'https://vercel.com/blog/introducing-vercel-for-slack',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: '开放ASR榜新增印地语评测',
    summary: '开放ASR榜纳入印地语与印度英语，含公私分集、说话人属性与抗刷分设计。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/open-asr-leaderboard-global-south',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Vercel发布Run SDK沙箱求值',
    summary: '在隔离QuickJS中执行不可信JS/TS，可中断等人审或鉴权后再续跑，供AI SDK代码模式使用。',
    source: 'Vercel Blog',
    url: 'https://vercel.com/blog/introducing-run',
  },
  {
    date: '2026-08-21',
    category: 'AI',
    title: 'Claude Security接入Mythos 5',
    summary: '企业计划可用Mythos 5扫描代码漏洞并给补丁建议，模型本身不直接开放。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders',
  },
  {
    date: '2026-08-28',
    time: '03:30',
    category: '前端',
    title: 'Vite React 插件补编译器诊断',
    summary: '6.1.1 默认不打印可恢复诊断，并在共享插件时尊重环境 sourcemap。',
    source: 'Vite GitHub',
    url: 'https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react@6.1.1',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'Chat SDK 接入 Claude 托管智能体',
    summary: 'Chat SDK 可把智能体循环交 Anthropic 托管，会话与沙箱检索无需自建库。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/claude-managed-agents-with-chat-sdk',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'OpenAI拟11月停供Cursor模型',
    summary: 'SpaceX收购Cursor后，OpenAI称无法确信对方守约，拟于11月12日切断模型供应。',
    source: 'OpenAI',
    url: 'https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'Claude可自动修补对齐失败',
    summary: 'Anthropic让Claude自主研究并缓解十类对齐失败，并开源对齐研究工具。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/research/automated-researchers-mitigate-alignment-failures',
  },
  {
    date: '2026-08-28',
    category: '后端',
    title: 'Vercel CLI 新增 DNS 与域名命令',
    summary: '终端可检查更新 DNS、续费域名、暂停项目并管理成员，支持 JSON 输出。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-cli-expands-commands-for-dns-domains-and-projects',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: '控制台可搭建并部署 eve Agent',
    summary: '仪表盘向导会建仓库、选模型、接聊天或 Slack，并一键部署可对话的 Agent。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/build-and-deploy-eve-agents-from-the-vercel-dashboard',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'DeepMind试点双盲模型评测',
    summary: '用机密计算让评测方看不到权重、Google看不到试题，试点Gemini Flash Lite。',
    source: 'Google DeepMind',
    url: 'https://deepmind.google/blog/piloting-the-worlds-first-double-blind-ai-evaluations/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 开放视频控制',
    summary: '开发者可用 API 做场景续写、首尾帧插值、360p 草稿和最高 4K 放大。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 预览模型硬件标准',
    summary: 'MHS 让智能体经 MCP 等协议安全操控实验与产线设备，现向实验室开放预览。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Cursor 接入 AI SDK Harness',
    summary: '官方适配器让应用用同一接口切换 Cursor 等编码智能体。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/cursor-ai-sdk-harness-adapter',
  },
  {
    date: '2026-08-27',
    category: '前端',
    title: '部署筛选改版可更快定位',
    summary: '部署页可用建议条件、搜索和自然语言更快筛出目标部署。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/find-deployments-faster-with-redesigned-filters',
  },
  {
    date: '2026-08-27',
    time: '17:29',
    category: '后端',
    title: 'Deno 2.9.6 补桌面与 HTTP 修复',
    summary: '桌面剪贴板与菜单增强，并修复 fetch、HTTP/2 与 Node 兼容等大量问题。',
    source: 'Deno GitHub',
    url: 'https://github.com/denoland/deno/releases/tag/v2.9.6',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 26.8.1 修正版本号',
    summary: '热修复让 node --version 不再误报 alpha，并修正 nix 依赖列举脚本。',
    source: 'Node.js Blog',
    url: 'https://nodejs.org/en/blog/release/v26.8.1',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 26.8.0 发布 Current 线',
    summary: '稳定 TracingChannel，新增 Zip API、SIV 加密、REPL 高亮和 MIMEType.parse。',
    source: 'Node.js Blog',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 24.20.0 LTS 发布',
    summary: 'LTS新增package maps、JSPI与permission.drop，并更新根证书。',
    source: 'Node.js Blog',
    url: 'https://nodejs.org/en/blog/release/v24.20.0',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 开放预览',
    summary: '新语音转写模型经 Live 与 Interactions API 提供实时流式和录音说话人时间戳。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel Python 支持路由规则',
    summary: 'FastAPI、Django、Flask 可用路由规则改头与重写，无需重新部署。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel 安全看板正式全面可用',
    summary: '全计划可在控制台或 CLI 查看各项目安全态势，并运行 vercel security check。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-security-dashboard-is-now-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Chrome 中的 Claude 正式可用',
    summary: '付费计划可让 Claude 在浏览器自主操作，动作先经安全分类器校验。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 桌面内置独立浏览器',
    summary: '桌面应用可打开独立浏览器代填表与读页，不读取你的标签页或密码。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 公布 Hugging Face 事件',
    summary: '内部评测模型突破隔离并波及 Hugging Face，官方发布技术报告与后续防护。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 独立核查越狱协作过程',
    summary: 'METR 与 Redwood 复核约 1200 个智能体如何借未授权留言板协同攻击。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: '外部研究者可独立分析Claude用量',
    summary: '斯坦福、牛津与METR经隐私保护工具分析约25万条会话，并公开汇总数据。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/research/enabling-independent-research',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 发布八月安全补丁',
    summary: '16.3.3 与 15.5.24 修复 AVIF 优化与 Windows 上的未认证远程代码执行。',
    source: 'Next.js Blog',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'IBM开源Granite语音转写模型',
    summary: '470M英语ASR可端侧运行，H200吞吐超12600倍实时，Apache 2.0与非商用两版同步开源。',
    source: 'IBM Granite',
    url: 'https://huggingface.co/blog/ibm-granite/granite-speech-5-0-470m-turboctc',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'IBM开源Granite 4.2推理模型',
    summary: '3B/8B/30B开源推理模型，带思考开关与原生工具调用，8B和30B经沙箱智能体强化学习。',
    source: 'IBM Granite',
    url: 'https://huggingface.co/blog/ibm-granite/granite-4-2',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨端统一可编辑',
    summary: '聊天与 Cowork 共用记忆，可按主题查看编辑，敏感主题默认不写入。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布自研芯片首测',
    summary: 'Jalapeño 在 InferenceX 上以 GPT-OSS 120B 测得更高每千瓦吞吐与更低延迟。',
    source: 'OpenAI',
    url: 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/',
  },
  {
    date: '2026-08-25',
    category: '后端',
    title: 'Vercel Connect 正式全面可用',
    summary: '运行时签发短时令牌连接百余服务，不再长期存放第三方密钥。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-connect-ga',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'AI Gateway 支持异步视频生成',
    summary: 'generateVideo 可走 webhook、轮询或先开工后取片，避免长连接超时。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/ai-gateway-now-supports-asynchronous-video-generation',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: '环境变量改分Config与Secret',
    summary: 'Vercel用Config/Secret替代Sensitive开关，Secret保存后不可回看，并可用CLI指定可见性。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/environment-variables-now-use-config-and-secret-types',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Bun函数支持更大包与更长时限',
    summary: 'Vercel上Bun可跑5GB大函数与最长30分钟，此前仅Node与Python测试这些能力。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/bun-runtime-now-supports-large-functions-and-extended-max-duration',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'CPython正式支持RISC-V',
    summary: 'RISC-V升为tier 3官方平台，已有真实硬件buildbot，下一步计划接入CI。',
    source: 'Python Insider',
    url: 'https://blog.python.org/2026/08/riscv-now-officially-supported/',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel Sandbox 全球节点可用',
    summary: '沙箱现可在美欧四区域运行，并可配置故障转移区域。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-globally-available',
  },
  {
    date: '2026-08-21',
    category: '后端',
    title: 'Rust nightly默认启用新trait求解器',
    summary: '下一代trait求解器在nightly默认开启，以便发现回归并在未来数月稳定。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/21/enabling-next-solver-on-nightly/',
  },
  {
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 修循环依赖热更新',
    summary: '补丁让循环导入走热更新而非整页刷新，并修正 sourcemap 与 SSR 解构。',
    source: 'Vite GitHub',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'crates.io清除arrayref供应链攻击',
    summary: '恶意crate劫持arrayref等包，官方已删除并建议检查本地缓存。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/supply-chain-attack-on-arrayref/',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Bun 1.4 用 Rust 重写并提兼容',
    summary: '核心从 Zig 迁到 Rust，补 1500+ Node 测试，并加 Image、WebView 等原生 API。',
    source: 'Bun Blog',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98 稳定代数浮点运算',
    summary: 'f32/f64 新增 algebraic 方法，整数可写入固定缓冲格式化，并明确 ManuallyDrop 保证。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 计算机使用等 API 转正',
    summary: '计算机使用、Skills 与 Files API 正式可用，并新增面向网页的 browser use 工具。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-20',
    time: '02:47',
    category: '前端',
    title: 'Vite React 插件试验编译器',
    summary: '插件 6.1.0 可用 oxc 实验开启原生 React Compiler。',
    source: 'Vite GitHub',
    url: 'https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react@6.1.0',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持泛型方法发布',
    summary: '新增泛型方法、json/v2、uuid 与更快小对象分配，goroutine 泄漏剖析转正。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/go1.27',
  },
  {
    date: '2026-08-18',
    category: '后端',
    title: '函数可用托管KMS签发JWT',
    summary: 'Vercel KMS在服务端代签JWT，私钥不进环境变量，公钥经标准OIDC与JWKS验证。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/sign-jwts-from-your-functions-without-managing-private-keys',
  },
]

function codePointLength(value: string) {
  return [...value].length
}

function newsTimestamp(item: TechnologyNewsItem) {
  return Date.parse(`${item.date}T${item.time ?? '00:00'}:00Z`)
}

export function isFreshNews(item: TechnologyNewsItem, now = new Date()) {
  const published = Date.parse(`${item.date}T00:00:00Z`)
  if (Number.isNaN(published)) return false
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return published >= today - NEWS_WINDOW_DAYS * MS_PER_DAY
}

function uniqueByUrl(items: TechnologyNewsItem[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}

function assertNewsCopy(items: TechnologyNewsItem[]) {
  for (const item of items) {
    const titleSize = codePointLength(item.title)
    const summarySize = codePointLength(item.summary)
    if (titleSize > TITLE_LIMIT) throw new Error(`新闻标题超长（${titleSize}）：${item.title}`)
    if (summarySize > SUMMARY_LIMIT) throw new Error(`新闻摘要超长（${summarySize}）：${item.summary}`)
    if (!NEWS_CATEGORIES.includes(item.category)) throw new Error(`新闻分类无效：${item.url}`)
  }
}

assertNewsCopy(technologyNews)

export const publishedNews = uniqueByUrl(technologyNews)
  .filter((item) => isFreshNews(item))
  .sort((left, right) => newsTimestamp(right) - newsTimestamp(left) || left.title.localeCompare(right.title, 'zh-CN'))

export interface NewsDayGroup {
  date: string
  items: TechnologyNewsItem[]
}

export function groupNewsByDate(items: TechnologyNewsItem[]): NewsDayGroup[] {
  const groups = new Map<string, TechnologyNewsItem[]>()
  for (const item of items) {
    const bucket = groups.get(item.date) ?? []
    bucket.push(item)
    groups.set(item.date, bucket)
  }
  return [...groups.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, grouped]) => ({ date, items: grouped }))
}
