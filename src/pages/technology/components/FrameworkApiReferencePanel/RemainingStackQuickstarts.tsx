import { StackQuickstart, type QuickstartConfig } from './StackQuickstarts'

const betterAuthConfig: QuickstartConfig = {
  label: 'Better Auth',
  title: '先分清服务端认证边界、客户端状态与业务授权',
  mentalModel: 'betterAuth 在服务端定义可信认证规则和 HTTP handler，createAuthClient 只负责浏览器调用与响应式 session 状态；每次受保护业务请求仍要由服务端验证 session，再根据角色、组织成员关系或权限规则做 authorization。',
  install: 'pnpm add better-auth',
  flow: ['浏览器提交凭据', 'auth.handler 校验', '数据库保存身份/会话', '安全 Cookie 返回', '服务端验证 + 业务授权'],
  choices: [
    ['创建服务端组合根', 'betterAuth', '配置数据库、secret、trustedOrigins、登录方式、会话策略和插件。'],
    ['挂载认证 HTTP 路由', 'auth.handler', '把标准 Request 交给 Better Auth 并原样转发 Response/Set-Cookie。'],
    ['服务端直调认证能力', 'auth.api', '在 Route Handler、Server Action 或测试中复用同一端点规则。'],
    ['创建浏览器客户端', 'createAuthClient', '获得 signIn、signUp、session hook 和插件扩展的类型安全方法。'],
    ['读取当前会话', 'getSession / auth.api.getSession', '服务端从原始 headers 验证 cookie，客户端得到一次性 session 数据。'],
    ['组织成员实时授权', 'organization.hasPermission / auth.api.hasPermission', '根据当前会话和组织成员关系判断对具体资源能执行什么操作。'],
  ],
  exampleTitle: '最小服务端实例 + React 客户端案例',
  exampleNote: '示例省略数据库适配器和框架路由样板。生产必须配置高熵 BETTER_AUTH_SECRET、准确 baseURL/trustedOrigins，并把 handler 的 Set-Cookie 完整返回。',
  example: `// server/auth.ts
import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  database,
  emailAndPassword: { enabled: true },
  trustedOrigins: ['https://app.example.com'],
})

// 在框架的 /api/auth/* GET/POST 路由中：
export const handleAuth = (request: Request) => auth.handler(request)

// client/auth-client.ts：这里只创建单例，不在模块导入时触发登录
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: 'https://app.example.com',
})

// client/login-form.ts：由表单 submit handler 显式调用
export async function submitLogin(email: string, password: string) {
  const { data, error } = await authClient.signIn.email({ email, password })
  if (error) throw new Error(error.code)
  return data
}

// server/dashboard-route.ts：受保护逻辑重新验证真实请求 headers
export async function getDashboard(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return new Response('Unauthorized', { status: 401 })
  return Response.json({ user: session.user })
}`,
  interview: 'Better Auth 是“认证组合根 + HTTP 端点 + 类型安全客户端”。服务端实例决定凭据、会话、Cookie 和插件规则，客户端只代理调用并驱动 UI；认证证明用户是谁，业务授权还要根据当前会话和资源关系判断能做什么。会话 token 是凭证不是用户资料，敏感操作还应校验 Origin/CSRF、会话新鲜度并记录审计。',
  risks: ['BETTER_AUTH_SECRET 使用高熵密钥并通过密钥系统注入；Cookie 配置 Secure、HttpOnly、SameSite 与正确域。', 'trustedOrigins、OAuth callbackURL 和重定向目标使用精确允许列表，禁止用户控制任意外部地址。', '登录、注册、重置密码、验证码等端点都要限流并避免账号枚举和计时差异。', '前端 useSession 只用于体验；所有受保护 API 都在服务端重新验证 session 和资源级权限。', '密码、session token、OAuth refresh token、验证链接和 WebAuthn 挑战不得进入普通日志。'],
}

