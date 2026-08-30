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

export const NEWS_WINDOW_DAYS = 14
export const NEWS_CATEGORIES: Array<'全部' | NewsCategory> = ['全部', '前端', '后端', 'AI']

export const TITLE_MAX = 28
export const SUMMARY_MAX = 60

function codePoints(value: string): number {
  return [...value].length
}

export function isFreshNews(item: TechnologyNewsItem, now = new Date()): boolean {
  const cutoff = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - NEWS_WINDOW_DAYS))
  return item.date >= cutoff.toISOString().slice(0, 10)
}

export function publishedNews(items = TECHNOLOGY_NEWS, now = new Date()): TechnologyNewsItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (!isFreshNews(item, now) || seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}

export function groupNewsByDate(items: TechnologyNewsItem[]): NewsDayGroup[] {
  const groups = new Map<string, TechnologyNewsItem[]>()
  for (const item of items) {
    const day = groups.get(item.date) ?? []
    day.push(item)
    groups.set(item.date, day)
  }
  return [...groups.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, dayItems]) => ({
      date,
      items: dayItems.slice().sort((left, right) => (right.time ?? '').localeCompare(left.time ?? '')),
    }))
}

export function newsConstraintErrors(items = TECHNOLOGY_NEWS): string[] {
  const seen = new Set<string>()
  const errors: string[] = []
  for (const item of items) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) errors.push(`${item.url}: 日期必须是 YYYY-MM-DD`)
    if (item.time && !/^\d{2}:\d{2}$/.test(item.time)) errors.push(`${item.url}: 时间必须是 HH:mm`)
    if (codePoints(item.title) > TITLE_MAX) errors.push(`${item.url}: 标题 ${codePoints(item.title)} 字`)
    if (codePoints(item.summary) > SUMMARY_MAX) errors.push(`${item.url}: 摘要 ${codePoints(item.summary)} 字`)
    if (seen.has(item.url)) errors.push(`${item.url}: 重复 URL`)
    seen.add(item.url)
  }
  return errors
}

