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
const MAX_TITLE_CHARS = 28
const MAX_SUMMARY_CHARS = 60

function characterCount(value: string) {
  return [...value].length
}

function utcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function isFreshNews(isoDate: string, now = new Date()) {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return false
  return Date.UTC(year, month - 1, day) >= utcDay(now) - NEWS_WINDOW_DAYS * 24 * 60 * 60 * 1000
}

function assertNewsItem(item: TechnologyNewsItem, seen: Set<string>) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw new Error(`新闻日期格式无效：${item.url}`)
  if (item.time && !/^\d{2}:\d{2}$/.test(item.time)) throw new Error(`新闻时间格式无效：${item.url}`)
  if (!NEWS_CATEGORIES.includes(item.category)) throw new Error(`新闻分类无效：${item.url}`)
  if (characterCount(item.title) > MAX_TITLE_CHARS) throw new Error(`新闻标题超长：${item.title}`)
  if (characterCount(item.summary) > MAX_SUMMARY_CHARS) throw new Error(`新闻摘要超长：${item.title}`)
  if (seen.has(item.url)) throw new Error(`新闻链接重复：${item.url}`)
  seen.add(item.url)
}

export const technologyNews: TechnologyNewsItem[] = [
  { date: '2026-09-10', category: 'AI', title: 'ChatGPT Work 上线 Data 智能体', summary: 'ChatGPT Work 新增 Data 智能体，可连接数仓与 BI，用自然语言生成分析与仪表盘。', source: 'OpenAI', url: 'https://openai.com/index/put-data-to-work/' },
  { date: '2026-09-10', time: '11:20', category: '前端', title: 'Vite 8.3.0 稳定版发布', summary: '优化预加载依赖结算与代理匹配，并修正 CRLF 代码帧与 node_modules 识别。', source: 'GitHub', url: 'https://github.com/vitejs/vite/releases/tag/v8.3.0' },
  { date: '2026-09-10', category: 'AI', title: 'Gradio 工作流复刻 AUTOMATIC1111', summary: '用 73 节点复刻 A1111 十一条流水线，同一画布可作 REST 与 MCP。', source: 'Hugging Face', url: 'https://huggingface.co/blog/gradio-workflow-1111' },
  { date: '2026-09-10', category: '后端', title: '1.1.1.1 支持后量子 DNSSEC', summary: '解析器默认校验 ML-DSA-44 签名，为后量子 DNSSEC 做解析侧准备。', source: 'Cloudflare', url: 'https://blog.cloudflare.com/post-quantum-dnssec-1111/' },
  { date: '2026-09-10', category: '后端', title: 'Vercel Sandbox 覆盖全部区域', summary: '沙箱可在全部 20 个计算区域运行，并支持故障转移与数据驻留配置。', source: 'Vercel', url: 'https://vercel.com/changelog/vercel-sandbox-is-now-available-in-all-regions' },
  { date: '2026-09-09', time: '22:35', category: 'AI', title: 'Codex 0.154 稳定版发布', summary: 'OpenAI 编码智能体发布 0.154.0 稳定版，修复与能力更新见官方 Release。', source: 'GitHub', url: 'https://github.com/openai/codex/releases/tag/rust-v0.154.0' },
  { date: '2026-09-09', time: '16:09', category: '后端', title: 'Node.js 26.8.2 当前版发布', summary: 'Current 线发布 26.8.2，修复与依赖更新见官方发布说明。', source: 'Node.js', url: 'https://nodejs.org/en/blog/release/v26.8.2' },
  { date: '2026-09-09', time: '15:36', category: 'AI', title: 'IBM 发布 Granite 时序模型', summary: 'IBM 开源 Granite Time Series PatchTST-FM-r2，面向预测与异常检测。', source: 'Hugging Face', url: 'https://huggingface.co/blog/ibm-research/ibm-releases-sota-granite-time-series' },
  { date: '2026-09-09', category: 'AI', title: 'Anthropic 评估越狱网络事件', summary: '对评测误连公网导致模型越权的四起事件做对齐分析，并公开关键转录。', source: 'Anthropic', url: 'https://www.anthropic.com/research/alignment-assessment-cybersecurity-incidents' },
  { date: '2026-09-09', category: '前端', title: 'React 19.3 稳定版发布', summary: 'View Transitions 与 Fragment Refs 转正，并新增 browser()。', source: 'React', url: 'https://react.dev/blog/2026/09/09/react-19-3' },
  { date: '2026-09-09', time: '11:55', category: '后端', title: 'Node.js 24.21.0 LTS 发布', summary: 'LTS 线发布 24.21.0，安全与稳定性更新见官方发布说明。', source: 'Node.js', url: 'https://nodejs.org/en/blog/release/v24.21.0' },
  { date: '2026-09-09', category: '后端', title: 'CLI 可读可搜 changelog', summary: 'Vercel CLI 可直接读取并搜索 changelog，无需打开网页对照更新。', source: 'Vercel', url: 'https://vercel.com/changelog/you-can-now-read-and-search-changelogs-from-the-cli' },
  { date: '2026-09-09', category: '后端', title: '生产部署保护改为全计划免费', summary: '所有套餐均可免费为生产部署开启保护，不再绑定付费 Deployment Protection。', source: 'Vercel', url: 'https://vercel.com/changelog/protect-production-deployments-for-free-on-every-plan' },
  { date: '2026-09-09', category: 'AI', title: 'eve 智能体支持持久记忆', summary: 'eve 智能体可跨会话保存记忆，便于连续任务与长期上下文。', source: 'Vercel', url: 'https://vercel.com/changelog/persistent-memory-for-eve-agents' },
  { date: '2026-09-08', time: '21:30', category: '后端', title: '.NET 11 RC1 发布', summary: '微软发布 .NET 11 首个候选版，进入正式发布前的功能冻结验证。', source: 'Microsoft', url: 'https://devblogs.microsoft.com/dotnet/dotnet-11-rc-1/' },
  { date: '2026-09-08', category: 'AI', title: 'Meta 发布个人智能体 Muse', summary: '美国上线个人智能体，在独立 Secure VM 中代办任务，支持应用与 WhatsApp。', source: 'Meta', url: 'https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/' },
  { date: '2026-09-08', category: '后端', title: '源站自动密钥交换上线', summary: '按源站能力优选握手算法，后量子混合密钥优先，减少额外往返。', source: 'Cloudflare', url: 'https://blog.cloudflare.com/automatic-key-exchange-for-origins/' },
  { date: '2026-09-08', category: 'AI', title: 'ChatGPT Images 2.5 上线', summary: '新图像模型提升细节与编辑精度，API 提供 Flare 与 Sunburst 两个档位。', source: 'OpenAI', url: 'https://openai.com/index/introducing-chatgpt-images-2-5/' },
  { date: '2026-09-08', category: 'AI', title: 'OpenAI 公布纳维-斯托克斯证明', summary: '内部系统给出流体方程有限时间奇点证明，并附 Lean 形式化验证。', source: 'OpenAI', url: 'https://openai.com/index/navier-stokes-solution/' },
  { date: '2026-09-08', category: 'AI', title: 'AlphaGenome Atlas 上线', summary: '提供约 90 亿个人类单碱基变异效应预测，供学术研究查询。', source: 'Google DeepMind', url: 'https://deepmind.google/blog/alphagenome-atlas-a-predictive-map-of-every-possible-dna-letter-change-in-the-human-genome/' },
  { date: '2026-09-08', category: '后端', title: '固定费率 CDN 对 Pro 团队 GA', summary: 'Flat Rate CDN 对 Pro 团队正式可用，带宽按固定费率结算。', source: 'Vercel', url: 'https://vercel.com/changelog/flat-rate-cdn-is-now-ga-for-pro-teams' },
  { date: '2026-09-04', category: 'AI', title: 'Claude 形式化费马大定理', summary: 'Claude 在 Lean 中完成费马大定理端到端机器核验证明。', source: 'Anthropic', url: 'https://www.anthropic.com/research/formalizing-fermats-last-theorem' },
  { date: '2026-09-03', category: 'AI', title: 'GPT-6 Astra 正式发布', summary: 'OpenAI 发布迄今最强通用模型 Astra，计算机使用与对齐能力显著提升。', source: 'OpenAI', url: 'https://openai.com/index/gpt-6-astra/' },
  { date: '2026-09-03', category: 'AI', title: 'WeatherNext 3 全球气象模型', summary: 'DeepMind 发布新一代全球天气模型，提升预报精度与极端天气表现。', source: 'Google DeepMind', url: 'https://deepmind.google/blog/introducing-weathernext-3-our-most-advanced-and-accurate-global-weather-ai-model/' },
  { date: '2026-09-03', category: 'AI', title: 'Cursor 云智能体可跑 Vercel 沙箱', summary: 'Cursor Cloud Agents 可在 Vercel Sandbox 中执行，隔离运行云端改码任务。', source: 'Vercel', url: 'https://vercel.com/changelog/run-cursor-cloud-agents-vercel-sandbox' },
  { date: '2026-09-03', category: '后端', title: 'MSTest 4.4 支持原生 AOT', summary: '测试项目可发布为 Native AOT 可执行文件，源码生成在裁剪前登记用例。', source: 'Microsoft', url: 'https://devblogs.microsoft.com/dotnet/mstest-source-generation/' },
  { date: '2026-09-03', category: 'AI', title: 'HF 开源 funes 智能体记忆', summary: '本地索引编码智能体会话，可跨 Claude Code、Codex 等召回，也可同步到自有 Hub 数据集。', source: 'Hugging Face', url: 'https://huggingface.co/blog/funes' },
  { date: '2026-09-02', time: '15:00', category: 'AI', title: 'Gemini 3.8 Flash 与 Cyber 发布', summary: 'Google 发布 3.8 Flash 与面向安全场景的 Flash Cyber，强调速度与成本。', source: 'Google', url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/' },
  { date: '2026-09-02', category: '后端', title: 'Go 1.27 协程泄漏剖析', summary: '官方介绍 goroutine leak profiler，可在生产环境定位通道与同步泄漏。', source: 'Go', url: 'https://go.dev/blog/goroutine-leak-profiles' },
  { date: '2026-09-01', category: 'AI', title: 'Claude Fable 与 Mythos 5.1', summary: 'Anthropic 发布 5.1：编码与研究更强，缓存读更便宜，Mythos 仍限受信访问。', source: 'Anthropic', url: 'https://www.anthropic.com/claude-fable-and-mythos-5-1' },
  { date: '2026-09-01', category: '后端', title: 'Python 3.15.0 rc2 发布', summary: 'CPython 3.15 第二个候选版到达，正式版前的最后一轮修复窗口。', source: 'Python', url: 'https://blog.python.org/2026/09/python-3150-rc2/' },
  { date: '2026-09-01', category: 'AI', title: 'Hugging Face 发布 WebGPU 内核', summary: '推出 200+ 可在浏览器加载的 WebGPU 内核库，并开放 Fleet 众测。', source: 'Hugging Face', url: 'https://huggingface.co/blog/webgpu-kernels' },
  { date: '2026-09-01', time: '17:00', category: 'AI', title: 'Gemini 智能体视频能力', summary: 'DeepMind 让 Gemini 以智能体方式理解并操作视频，支持多步视觉任务。', source: 'Google DeepMind', url: 'https://deepmind.google/blog/introducing-agentic-video-in-gemini/' },
  { date: '2026-09-01', category: '后端', title: 'Vercel 上线 AWS PrivateLink', summary: 'Pro 与 Enterprise 可通过 PrivateLink 私网访问 RDS 等 AWS 服务。', source: 'Vercel', url: 'https://vercel.com/changelog/aws-privatelink-is-now-available-on-pro-and-enterprise' },
  { date: '2026-09-01', category: 'AI', title: 'Google 开源甲烷羽流测绘模型', summary: '与 NASA 发布 MAPL-EMIT，从卫星高光谱数据检测甲烷羽流，并开源模型与数据库。', source: 'Google Research', url: 'https://research.google/blog/mapping-global-methane-emissions-from-space-with-deep-learning/' },
  { date: '2026-08-31', category: 'AI', title: 'fx 接入 AI SDK Harness', summary: 'Vercel 将 fx 接入 AI SDK harness 层，可用同一套适配器跑编码智能体。', source: 'Vercel', url: 'https://vercel.com/changelog/fx-ai-sdk-harness-adapter' },
  { date: '2026-08-31', category: '后端', title: 'Cloudflare 上线自适应机器人检测', summary: '新引擎持续重训机器人评分，用一次性规则提高攻击成本，企业可自动更新模型。', source: 'Cloudflare', url: 'https://blog.cloudflare.com/introducing-adaptive-intelligence/' },
  { date: '2026-08-29', time: '09:55', category: 'AI', title: 'Codex 0.151 稳定版发布', summary: 'OpenAI Codex 发布 rust-v0.151.0，更新见官方 GitHub Release。', source: 'GitHub', url: 'https://github.com/openai/codex/releases/tag/rust-v0.151.0' },
  { date: '2026-08-29', category: '前端', title: 'pnpm 12.1 发布', summary: '12.1 跟进 Rust 重写后的稳定线，修复与性能改进见官方博文。', source: 'pnpm', url: 'https://pnpm.io/blog/releases/12.1' },
  { date: '2026-08-28', category: 'AI', title: 'OpenAI 将停供 Cursor 模型', summary: '因 SpaceX 收购 Cursor，OpenAI 拟于 11 月 12 日终止对其供模。', source: 'OpenAI', url: 'https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/' },
  { date: '2026-08-28', category: '后端', title: 'Vercel CLI 扩展 DNS 与项目管理', summary: 'CLI 新增域名、DNS 与项目相关命令，可在终端完成更多运维操作。', source: 'Vercel', url: 'https://vercel.com/changelog/vercel-cli-expands-commands-for-dns-domains-and-projects' },
  { date: '2026-08-28', category: 'AI', title: '控制台可构建部署 eve 智能体', summary: '可在 Vercel 控制台直接构建并部署 eve 智能体，不必只走本地工作流。', source: 'Vercel', url: 'https://vercel.com/changelog/build-and-deploy-eve-agents-from-the-vercel-dashboard' },
  { date: '2026-08-28', category: 'AI', title: '自动化研究员缓解对齐失败', summary: 'Anthropic 展示自动化研究员可复现并缓解对齐失败，降低人工审计负担。', source: 'Anthropic', url: 'https://www.anthropic.com/research/automated-researchers-mitigate-alignment-failures' },
  { date: '2026-08-28', time: '03:22', category: '前端', title: 'vite-plugin-react 6.1.1 发布', summary: 'React 插件小版本修复，建议与 Vite 8 线一起升级。', source: 'GitHub', url: 'https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react@6.1.1' },
  { date: '2026-08-28', category: 'AI', title: '开放 ASR 榜增加印地语', summary: 'Hugging Face Open ASR 首次纳入全球南方语言印地语评测。', source: 'Hugging Face', url: 'https://huggingface.co/blog/open-asr-leaderboard-global-south' },
  { date: '2026-08-28', category: 'AI', title: 'Chat SDK 可跑 Claude 托管智能体', summary: 'Vercel Chat SDK 支持运行 Claude Managed Agents，把托管智能体接入对话。', source: 'Vercel', url: 'https://vercel.com/changelog/claude-managed-agents-with-chat-sdk' },
  { date: '2026-08-28', category: 'AI', title: 'OpenAI 推出 Rosalind 科研工作台', summary: '在 ChatGPT 中提供生命科学向导任务、结构查看与测序分析预览。', source: 'OpenAI', url: 'https://developers.openai.com/blog/rosalind-workbench' },
  { date: '2026-08-28', time: '08:48', category: 'AI', title: '腾讯开源 Hy4 preview', summary: '腾讯发布并开源 Hy4 preview 模型，官方稿为规范来源。', source: 'Tencent', url: 'https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/' },
  { date: '2026-08-27', category: 'AI', title: 'SonarQube Hunter Agent 正式可用', summary: 'GA 版逻辑缺陷检测智能体可在代码审查中发现业务逻辑漏洞。', source: 'Sonar', url: 'https://www.sonarsource.com/blog/hunter-agent-detects-logical-flaws/' },
  { date: '2026-08-27', time: '16:00', category: 'AI', title: 'Gemini Omni 1.1 Flash 可供开发', summary: 'Google 开放 Omni 1.1 Flash，方便开发者构建实时多模态应用。', source: 'Google', url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/' },
  { date: '2026-08-27', category: 'AI', title: '模型硬件标准研究预览', summary: 'Anthropic 预览 Model Hardware Standard，推动模型与硬件接口可核验。', source: 'Anthropic', url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview' },
  { date: '2026-08-27', category: 'AI', title: 'Cursor 接入 AI SDK Harness', summary: 'Vercel 将 Cursor 纳入 AI SDK harness 层，可用统一适配器评测智能体。', source: 'Vercel', url: 'https://vercel.com/changelog/cursor-ai-sdk-harness-adapter' },
  { date: '2026-08-27', category: '后端', title: '部署筛选器改版更易查找', summary: 'Vercel 重新设计部署筛选，便于在大量预览与生产部署中定位版本。', source: 'Vercel', url: 'https://vercel.com/changelog/find-deployments-faster-with-redesigned-filters' },
  { date: '2026-08-27', time: '15:16', category: '后端', title: 'Deno 2.9.6 发布', summary: 'Deno 发布 2.9.6 补丁，修复与运行时更新见 GitHub Release。', source: 'GitHub', url: 'https://github.com/denoland/deno/releases/tag/v2.9.6' },
  { date: '2026-08-27', time: '14:00', category: 'AI', title: 'DeepMind 试点双盲 AI 评测', summary: 'DeepMind 启动双盲评测试点，减少评测泄漏与评分偏差。', source: 'Google DeepMind', url: 'https://deepmind.google/blog/piloting-the-worlds-first-double-blind-ai-evaluations/' },
]

const seenNewsUrls = new Set<string>()
for (const item of technologyNews) assertNewsItem(item, seenNewsUrls)

function compareNews(left: TechnologyNewsItem, right: TechnologyNewsItem) {
  if (left.date !== right.date) return right.date.localeCompare(left.date)
  return (right.time ?? '').localeCompare(left.time ?? '')
}

export const publishedTechnologyNews = technologyNews.filter((item) => isFreshNews(item.date)).sort(compareNews)

export function newsCategoryCounts(items = publishedTechnologyNews) {
  return {
    全部: items.length,
    前端: items.filter((item) => item.category === '前端').length,
    后端: items.filter((item) => item.category === '后端').length,
    AI: items.filter((item) => item.category === 'AI').length,
  }
}

export function groupNewsByDate(items: TechnologyNewsItem[]) {
  const groups: Array<{ date: string; items: TechnologyNewsItem[] }> = []
  for (const item of items) {
    const current = groups.at(-1)
    if (current?.date === item.date) current.items.push(item)
    else groups.push({ date: item.date, items: [item] })
  }
  return groups
}