const nanobotConfig: QuickstartConfig = {
  label: 'nanobot',
  title: '先理解 Agent Loop，再理解 Session、Memory、Tool 与 Channel',
  mentalModel: 'Nanobot.from_config 一次装配 provider、workspace、tool registry、session、memory 与 MCP；Nanobot.run 执行“读取上下文 → 模型决策 → 工具执行 → 结果回填”的循环，session 保存对话状态，memory 保存可长期召回的事实，channel/gateway 负责把不同聊天入口接入同一运行时。',
  install: 'uv add nanobot-ai',
  flow: ['加载 Config/Provider', '读取 Session + Memory', 'LLM 决策', 'Tool 执行并回填', '保存结果或继续循环'],
  choices: [
    ['创建完整运行时', 'Nanobot.from_config', '从配置装配模型、工作区、工具、会话、记忆和 MCP。'],
    ['等待一轮最终结果', 'Nanobot.run', '后台任务或脚本需要 content、tools_used、usage 与 stop_reason。'],
    ['实时消费过程', 'Nanobot.run_streamed', '聊天 UI 需要文本、工具阶段、完成/失败事件以及取消控制。'],
    ['管理线程状态', 'SessionClient', '导入、读取、导出、清空和删除指定 session_key 的消息历史。'],
    ['扩展受控能力', 'Tool / ToolRegistry', '定义参数 schema、执行实现并注册给模型发现和调用。'],
    ['接入外部聊天入口', 'BaseChannel / gateway', '把 Telegram、Discord 等消息转换成统一 Agent 输入与输出。'],
  ],
  exampleTitle: '最小 Python SDK + 独立用户会话案例',
  exampleNote: '先用 nanobot onboard 或 config.json 配好 provider。示例用 async with 确保 MCP 和后台资源关闭，并使用稳定 session_key 隔离用户。',
  example: `import asyncio
from nanobot import Nanobot

async def main() -> None:
    async with Nanobot.from_config(workspace='/srv/interview-coach') as bot:
        result = await bot.run(
            '请用初学者语言解释 Python 事件循环，并给我一个追问。',
            session_key='user:u-42:interview',
            channel='web',
            chat_id='interview-room-7',
            sender_id='u-42',
        )
        if result.error:
            raise RuntimeError(result.error)
        print(result.content)
        print(result.tools_used, result.usage, result.stop_reason)

asyncio.run(main())`,
  interview: 'nanobot 的核心是一个配置驱动的 Agent runtime：Provider 提供模型协议，Session 保存当前线程消息，Memory 保存长期事实，Tool Registry 暴露受控动作，Agent Loop 在模型与工具之间迭代直到停止，Channel/Gateway 负责外部消息入口。生产系统必须用 session_key 隔离状态，限制迭代、超时与工具权限，并对流式背压、取消和异步资源关闭负责。',
  risks: ['session_key 是状态分区键但不是认证；应用先验证用户，再构造不可伪造的租户/用户会话键。', 'Tool 参数 schema 不替代权限；危险动作在 execute 内重新鉴权、幂等、限流并保存审计。', 'run_streamed 必须消费、cancel 或 aclose，客户端断开时把取消传播到模型、工具和 MCP。', 'Session 与 Memory 分开治理，限制上下文大小、压缩策略、隐私字段和长期保留期限。', 'Provider 请求设置 timeout/retry 和总循环上限；不要把模型错误消息永久写入历史形成失败循环。'],
}

const openAiCompatibleConfig: QuickstartConfig = {
  label: 'AI SDK OpenAI-compatible Provider',
  title: '把兼容协议当适配层，而不是能力完全相同的承诺',
  mentalModel: 'createOpenAICompatible 保存供应商的 baseURL、认证、headers 与兼容开关，并把模型 ID 适配成 AI SDK 的 LanguageModelV3/EmbeddingModelV3/ImageModelV3；真正请求仍由 generateText、streamText、embed 或 generateImage 发起。',
  install: 'pnpm add ai @ai-sdk/openai-compatible',
  flow: ['可信服务端配置', '创建 Provider', '选择模型工厂', 'AI SDK Core 调用', '解析标准结果 + providerMetadata'],
  choices: [
    ['创建兼容 Provider', 'createOpenAICompatible', '集中设置 name、baseURL、apiKey、headers 与兼容能力。'],
    ['选择聊天模型', 'provider(modelId)', '把供应商模型 ID 变成可交给 generateText/streamText 的 LanguageModelV3。'],
    ['选择传统补全模型', 'provider.completionModel', '目标端点明确使用 completions 而非 chat 语义时。'],
    ['选择向量模型', 'provider.embeddingModel', 'RAG 入库和查询需要兼容 embeddings 端点时。'],
    ['选择图像模型', 'provider.imageModel', '供应商实现兼容图像生成端点并已通过参数契约测试时。'],
    ['保留非标准元数据', 'MetadataExtractor', '从完整响应和流式 chunk 提取供应商扩展字段。'],
  ],
  exampleTitle: '最小兼容 Provider + generateText 案例',
  exampleNote: '必须在服务端执行。baseURL 与 modelId 来自可信配置；上线前分别验证流式、工具、结构化输出、usage 和错误语义。',
  example: `import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText } from 'ai'

const provider = createOpenAICompatible({
  name: 'internal-model-gateway',
  baseURL: process.env.AI_BASE_URL!,
  apiKey: process.env.AI_API_KEY,
  includeUsage: true,
})

const { text, usage, providerMetadata, warnings } = await generateText({
  model: provider(process.env.AI_MODEL_ID!),
  prompt: '用一个生活类比解释 RAG。',
})

console.log({ text, usage, providerMetadata, warnings })`,
  interview: 'OpenAI-compatible Provider 是反腐层和工厂：它把不同供应商相似的 HTTP 形状适配成 AI SDK ProviderV3，再由 Core API 统一调用。但协议兼容不等于能力、错误、流事件、usage 或结构化输出语义一致，因此每个开关都要有契约测试，模型 ID 和 baseURL 也必须由服务端允许列表控制。',
  risks: ['baseURL、modelId、headers 和 queryParams 只接受可信配置，避免 SSRF、越权路由和请求头注入。', '工具调用、JSON Schema、流结束事件、usage、图片参数分别做契约测试，不能只测纯文本成功。', '不要在浏览器暴露供应商密钥；多租户 headers 在服务端从已验证身份派生。', 'embedding 模型升级要新建版本化索引，入库和查询必须使用同一模型与向量维度。', 'MetadataExtractor 对敏感字段脱敏并限制流式累计大小，禁止把完整原始响应无界写入日志。'],
}