export const TECHNOLOGY_NEWS: TechnologyNewsItem[] = [
  {
    date: '2026-08-29',
    time: '09:55',
    category: 'AI',
    title: 'Codex 0.151 增强 MCP 与沙箱',
    summary: '稳定版加入可选 MCP 发现宽限期、扩展可改写工具结果，并收紧远程沙箱路径与权限。',
    source: 'OpenAI Codex',
    url: 'https://github.com/openai/codex/releases/tag/rust-v0.151.0',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'OpenAI 推出 Rosalind 科研台',
    summary: 'ChatGPT 内科研预览工作台，把测序分析、结构查看与实验记录连在同一证据链。',
    source: 'OpenAI Developers',
    url: 'https://developers.openai.com/blog/rosalind-workbench',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'OpenAI 说明停供 Cursor 原因',
    summary: 'SpaceX 收购 Cursor 后，OpenAI 官方说明停止向其提供模型的决定与后续安排。',
    source: 'OpenAI',
    url: 'https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'Anthropic：自动研究员可纠偏',
    summary: '对齐研究显示自动研究员能稳定发现并缓解对齐失败，给出可复核实验证据。',
    source: 'Anthropic Research',
    url: 'https://www.anthropic.com/research/automated-researchers-mitigate-alignment-failures',
  },
  {
    date: '2026-08-28',
    category: '后端',
    title: 'Vercel CLI 扩展 DNS 与域名',
    summary: '新增命令可在终端检查与更新 DNS、续期域名、配置项目并管理成员。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-cli-expands-commands-for-dns-domains-and-projects',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: '仪表盘可一键部署 eve 智能体',
    summary: 'Vercel 仪表盘可脚手架、建仓并部署 eve 智能体，支持网关模型、聊天或 Slack。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/build-and-deploy-eve-agents-from-the-vercel-dashboard',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'Chat SDK 接入 Claude 托管体',
    summary: 'Claude 托管智能体在服务端跑循环，Chat SDK 可直接做成带来源的 Slack 研究机器人。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/claude-managed-agents-with-chat-sdk',
  },
  {
    date: '2026-08-28',
    time: '03:30',
    category: '前端',
    title: 'plugin-react 6.1.1 修正诊断',
    summary: '默认可恢复的 Compiler 诊断不再刷屏，并按环境 sourcemap 选项生成映射。',
    source: 'vite-plugin-react',
    url: 'https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react@6.1.1',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: '腾讯开源 Hy4 preview',
    summary: '770B 总参、49B 激活、超 1M 上下文的 MoE 开源预览，面向编程与科研生产力。',
    source: 'Tencent',
    url: 'https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/',
  },
  {
    date: '2026-08-27',
    category: '后端',
    title: 'SonarQube Hunter Agent 正式发布',
    summary: '云端正式可用，用智能体推理查找权限与业务逻辑漏洞，并先验证可利用性。',
    source: 'SonarSource',
    url: 'https://www.sonarsource.com/blog/hunter-agent-detects-logical-flaws/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'DeepMind 试点双盲模型评测',
    summary: '用机密计算让评测方与模型方互不可见，降低基准污染，保护权重与试题。',
    source: 'Google DeepMind',
    url: 'https://deepmind.google/blog/piloting-the-worlds-first-double-blind-ai-evaluations/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 Flash 可续镜',
    summary: '开发者可用 API 做场景续写、首尾帧插值、360p 草稿和最高 4K 放大。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 预览模型硬件标准',
    summary: '向科研与先进制造实验室开放 MHS，规范智能体安全操作实体设备的接口。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'AI SDK Harness 接入 Cursor',
    summary: '官方适配器让 Cursor 走统一 HarnessAgent 接口，可与其他编码智能体互换。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/cursor-ai-sdk-harness-adapter',
  },
  {
    date: '2026-08-27',
    category: '后端',
    title: '部署页过滤器重做',
    summary: 'Vercel 部署列表支持一键建议、即时匹配和自然语言查询，便于快速定位。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/find-deployments-faster-with-redesigned-filters',
  },
  {
    date: '2026-08-27',
    time: '17:29',
    category: '后端',
    title: 'Deno 2.9.6 修复桌面与网络',
    summary: '补强桌面剪贴板与菜单，并修复 fetch、HTTP、N-API 与 npm 解析等多处问题。',
    source: 'Deno',
    url: 'https://github.com/denoland/deno/releases/tag/v2.9.6',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: '开放 ASR 榜新增印地语',
    summary: 'Hugging Face 开放语音识别榜首次纳入全球南方语言，用印地语评测跨语种表现。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/open-asr-leaderboard-global-south',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node 26.8.1 修正版本号',
    summary: '带外发布，修复 --version 误报 alpha 的问题，其余与 26.8.0 一致。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.1',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node 26.8.0 更新根证书',
    summary: 'Current 线更新 NSS 根证书，并加入基准比较分析模式等小幅能力。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node 24.20.0 LTS 增权限接口',
    summary: 'Krypton LTS 为 AsyncLocalStorage 增加 using 作用域，并新增权限丢弃接口。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v24.20.0',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 上线',
    summary: '官方语音转写模型支持实时流式与录音文件，可清理口误并识别多说话人。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Python 项目支持路由规则',
    summary: 'FastAPI、Django、Flask 可在 CDN 设响应头与内部重写，无需重新部署生效。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel 安全仪表盘正式可用',
    summary: '全计划可在控制台或 CLI 查看账户与项目安全态势，并运行同一套检查。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-security-dashboard-is-now-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Claude in Chrome 正式可用',
    summary: '浏览器扩展结束预览，可在网页上下文中操作标签页并完成浏览任务。',
    source: 'Claude',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 内置浏览器',
    summary: 'Claude Cowork 自带浏览能力，智能体可在工作空间内打开页面并核对来源。',
    source: 'Claude',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 公布 HF 事件结论',
    summary: '官方说明评测智能体越权进入 Hugging Face 系统的经过、教训与后续隔离措施。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 发布 HF 事件独立调查',
    summary: '独立审查复盘智能体串通与奖励黑客路径，并对照 OpenAI 的官方技术报告。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Anthropic 试点外部用量研究',
    summary: '向独立研究者开放 Claude 用量洞察，便于在保护隐私前提下研究真实使用。',
    source: 'Anthropic Research',
    url: 'https://www.anthropic.com/research/enabling-independent-research',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 八月安全补丁发布',
    summary: '16.3.3 与 15.5.24 修复两项严重漏洞，官方要求活跃与维护 LTS 立即升级。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆可跨端且可关',
    summary: '记忆在各客户端生效，用户可决定写入内容，并随时查看或关闭记忆。',
    source: 'Claude',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公开 Jalapeño 推理栈',
    summary: '官方介绍丰裕智能背后的全栈，并给出 Jalapeño 首轮推理速度与效率结果。',
    source: 'OpenAI',
    url: 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/',
  },
  {
    date: '2026-08-25',
    category: '后端',
    title: 'Vercel Connect 正式可用',
    summary: '用部署 OIDC 换短期作用域令牌，应用与智能体不必再存长期第三方密钥。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-connect-ga',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'AI Gateway 支持异步视频',
    summary: '视频生成可作后台任务，支持 webhook、状态查询或短轮询三种等待方式。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/ai-gateway-now-supports-asynchronous-video-generation',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Vercel 发布 Run SDK',
    summary: '在应用内安全执行不可信 JS/TS，用宿主函数中断审批，适合智能体评测。',
    source: 'Vercel',
    url: 'https://vercel.com/blog/introducing-run',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Chat SDK 支持 XChat',
    summary: '同一套机器人逻辑可接到 X 加密私信，与 Slack、Discord 等适配器并列。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/chat-sdk-now-supports-xchat',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'IBM 发布 Granite 4.2',
    summary: 'Hugging Face 官方介绍 Granite 4.2 的训练与架构，面向企业开源语言模型。',
    source: 'IBM Granite',
    url: 'https://huggingface.co/blog/ibm-granite/granite-4-2',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Granite Speech 5.0 开源',
    summary: '4.7 亿参 CTC 语音识别，H200 上超 12600 RTFx，提供 Apache 与非商用两版。',
    source: 'IBM Granite',
    url: 'https://huggingface.co/blog/ibm-granite/granite-speech-5-0-470m-turboctc',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: '多向量嵌入微调指南发布',
    summary: 'Sentence Transformers 文档化 ColBERT 类多向量模型的训练与微调流程。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/train-multi-vector-encoder',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Muse Image 开放开发者 API',
    summary: 'Meta Model API 以每图 0.01 美元提供生成、编辑与组合，兼容 OpenAI 图像接口。',
    source: 'Meta',
    url: 'https://developer.meta.com/ai/resources/blog/build-with-muse-Image/',
  },
  {
    date: '2026-08-24',
    time: '04:58',
    category: '前端',
    title: 'create-vite 9.2 支持 nub',
    summary: '脚手架新增 nub 包管理器，并更新 React 插件链接与依赖。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/releases/tag/create-vite@9.2.0',
  },
  {
    date: '2026-08-24',
    category: 'AI',
    title: 'Gradio 工作流部署指南',
    summary: 'Hugging Face 说明如何用 Gradio 把 AI 工作流接线、运行并部署到生产。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/gradio-workflow-guide',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'CPython 正式支持 RISC-V',
    summary: '官方宣布 RISC-V 成为 CPython 正式支持平台，可按稳定端口构建与发布。',
    source: 'Python Insider',
    url: 'https://blog.python.org/2026/08/riscv-now-officially-supported/',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel Sandbox 全球可用',
    summary: '沙箱可在 iad1、sfo1、cle1、cdg1 运行，支持按沙箱选区与故障转移。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-globally-available',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: '环境变量分 Config 与 Secret',
    summary: '控制台与 CLI 新增类型：Config 对授权成员可读，Secret 保存后只写。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/environment-variables-now-use-config-and-secret-types',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Bun 函数支持更大包与时长',
    summary: 'Vercel Functions 的 Bun 运行时包体可达 5GB，最长执行时间延至 30 分钟。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/bun-runtime-now-supports-large-functions-and-extended-max-duration',
  },
  {
    date: '2026-08-21',
    category: 'AI',
    title: 'Claude Mythos 5 面向更多防守方',
    summary: 'Anthropic 把 Mythos 5 的网络安全能力开放给更广泛的防守团队使用。',
    source: 'Claude',
    url: 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders',
  },
  {
    date: '2026-08-21',
    category: '后端',
    title: 'Rust nightly 启用下一代求解器',
    summary: '新一代 trait 求解器可在 nightly 打开，用于提前验证泛型与特征解析。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/21/enabling-next-solver-on-nightly/',
  },
  {
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 发布',
    summary: '稳定补丁发布，细节见官方 CHANGELOG，建议从 8.2.1 线升级。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-20',
    time: '02:47',
    category: '前端',
    title: 'plugin-react 实验性 Compiler',
    summary: '安装 oxc-transform-react 后可用 compiler 选项启用原生 React Compiler。',
    source: 'vite-plugin-react',
    url: 'https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react@6.1.0',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust arrayref 供应链攻击',
    summary: '官方披露 arrayref crate 遭投毒，提醒核查依赖并立即升级或锁定来源。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/supply-chain-attack-on-arrayref/',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Bun 1.4 以 Rust 重写发布',
    summary: '稳定版从 Zig 迁到 Rust，Node 兼容测试大增，并加入 Image、cron 等原生 API。',
    source: 'Bun',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98.0 发布',
    summary: '语言与工具链常规稳定版，含编译器、标准库与 cargo 的一轮修复与改进。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 上线电脑使用与 Skills API',
    summary: '可用电脑操作、Skills API 与 Files API 组合构建可落地的生产智能体。',
    source: 'Claude',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持泛型方法',
    summary: '正式版加入泛型方法、json/v2、原生 UUID，并降低小对象分配开销。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/go1.27',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Vercel Python Queues SDK 测试',
    summary: 'Python SDK 进入测试，可在 Vercel 上以一等公民方式处理后台队列任务。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-python-queues-sdk-is-now-available-in-beta',
  },
  {
    date: '2026-08-19',
    category: 'AI',
    title: 'Vercel Agent 进入 Slack 公测',
    summary: '在频道 @Vercel 即可排查部署与日志，改代码或配置需先批准计划。',
    source: 'Vercel',
    url: 'https://vercel.com/blog/introducing-vercel-for-slack',
  },
  {
    date: '2026-08-18',
    time: '13:46',
    category: 'AI',
    title: 'Sentence Transformers v6 发布',
    summary: '新增 MultiVectorEncoder，支持 ColBERT 类多向量模型训练、推理与解释。',
    source: 'Sentence Transformers',
    url: 'https://github.com/huggingface/sentence-transformers/releases/tag/v6.0.0',
  },
  {
    date: '2026-08-18',
    category: '后端',
    title: '函数可用 KMS 签发 JWT',
    summary: '私钥留在 Vercel KMS，函数用 OIDC 签名 JWT 或字节，校验方只拿公钥。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/sign-jwts-from-your-functions-without-managing-private-keys',
  },
  {
    date: '2026-08-17',
    category: 'AI',
    title: 'Azure 托管 Claude 增五能力',
    summary: 'Foundry 为托管 Claude 加入结构化输出、网页搜索/抓取、MCP 与工具搜索。',
    source: 'Microsoft Foundry',
    url: 'https://devblogs.microsoft.com/foundry/five-new-claude-capabilities-now-available-in-foundry/',
  },
]
