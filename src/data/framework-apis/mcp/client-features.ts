import { MCP_SPEC, mcpApi } from './helpers'

const ROOTS = `${MCP_SPEC}/client/roots`
const SAMPLING = `${MCP_SPEC}/client/sampling`
const ELICITATION = `${MCP_SPEC}/client/elicitation`

export const mcpClientFeatureApis = [
  mcpApi({
    name: 'roots/list', group: 'Client Features', kind: 'function', signature: 'roots/list(): ListRootsResult',
    beginner: '这次是服务端反过来问客户端：“你允许我在哪些根目录或文件范围内工作？”返回的是授权边界提示，不是文件内容。',
    whenToUse: '客户端在握手中声明 roots，服务端需要了解当前项目或工作区边界时。',
    example: `{"jsonrpc":"2.0","id":20,"method":"roots/list"}`,
    returns: 'Root 数组，每项包含 file:// URI、可选 name 与 metadata。',
    interview: 'roots 是 host 提供的工作范围，不代表服务端天然拥有操作系统权限；真正读写仍需工具或资源层再次授权。',
    pitfall: '不要返回用户未选择的整个主目录；切换项目后要更新 roots，并防止符号链接逃逸授权根。', officialUrl: ROOTS,
  }),
  mcpApi({
    name: 'sampling/createMessage', group: 'Client Features', kind: 'function', signature: 'sampling/createMessage({ messages, maxTokens, task?, ...options }): CreateMessageResult | CreateTaskResult',
    beginner: 'MCP 服务端本身不一定持有模型密钥，它可以请求客户端 Host 使用自己的模型生成一条消息，形成“服务端请求 Host 推理”的反向调用。',
    whenToUse: '服务端需要模型帮助完成子任务，而且客户端在握手中声明 sampling capability 时。',
    example: `{"jsonrpc":"2.0","id":21,"method":"sampling/createMessage","params":{"messages":[{"role":"user","content":{"type":"text","text":"概括这份报告"}}],"maxTokens":300}}`,
    returns: '普通调用返回 CreateMessageResult；协商了实验性 Tasks 且请求带 task 时，先返回 CreateTaskResult，再用 tasks/get 与 tasks/result 跟踪。',
    interview: 'Host 对模型选择、提示内容和是否批准拥有最终控制权；sampling 不能让 server 偷走用户上下文或绕过成本策略。任务增强是 2025-11-25 的实验性分支。',
    pitfall: '必须让用户检查并批准高敏感请求并限制 maxTokens 与工具能力；includeContext 的 thisServer/allServers 已软弃用，未声明 sampling.context 时不得使用。', officialUrl: SAMPLING,
  }),
  mcpApi({
    name: 'elicitation/create', group: 'Client Features', kind: 'function', signature: 'elicitation/create(FormParams | URLParams): ElicitResult | CreateTaskResult',
    beginner: '服务端缺少必要信息时，可以请求客户端向用户展示表单或受控 URL，而不是在工具参数里猜测答案。',
    whenToUse: '工作流需要用户补充非敏感结构化信息，或需要跳转到外部授权/支付页面时。',
    example: `{"jsonrpc":"2.0","id":22,"method":"elicitation/create","params":{"mode":"form","message":"请选择发布环境","requestedSchema":{"type":"object","properties":{"env":{"type":"string","enum":["staging","production"]}},"required":["env"]}}}`,
    returns: 'ElicitResult，action 为 accept/decline/cancel，接受时带 content；任务增强模式可先返回 task。',
    interview: 'Elicitation 是明确的人机边界：服务端提出需求，Host 决定界面和用户同意；URL 模式还要做域名与回调安全校验。',
    pitfall: '表单模式不应用来索取密码或密钥；requestedSchema 仅允许协议支持的基础结构，URL 模式必须防钓鱼和开放重定向。', officialUrl: ELICITATION,
  }),
]
