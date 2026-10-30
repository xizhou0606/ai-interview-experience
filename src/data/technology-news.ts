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
    date: '2026-10-29',
    time: '17:00',
    category: 'AI',
    title: 'OpenAI 更新 Model Spec',
    summary: '新版列出五项核心价值，引导更强模型作出稳妥判断、尊重人类能动性并忠于人类意图。',
    source: 'OpenAI',
    url: 'https://openai.com/index/updated-model-spec',
  },
  {
    date: '2026-10-29',
    time: '14:13',
    category: 'AI',
    title: 'Mistral 开源 Large 4 万亿参数权重',
    summary: 'Le Chonk 权重开放下载、可自托管，官方称性能对标 GLM-5.3、每任务省 47% token。',
    source: 'Mistral AI',
    url: 'https://mistral.ai/news/mistral-large-4-oss/',
  },
  {
    date: '2026-10-29',
    time: '14:05',
    category: '后端',
    title: 'Cisco ASA/FTD VPN 漏洞遭活跃利用',
    summary: 'CVE-2026-76418 评级 8.6，未认证请求可致防火墙重载，官方补丁已发布。',
    source: 'The Hacker News',
    url: 'https://thehackernews.com/2026/10/cisco-patches-actively-exploited-asa.html',
  },
  {
    date: '2026-10-29',
    time: '12:00',
    category: '后端',
    title: 'Cursor 市场现恶意 Claude Code 扩展',
    summary: '2.1.313 版遭篡改植入 SSH 后门，约 5000 用户受影响，官方已下架并给出排查指引。',
    source: 'Cursor',
    url: 'https://cursor.com/blog/claude-code-extension-security-notice',
  },
  {
    date: '2026-10-29',
    time: '09:01',
    category: 'AI',
    title: '豆包工作向企业开放第三方模型接入',
    summary: '豆包工作向企业开放三方模型：首批接入 Kimi 3.1 Pro、GLM 5.3、DeepSeek 等，按用量扣点。',
    source: '雷峰网',
    url: 'https://www.leiphone.com/category/industrynews/bMidAUlVn5zmruyD.html',
  },
  {
    date: '2026-10-29',
    time: '08:24',
    category: '后端',
    title: '黑客利用 Cisco SD-WAN 缺陷植入木马',
    summary: '攻击者利用思科 SD-WAN 缺陷投放恶意软件，试图窃取设备加密密钥。',
    source: 'The Hacker News',
    url: 'https://thehackernews.com/2026/10/hackers-exploited-cisco-sd-wan-flaw-to.html',
  },
  {
    date: '2026-10-29',
    time: '08:07',
    category: '后端',
    title: 'TWCA 披露 RA 服务器未授权访问事件',
    summary: 'TWCA 自报 RA 服务器遭未授权访问，已隔离调查，暂未发现证书错误签发。',
    source: 'Mozilla Bugzilla',
    url: 'https://bugzilla.mozilla.org/show_bug.cgi?id=2086949',
  },
  {
    date: '2026-10-29',
    time: '00:00',
    category: 'AI',
    title: '亚马逊云科技开源决策模型与智能体沙箱',
    summary: '开源 Strands Decider 2B 决策模型与 Strands Box 沙箱，内置 Dogwood 策略语言。',
    source: 'InfoQ',
    url: 'https://www.infoq.cn/article/YmgmEh686wTClmj3PY8o',
  },
  {
    date: '2026-10-28',
    time: '23:45',
    category: '后端',
    title: 'Alpine 披露 GitLab 漏洞遭利用事件',
    summary: 'Alpine 基础设施遭 CVE-2026-97229 尝试利用，已发布事件报告与处置说明。',
    source: 'Alpine Linux',
    url: 'https://alpinelinux.org/posts/GitLab-security-incident-CVE-2026-97229.html',
  },
  {
    date: '2026-10-28',
    time: '21:46',
    category: 'AI',
    title: 'Draw Things 开源 Local Code',
    summary: 'Mac 端本地 AI 智能体应用全量开源，内置模型与 Python，无需外部安装或 API 密钥。',
    source: 'Draw Things',
    url: 'https://releases.drawthings.ai/p/local-code-by-draw-things-open-source',
  },
  {
    date: '2026-10-28',
    time: '19:19',
    category: 'AI',
    title: 'Claude 企业版上线智能报表与用量工具',
    summary: '新增 Smart Reports、调查与共享预算，企业可监控员工 AI 使用情况与开支。',
    source: 'Anthropic',
    url: 'https://claude.com/resources/articles/smart-reports-surveys-pooled-budgets',
  },
  {
    date: '2026-10-28',
    time: '17:44',
    category: 'AI',
    title: 'PyTorch 2.15 发布',
    summary: '重写版 NCCL 成为默认分布式后端并附飞行记录器，torch.distributed 新增 NIXL 传输。',
    source: 'PyTorch',
    url: 'https://pytorch.org/blog/pytorch-2-15-release-blog/',
  },
  {
    date: '2026-10-28',
    time: '17:01',
    category: 'AI',
    title: '谷歌发布 Gemini 4 Carbon 前沿模型',
    summary: '谷歌新一代前沿模型，主打网络安全能力跃升，尚未全面开放使用。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/',
  },
  {
    date: '2026-10-28',
    time: '16:59',
    category: '后端',
    title: 'VS Code 插件市场启用可信发布',
    summary: 'Visual Studio Marketplace 支持 Trusted Publishing，以短期令牌替代长期凭据。',
    source: 'Microsoft',
    url: 'https://devblogs.microsoft.com/blog/trusted-publishing-visual-studio-marketplace/',
  },
  {
    date: '2026-10-28',
    time: '16:07',
    category: 'AI',
    title: 'GitHub Octoverse 2026 报告发布',
    summary: '年度开发者生态报告：提交与推送量创新高，智能体参与开发成主要增长动力。',
    source: 'GitHub',
    url: 'https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/',
  },
  {
    date: '2026-10-28',
    time: '15:30',
    category: 'AI',
    title: 'GitHub 智能体工作流正式发布',
    summary: '用自然语言在仓库中定义自动化智能体工作流，Universe 大会宣布正式可用。',
    source: 'GitHub',
    url: 'https://github.blog/changelog/2026-10-28-github-agentic-workflows-generally-available',
  },
  {
    date: '2026-10-28',
    time: '14:58',
    category: 'AI',
    title: '英伟达开源 Nemotron 3.5 转录模型',
    summary: '多语言语音转写开放权重，支持 40 种语言与多人重叠说话场景，附 Granary v2。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/nvidia/nemotron-transcribe-granary',
  },
  {
    date: '2026-10-28',
    time: '14:53',
    category: 'AI',
    title: '扩散智能开源 Clover-35B 扩散模型',
    summary: '35B 总参 3B 激活 MoE 扩散语言模型开源预览，官方称编码任务中位耗时约为对比方案 47%。',
    source: 'GitHub',
    url: 'https://github.com/DiffuSpace/Clover-35B-A3B-Preview',
  },
  {
    date: '2026-10-28',
    time: '14:16',
    category: '后端',
    title: 'Ubuntu Core Desktop 开发重启',
    summary: 'Canonical 重组团队恢复不可变桌面开发，基于 Core 26 与模块化 Snap，将逐步成为默认桌面。',
    source: 'Canonical',
    url: 'https://discourse.ubuntu.com/t/accelerating-ubuntu-core-desktop/90547',
  },
  {
    date: '2026-10-28',
    time: '11:50',
    category: '后端',
    title: '16 年老 UEFI 缺陷可绕过安全启动',
    summary: 'EDKII PXE 网络启动路径缺陷 CVE-2026-97631，可在 Secure Boot 前执行代码。',
    source: 'The Hacker News',
    url: 'https://thehackernews.com/2026/10/critical-16-year-old-uefi-flaw-can-run.html',
  },
  {
    date: '2026-10-28',
    time: '09:23',
    category: '后端',
    title: 'Veeam 修复备份服务器关键漏洞',
    summary: 'VBR 13.1.2 修复可操纵备份服务器并禁用 MFA 的关键缺陷，官方称暂无在野利用。',
    source: 'Veeam',
    url: 'https://www.veeam.com/kb4948',
  },
  {
    date: '2026-10-28',
    time: '07:00',
    category: '前端',
    title: 'Vercel CI 正式推出',
    summary: 'Vercel 为前端平台补齐原生 CI 能力，与部署流程直接集成。',
    source: 'Vercel',
    url: 'https://vercel.com/blog/introducing-vercel-ci',
  },
  {
    date: '2026-10-28',
    time: '06:20',
    category: '后端',
    title: 'Tailscale 修复 SSH 跨设备提权缺陷',
    summary: '补丁修复两处 SSH 缺陷，被入侵设备可借以获取其他服务器 root 权限。',
    source: 'The Hacker News',
    url: 'https://thehackernews.com/2026/10/tailscale-patches-ssh-flaws-that-could.html',
  },
  {
    date: '2026-10-28',
    time: '04:58',
    category: '后端',
    title: '仅凭逻辑缺陷打通 Edge 全链利用',
    summary: 'Orange Tsai 公开 Pwn2Own 17.5 万美元的 Edge 全链利用，全程仅用逻辑漏洞。',
    source: 'Orange Tsai',
    url: 'https://blog.orange.tw/posts/2026-10-the-last-proof-of-human-craft-browser-full-chain/',
  },
  {
    date: '2026-10-27',
    time: '17:16',
    category: 'AI',
    title: 'Liquid AI 发布 LFM3 多模态模型',
    summary: '面向专用多模态场景的 LFM3 上线 Hugging Face，可按领域微调构建垂直模型。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/LiquidAI/lfm3',
  },
  {
    date: '2026-10-27',
    time: '16:13',
    category: 'AI',
    title: 'DeepMind 发布 Genie 4 世界模拟模型',
    summary: '从文本或图像生成可交互 3D 世界，新增音频与语音，物理与人物更逼真，仍属实验性。',
    source: 'Google DeepMind',
    url: 'https://deepmind.google/blog/genie-4-a-new-generation-of-world-simulation/',
  },
  {
    date: '2026-10-27',
    time: '09:36',
    category: '后端',
    title: 'JetBrains 终端改用 libghostty',
    summary: 'JetBrains IDE 内置终端迁移至 libghostty 终端核心。',
    source: 'JetBrains',
    url: 'https://blog.jetbrains.com/platform/2026/10/jetbrains-terminal-now-uses-ghostty/',
  },
  {
    date: '2026-10-27',
    time: '09:35',
    category: '前端',
    title: 'Firefox 159 发布',
    summary: '新版修复 AMD Linux 显卡内存占用过高问题，含常规安全修复。',
    source: 'Mozilla',
    url: 'https://www.firefox.com/en-US/firefox/159.0/releasenotes/',
  },
  {
    date: '2026-10-26',
    time: '22:01',
    category: 'AI',
    title: 'Cloudflare 修复 GLM-5.3 缓存串扰漏洞',
    summary: 'Workers AI 上 GLM-5.3 出现跨请求 KV 缓存泄露，已联合 SGLang 完成修复。',
    source: 'Cloudflare',
    url: 'https://blog.cloudflare.com/kv-cache-exposure-remediation/',
  },
  {
    date: '2026-10-26',
    time: '18:30',
    category: '前端',
    title: 'Safari 27.2 新特性一览',
    summary: '优化 Customizable Select 等控件，修复 20 处无障碍、媒体及 CSS 缺陷。',
    source: 'WebKit',
    url: 'https://webkit.org/blog/18515/webkit-features-for-safari-27-2/',
  },
  {
    date: '2026-10-26',
    time: '11:52',
    category: '后端',
    title: 'Wasmtime 修复两处沙箱逃逸漏洞',
    summary: '两个高危漏洞可让恶意 WebAssembly 模块逃出沙箱，官方已发安全通告。',
    source: 'The Hacker News',
    url: 'https://thehackernews.com/2026/10/two-critical-wasmtime-flaws-could-let.html',
  },
  {
    date: '2026-10-26',
    time: '00:00',
    category: 'AI',
    title: 'OpenAI 发布 GPT-6.1 Terra',
    summary: 'OpenAI 新一代模型 GPT-6.1 Terra 发布，同步登陆各大托管网关。',
    source: 'OpenAI',
    url: 'https://openai.com/index/introducing-gpt-6-1-terra',
  },
  {
    date: '2026-10-26',
    time: '00:00',
    category: '后端',
    title: 'Go 官方回应 eMudhra 密钥泄露事件',
    summary: '针对 eMudhra 中间证书密钥披露，Go 官方说明对生态的影响与应对。',
    source: 'Go',
    url: 'https://go.dev/blog/emudhra-incident',
  },
  {
    date: '2026-10-26',
    category: '后端',
    title: 'DuckDB 2.0.0 LTS 发布',
    summary: '改进服务器模式并支持异步 I/O 与 SQL 触发器，可识别 AI 代理，LTS 支持至 2027 年 10 月。',
    source: 'DuckDB',
    url: 'https://duckdb.org/2026/10/26/gems-of-duckdb-200',
  },
  {
    date: '2026-10-26',
    category: '后端',
    title: '前 GitHub CEO 推出智能体协作 Git 平台',
    summary: 'Dohmke 创办 Entire：Trail 代理评审、分布式 Git 托管与 Continuous Memory。',
    source: 'Entire',
    url: 'https://entire.com/blog/the-git-forge-for-agent-human-collaboration',
  },
  {
    date: '2026-10-25',
    time: '18:45',
    category: '后端',
    title: '.NET 发布十月带外安全更新',
    summary: '十月带外更新修复多项安全漏洞，覆盖多个受支持版本，建议尽快升级。',
    source: 'Microsoft',
    url: 'https://devblogs.microsoft.com/dotnet/dotnet-october-2026-oob-security-updates/',
  },
  {
    date: '2026-10-25',
    time: '13:27',
    category: '后端',
    title: '微软验证器漏洞可致零权限应用窃取令牌',
    summary: '导出 Activity 使无权限应用冒充微软应用领取工作账号令牌，问题披露后微软已修复。',
    source: 'Enclave',
    url: 'https://enclave.ai/blog/authmask-we-made-microsoft-authenticator-hand-over-tokens',
  },
  {
    date: '2026-10-23',
    time: '17:54',
    category: '后端',
    title: 'Ruby 修复引发 GitLab RCE 的正则缺陷',
    summary: '三个正则引擎缺陷曾导致四个 GitLab 关键 RCE，Ruby 已发布修复版本。',
    source: 'The Hacker News',
    url: 'https://thehackernews.com/2026/10/ruby-fixes-three-regex-engine-bugs.html',
  },
  {
    date: '2026-10-23',
    time: '17:00',
    category: '前端',
    title: 'Safari 27.1 新特性一览',
    summary: 'WebKit 官方盘点 Safari 27.1 带来的 Web 平台新特性与改进。',
    source: 'WebKit',
    url: 'https://webkit.org/blog/18486/webkit-features-for-safari-27-1/',
  },
  {
    date: '2026-10-23',
    time: '12:23',
    category: '后端',
    title: 'OpenSSL 4.1.0 正式发布',
    summary: 'OpenSSL 4.1.0 稳定版发布，包含新特性与修复，已发布至官方仓库。',
    source: 'OpenSSL',
    url: 'https://github.com/openssl/openssl/releases/tag/openssl-4.1.0',
  },
  {
    date: '2026-10-22',
    time: '19:00',
    category: 'AI',
    title: 'OpenAI 推出 Decisions API',
    summary: '新 API 让应用获得更快的结构化决策输出，适用于路由与判定类场景。',
    source: 'OpenAI',
    url: 'https://openai.com/index/decisions-api',
  },
  {
    date: '2026-10-22',
    time: '00:58',
    category: '后端',
    title: 'Bun v1.4.4 发布',
    summary: 'Bun 1.4.4 维护版本发布，包含多项缺陷修复与稳定性改进。',
    source: 'Bun',
    url: 'https://bun.com/blog/bun-v1.4.4',
  },
  {
    date: '2026-10-21',
    time: '23:12',
    category: 'AI',
    title: 'Anthropic 预览 Claude Duet 智能体',
    summary: '面向专业人士的 Claude Duet 开启研究预览，定位智能体协作应用。',
    source: 'Anthropic',
    url: 'https://claude.com/blog/claude-duet',
  },
  {
    date: '2026-10-21',
    time: '15:29',
    category: '后端',
    title: 'OVHcloud CLI 遭投毒窃取开发者密钥',
    summary: '攻击者在 GitHub 上发布带后门的 OVHcloud CLI 版本，窃取开发者凭据。',
    source: 'BleepingComputer',
    url: 'https://www.bleepingcomputer.com/news/security/ovhcloud-cli-releases-backdoored-on-github-to-steal-developer-secrets/',
  },
  {
    date: '2026-10-21',
    time: '12:00',
    category: 'AI',
    title: 'OpenAI 模型将登陆 Google Cloud',
    summary: 'OpenAI 宣布其模型将进入 Google Cloud，双方扩大算力与分发合作。',
    source: 'OpenAI',
    url: 'https://openai.com/index/openai-models-google-cloud',
  },
  {
    date: '2026-10-21',
    time: '08:00',
    category: '后端',
    title: 'Node.js 十月安全更新修复 Brotli RCE',
    summary: '修复 Brotli 解码器 RCE（CVE-2026-111497），Bun、Python 等软件亦受影响。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/vulnerability/october-2026-security-releases',
  },
  {
    date: '2026-10-21',
    category: '后端',
    title: 'PHP 紧急修复 PHP2Shell 双漏洞',
    summary: '两个高危漏洞可致远程代码执行，官方发布带外版本，CISA 已列入已知被利用目录。',
    source: 'PHP',
    url: 'https://www.php.net/archive/2026.php#2026-10-21-5',
  },
  {
    date: '2026-10-20',
    time: '17:53',
    category: '前端',
    title: 'TypeScript 7.1 Beta 发布',
    summary: 'TS 7.1 Beta 发布，原生编译器路线下继续推进 7.x 功能集。',
    source: 'Microsoft',
    url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/',
  },
  {
    date: '2026-10-20',
    time: '13:00',
    category: '前端',
    title: 'Cloudflare 开源 tsrs 编译器移植实验',
    summary: 'Cloudflare 推出 TypeScript 到 Rust 的移植实验 tsrs，探索编译器性能上限。',
    source: 'Cloudflare',
    url: 'https://blog.cloudflare.com/typescript-rust-port/',
  },
  {
    date: '2026-10-20',
    time: '12:00',
    category: 'AI',
    title: 'Cursor 推出 Agent SDK',
    summary: '将 Cursor 智能体开放为可编程接口，供第三方应用嵌入自动化编码能力。',
    source: 'Cursor',
    url: 'https://cursor.com/blog/agent-sdk',
  },
  {
    date: '2026-10-19',
    time: '10:21',
    category: '后端',
    title: 'Python 3.15.0 正式发布',
    summary: 'Python 3.15.0 发布，发布经理博文同步上线，安装包与生态随之更新。',
    source: 'Hugo van Kemenade',
    url: 'https://hugovk.dev/blog/2026/releasing-python-3-15-0/',
  },
  {
    date: '2026-10-19',
    time: '07:01',
    category: '后端',
    title: 'DocumentDB 1.0 正式发布',
    summary: 'MongoDB 兼容的开源 DocumentDB 发布 1.0，可托管于自有基础设施。',
    source: 'DocumentDB',
    url: 'https://documentdb.io/blogs/posts/documentdb-1-0/',
  },
  {
    date: '2026-10-16',
    time: '20:20',
    category: '后端',
    title: 'Deno 将由 Cloudflare 维护一年后停止开发',
    summary: 'Cloudflare 收购 Deno 后运行时仅再维护一年即停更，Dahl 团队转岗开发 Workers。',
    source: 'The Register',
    url: 'https://www.theregister.com/devops/2026/10/16/nodejs-creator-ditches-deno-to-work-on-open-source-cloudflare-workers/5303662',
  },
  {
    date: '2026-10-16',
    time: '15:29',
    category: '前端',
    title: 'Expo SDK 58 发布，内置 RN 0.88',
    summary: '新增 Siri 智能入口、面向智能体的 agent-cli、SPM 构建与 Rust 转换器提速。',
    source: 'Expo',
    url: 'https://expo.dev/changelog/sdk-58',
  },
  {
    date: '2026-10-16',
    time: '14:02',
    category: 'AI',
    title: 'Meta 新商业条款授权抓取站点训练 AI',
    summary: '10 月 30 日生效的商业条款含爬虫与测试凭据授权，专家称或凌驾 robots.txt，Meta 称无变化。',
    source: 'Nieman Lab',
    url: 'https://www.niemanlab.org/2026/10/metas-new-commercial-terms-will-allow-the-scraping-of-news-sites-legal-experts-say/',
  },
  {
    date: '2026-10-16',
    time: '14:00',
    category: '后端',
    title: 'GitHub 许可证合规检查正式发布',
    summary: '企业规则集在 PR 中强制校验依赖许可证，需启用 Code Security，GHEC 可用。',
    source: 'GitHub',
    url: 'https://github.blog/changelog/2026-10-16-open-source-license-compliance-generally-available',
  },
  {
    date: '2026-10-16',
    time: '13:00',
    category: '后端',
    title: 'Cloudflare 为认证爬虫引入持续问责机制',
    summary: '衡量爬虫对站点偏好与 robots.txt 的遵守程度并给出可解释信任带，评分后续在 Radar 公开。',
    source: 'Cloudflare',
    url: 'https://blog.cloudflare.com/verified-bots-accountability/',
  },
  {
    date: '2026-10-16',
    time: '12:42',
    category: '后端',
    title: 'PyPI 上线邮箱信誉检查并解封 Outlook',
    summary: '注册新增一次性邮箱信誉校验，2024 年 6 月起屏蔽的 Outlook、Hotmail 地址可重新使用。',
    source: 'PyPI',
    url: 'https://blog.pypi.org/posts/2026-10-16-email-reputation-and-outlook/',
  },
  {
    date: '2026-10-16',
    time: '12:07',
    category: '后端',
    title: 'Bitbucket SSH 访问将启用新域名',
    summary: 'Git over SSH 需在 11 月 12 日前改用 ssh.bitbucket.org 新主机名。',
    source: 'Atlassian',
    url: 'https://community.atlassian.com/forums/discussion/3234032/upcoming-change-to-bitbucket-cloud-ssh-access-move-from-bitbucket-org-to-ssh-bitbucket-org',
  },
  {
    date: '2026-10-16',
    time: '10:18',
    category: 'AI',
    title: '腾讯混元开源智能体记忆框架 Hy Memory 2.0',
    summary: '开源专用模型、记忆框架与 MemHub 三层能力，Apache 2.0，官方基准称超 Opus 5。',
    source: 'GitHub',
    url: 'https://github.com/Tencent-Hunyuan/Hy-Memory',
  },
  {
    date: '2026-10-16',
    time: '10:14',
    category: 'AI',
    title: 'OpenAI 披露模型擅用测试钱包资金事件',
    summary: '内部研究模型擅用任务未提供的钱包资金支付 Sepolia 部署，报告 10 月 15 日首发。',
    source: 'OpenAI Alignment',
    url: 'https://alignment.openai.com/misalignment-reports/using-a-funded-test-cryptocurrency-wallet-without-authorization/',
  },
  {
    date: '2026-10-16',
    time: '08:38',
    category: 'AI',
    title: '范式智能开源模域 ModelSphere 部署平台',
    summary: '联合睿思智联开源的 LLM 推理部署平台，Apache 2.0，支持昇腾等国产芯片统一调度。',
    source: 'GitHub',
    url: 'https://github.com/modelsphere/modelsphere',
  },
  {
    date: '2026-10-16',
    time: '07:59',
    category: '前端',
    title: 'Vitest 修复开发服务器敏感文件泄露',
    summary: 'server.fs.deny 被绕过导致 .env、私钥与 .git 被意外返回，官方已发通告。',
    source: 'GitHub Advisory',
    url: 'https://github.com/advisories/GHSA-p458-7748-mcp3',
  },
  {
    date: '2026-10-16',
    time: '06:53',
    category: 'AI',
    title: '印度 CERT-In 通报失控智能体入侵企业系统',
    summary: '受测 AI 智能体越权读取企业生产与个人数据且未被察觉，厂商自查后主动上报；开源智能体攻击工具亦遭滥用。',
    source: 'CERT-In',
    url: 'https://www.cert-in.org.in/s2cMainServlet?VLCODE=CIAD-2026-0049&pageid=PUBVLNOTES02',
  },
  {
    date: '2026-10-16',
    time: '06:18',
    category: '后端',
    title: 'BeyondTrust 修复遭在野利用零日漏洞',
    summary: '远程支持产品认证绕过（CVE-2026-102764），8 月底起遭利用，SaaS 已修复，自托管需手动升级。',
    source: 'BleepingComputer',
    url: 'https://www.bleepingcomputer.com/news/security/beyondtrust-patches-zero-day-exploited-in-attacks-since-august/',
  },
  {
    date: '2026-10-16',
    time: '06:16',
    category: '后端',
    title: 'Lean v4.35.0 搭载已验证内核',
    summary: 'lake check 可用外置内核复检；con-leche 首个以 Lean 写成并证明一致，由 Claude 实现。',
    source: 'Leonardo de Moura',
    url: 'https://leodemoura.github.io/blog/2026-10-15-lean-now-ships-with-verified-kernels/',
  },
  {
    date: '2026-10-16',
    time: '05:50',
    category: 'AI',
    title: 'PrismML 发布 2B/4B/9B 端侧三元模型',
    summary: '基于 Qwen3.5 的三元权重模型，0.43GB 起面向手机 PC 端侧智能体，Apache 2.0 开源。',
    source: 'PrismML',
    url: 'https://prismml.com/news/prismml-expands-bonsai-2-family-with-2b-4b-and-9b-models-for-on-device-ai',
  },
  {
    date: '2026-10-16',
    time: '02:36',
    category: 'AI',
    title: '宝马新世代 iX3 搭载千问座舱大模型',
    summary: '宝马中国创新日宣布与阿里联合开发座舱 AI，以千问为底座，斑马负责车端集成。',
    source: '雷峰网',
    url: 'https://www.leiphone.com/category/industrynews/1zjGZ4srbO3kyVEw.html',
  },
  {
    date: '2026-10-16',
    time: '02:16',
    category: 'AI',
    title: 'Copilot 在 Slack/Teams 支持多仓库',
    summary: '单会话内跨仓库追踪 PR、排查问题，@GitHub 可置于消息任意位置并读取线程上下文。',
    source: 'GitHub Changelog',
    url: 'https://github.blog/changelog/2026-10-15-copilot-in-slack-and-teams-adds-model-and-repository-updates',
  },
  {
    date: '2026-10-16',
    time: '01:35',
    category: 'AI',
    title: '小米开源空间音频理解大模型',
    summary: 'MiDashengLM-Spatial：Apache 2.0 开源权重与推理代码，可感知声源方位与空间分布。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/mispeech/midashenglm-spatial',
  },
  {
    date: '2026-10-16',
    time: '00:22',
    category: 'AI',
    title: '快手可灵 Kling 4.0 全量上线',
    summary: '快手宣布 Kling 4.0 全量上线，能力接入 MCP/CLI，单次生成视频最长 30 秒，企业 API 即将开放。',
    source: 'IT之家',
    url: 'https://www.ithome.com/1/013/715.htm',
  },
  {
    date: '2026-10-16',
    time: '00:00',
    category: '后端',
    title: 'gopls 支持交互式重构',
    summary: 'Go 官方博客介绍 gopls 交互式重构能力，重命名与签名变更可直接预览调整。',
    source: 'Go',
    url: 'https://go.dev/blog/interactive-refactoring',
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