const openAiSdkConfig: QuickstartConfig = {
  label: 'OpenAI JavaScript SDK',
  title: '优先掌握 Client → Resource → APIPromise/Stream 的三层模型',
  mentalModel: '一个可复用 OpenAI Client 保存认证、超时和重试；responses、files、batches、vectorStores 等 Resource 方法构造 HTTP 请求；普通调用返回可解析的 APIPromise，stream:true 返回异步事件流，列表方法返回可自动翻页的 PagePromise。',
  install: 'pnpm add openai',
  flow: ['复用 OpenAI Client', '调用 Resource 方法', '传入明确参数/超时', '解析 Response 或事件流', '记录 request_id、usage 与错误'],
  choices: [
    ['生成文本或多模态结果', 'responses.create', '当前统一入口，支持文本、图片、文件、工具、状态和流式事件。'],
    ['按 schema 解析结果', 'responses.parse', '使用 SDK helper 把结构化输出校验成类型化对象。'],
    ['消费完整事件流', 'responses.stream', '需要聚合 helper、事件监听或最终 response 的流式场景。'],
    ['读取原始响应信息', 'APIPromise.withResponse', '同时取得解析 data、Web Response 与 request_id。'],
    ['上传模型可用文件', 'files.create', '把受控文件交给 Batch、Responses 或 Vector Store 等后续资源。'],
    ['构建可检索知识库', 'vectorStores.files.uploadAndPoll', '上传文件、关联向量库并等待索引终态。'],
  ],
  exampleTitle: '最小 Responses API + 流式事件案例',
  exampleNote: 'SDK 默认读取 OPENAI_API_KEY。模型名应由服务端配置与评测决定；示例展示普通结果和 SSE 事件流两种消费方式。',
  example: `import OpenAI from 'openai'

const client = new OpenAI({
  timeout: 30_000,
  maxRetries: 2,
})

const { data: response, request_id } = await client.responses
  .create({
    model: process.env.OPENAI_MODEL ?? 'gpt-5.6',
    input: '用初学者能理解的话解释事件循环。',
  })
  .withResponse()

console.log(request_id, response.output_text, response.usage)

const stream = await client.responses.create({
  model: process.env.OPENAI_MODEL ?? 'gpt-5.6',
  input: '再给我三个面试追问。',
  stream: true,
})

for await (const event of stream) {
  if (event.type === 'response.output_text.delta') {
    process.stdout.write(event.delta)
  }
}`,
  interview: 'OpenAI JavaScript SDK 是强类型传输层：Client 统一认证、重试和超时，Resource 对应 API 域，APIPromise 能直接解析数据或暴露原始 Response/request_id，Stream 与 PagePromise 分别提供异步事件和惰性分页。Responses API 是统一生成入口；生产要区分可重试错误、限制流式背压和取消、记录 usage/request_id，并把工具权限与副作用留在业务执行层。',
  risks: ['API Key 只保存在服务端；Client 复用实例，避免每个请求重复创建连接与配置。', '重试只覆盖瞬时故障；认证和参数错误不重试，有副作用操作使用幂等键并考虑超时后的未知状态。', '流式消费处理所有终止/错误事件和 AbortSignal，客户端断开时停止后续生成与转发。', '文件、Batch 和 Vector Store 都是异步资源状态机；检查终态和逐项错误，不能只看 helper Promise resolve。', '记录 request_id、模型、usage、延迟和业务 trace id，但对输入输出、文件和工具参数做隐私脱敏。'],
}

export function BetterAuthQuickstart() { return <StackQuickstart config={betterAuthConfig} /> }
export function NanobotQuickstart() { return <StackQuickstart config={nanobotConfig} /> }
export function OpenAiCompatibleQuickstart() { return <StackQuickstart config={openAiCompatibleConfig} /> }
export function OpenAiJavascriptSdkQuickstart() { return <StackQuickstart config={openAiSdkConfig} /> }
