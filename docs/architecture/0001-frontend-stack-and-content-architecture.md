# ADR 0001：前端技术栈与内容架构

- 状态：Accepted
- 核验日期：2026-07-15
- 目标：构建一个从真实项目代码反向提炼的中文 AI 工程学习官网。

## 成功案例预研

| 案例 | 已验证的价值 | 本项目采用的机制 |
| --- | --- | --- |
| [Vercel Academy · AI SDK](https://vercel.com/academy/ai-sdk) | 课程围绕可运行作品递进；每课有进度、前置知识、调试与完成标准 | 首页继续学习、阶段路线、章节进度、动手练习与验收条件 |
| [LangChain Learn](https://docs.langchain.com/oss/python/learn) | Build / Learn / Reference 分层，全局搜索、左侧目录、页内 TOC | 三栏文档结构、按框架/项目/模式交叉入口、⌘K 搜索 |
| [Hugging Face Agents Course](https://huggingface.co/learn/agents-course/en/unit0/introduction) | 同一概念跨多个 Agent 框架讲解，并配挑战与最终项目 | 框架横向比较、真实项目映射、课程练习 |
| [roadmap.sh AI Engineer](https://roadmap.sh/ai-engineer) | 可点击技能依赖与进度跟踪 | 六阶段 AI 工程地图及列表化移动端表达 |
| [Full Stack Deep Learning](https://fullstackdeeplearning.com/) | 覆盖产品完整生命周期，不止模型 API | 测试、评测、观测、安全、性能、部署成为框架页固定章节 |
| [Patterns.dev](https://www.patterns.dev/) | 模式同时讲实现、收益、代价与适用条件 | 独立工程模式库，不把模式写成强制清单 |
| [Diátaxis](https://diataxis.fr/) | Tutorial、How-to、Reference、Explanation 分工明确 | 章节中把学习过程、操作步骤、原理和资料分开 |

## 技术选型

### React 19.2.7 + TypeScript 6

- 用户明确要求 React + TypeScript。
- [React 官方](https://react.dev/learn/scaling-up-with-reducer-and-context)建议把状态逻辑、Context provider 和自定义 Hooks 分离；本站据此将路由、搜索、学习进度和页面渲染放到独立模块。
- 内容结构通过 TypeScript 接口约束。框架缺少实践、误区、运维、安全、练习或来源字段时，编译期即可发现。
- 采用稳定版 React 19.2.7，不使用 canary。

### Vite 7.3.6

- 本站首期是纯静态、内容驱动的学习门户，不需要服务端数据库或认证。
- [Vite 官方说明](https://vite.dev/guide/why.html)其开发期按需服务 ESM、生产期输出优化 bundle；React Router、Storybook、Vitest 等成熟生态也基于 Vite。
- [Vite 生产构建文档](https://vite.dev/guide/build)确认产物可直接部署到静态托管。
- 当前 Node 22.17.0 满足 Vite 的运行要求。
- 预研时 Vite 8.1.3 是最新线，但它的 Rolldown macOS ARM 原生 binding 在当前机器上签名校验失败。官方 npm 同时把 7.3.6 标记为 previous 稳定线，且本地 `ai-playlet` 已验证同一 Vite 7.3 系；因此本站固定 7.3.6，等 Vite 8 binding 在目标环境验证通过后再升级。
- 选择 Vite 而非 Next.js，是因为首期没有 SSR、Server Components、动态后端或账户系统。未来出现 SEO 预渲染或服务端内容需求时再通过 ADR 评估迁移，当前不提前引入框架复杂度。

### 原生 CSS 分层 + Lucide React

- 视觉系统只需要一套站点主题，采用 `tokens / base / components / pages / responsive` 五层 CSS，避免引入只为少量组件服务的运行时样式依赖。
- Lucide 提供统一、可访问、可 tree-shake 的 React SVG 图标，采用 2026-07-15 的稳定版 1.23.0。
- 不使用图片作为页面骨架；路线、流程和证据卡由 HTML/CSS 组成，窄屏保持可读。

### 自定义内容模型

- 首期框架内容以 TypeScript 结构化数据存储，而不是引入 MDX/Fumadocs。
- 原因：所有框架页必须强制包含同一套 22 维解释，结构化 schema 比自由 frontmatter 更容易做完整性检查。
- 页面组件只消费 `Technology` 模型；新增技术不复制页面。
- 内容规模超过约 50 个长篇章节后，可再评估 MDX 与静态全文索引；届时保持当前模型作为元数据和验证层。

## 模块边界

```text
src/
├── app/                         # 组合根、路由与全局导航定义
├── components/                  # 无业务状态的复用展示组件
│   ├── brand/
│   ├── cards/
│   ├── docs/
│   └── layout/
├── features/                    # 有独立交互状态的能力
│   ├── progress/
│   └── search/
├── pages/                       # 每个路由独立目录
│   ├── home/components/         # 首页私有组件继续细分
│   ├── technology/components/   # 文章私有组件继续细分
│   └── ...
├── data/                        # 技术、项目、模式与证据模型
└── styles/                      # token、基础、组件、页面、响应式分层
```

依赖方向：`app → pages → features/components → data`。页面私有组件不放入全局 `components`；共享组件不反向依赖页面。

## 明确不做

- 不在首期加入登录、数据库、CMS、排行榜或 Ask AI。
- 不把本地绝对路径、密钥或长段项目源码写入页面。
- 不宣称规划中的能力已经实现。
- 不自动把滚动到底视为完成；进度由用户明确确认。
