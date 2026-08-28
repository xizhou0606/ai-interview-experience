import { AlertTriangle, ArrowRight, BookOpenCheck, Boxes, MessageSquareQuote, ShieldCheck } from 'lucide-react'

const mcpChoices = [
  ['第一次连接 Server', 'initialize', '协商协议版本、双方能力和客户端/服务端身份；任何其他请求都应在它成功后发生。'],
  ['告诉 Server 握手完成', 'notifications/initialized', '这是没有 id、无需响应的通知，表示 Host 已接受 initialize 结果。'],
  ['让模型看见可用能力', 'tools/list', '读取工具名、说明和 inputSchema；Host 应再做白名单过滤，而不是全部暴露。'],
  ['真正执行一个工具', 'tools/call', '传入 name 与 arguments；写操作需要授权、确认、幂等和审计。'],
  ['工具目录会动态变化', 'notifications/tools/list_changed', 'Server 通知 Host 重新 tools/list，Host 再更新模型可见工具集合。'],
]

const serverExample = `// server.mjs —— 只依赖 Node.js 20+
import { createServer } from 'node:http'

const TOKEN = process.env.MCP_TOKEN ?? 'dev-secret'
const tools = [{
  name: 'echo',
  description: '原样返回一段文字（只读示例）',
  inputSchema: {
    type: 'object',
    properties: { text: { type: 'string', minLength: 1 } },
    required: ['text'],
    additionalProperties: false,
  },
}]

function result(id, value) {
  return { jsonrpc: '2.0', id, result: value }
}

createServer(async (request, response) => {
  if (request.method !== 'POST' || request.url !== '/mcp') {
    response.writeHead(404).end()
    return
  }
  if (request.headers.authorization !== \`Bearer \${TOKEN}\`) {
    response.writeHead(401, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'unauthorized_host' }))
    return
  }

  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  const message = JSON.parse(Buffer.concat(chunks).toString('utf8'))

  // notification 没有 id，也不能返回 JSON-RPC result。
  if (message.method === 'notifications/initialized') {
    response.writeHead(202).end()
    return
  }

  let reply
  if (message.method === 'initialize') {
    reply = result(message.id, {
      protocolVersion: '2025-11-25',
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: 'learning-server', version: '1.0.0' },
    })
  } else if (message.method === 'tools/list') {
    reply = result(message.id, { tools })
  } else if (message.method === 'tools/call') {
    const { name, arguments: input } = message.params ?? {}
    if (name !== 'echo' || typeof input?.text !== 'string' || !input.text) {
      reply = {
        jsonrpc: '2.0', id: message.id,
        error: { code: -32602, message: 'Invalid echo arguments' },
      }
    } else {
      reply = result(message.id, {
        content: [{ type: 'text', text: input.text }],
        isError: false,
      })
    }
  } else {
    reply = {
      jsonrpc: '2.0', id: message.id,
      error: { code: -32601, message: 'Method not found' },
    }
  }

  response.writeHead(200, { 'content-type': 'application/json' })
  response.end(JSON.stringify(reply))
}).listen(3001, () => console.log('MCP Server: http://127.0.0.1:3001/mcp'))`

const hostExample = `// host.mjs —— Host 持有凭证、决定哪些工具允许被调用
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const endpoint = 'http://127.0.0.1:3001/mcp'
const token = process.env.MCP_TOKEN ?? 'dev-secret'
let requestId = 0

async function rpc(method, params) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      'mcp-protocol-version': '2025-11-25',
      authorization: \`Bearer \${token}\`,
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++requestId, method, params }),
    signal: AbortSignal.timeout(5_000),
  })
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`)
  const message = await response.json()
  if (message.error) throw new Error(message.error.message)
  return message.result
}

async function notify(method, params) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      'mcp-protocol-version': '2025-11-25',
      authorization: \`Bearer \${token}\`,
    },
    body: JSON.stringify({ jsonrpc: '2.0', method, params }),
    signal: AbortSignal.timeout(5_000),
  })
  if (!response.ok) throw new Error(\`Notification failed: \${response.status}\`)
}

const initialized = await rpc('initialize', {
  protocolVersion: '2025-11-25',
  capabilities: {},
  clientInfo: { name: 'learning-host', version: '1.0.0' },
})
console.log('1. initialize:', initialized.serverInfo)

await notify('notifications/initialized')
console.log('2. initialized notification sent')

const listed = await rpc('tools/list')
const allowedTools = listed.tools.filter(tool => tool.name === 'echo')
console.log('3. Host allow-list:', allowedTools.map(tool => tool.name))

const terminal = createInterface({ input, output })
const text = await terminal.question('输入要交给 echo 工具的文字：')
terminal.close()

if (!allowedTools.some(tool => tool.name === 'echo')) {
  throw new Error('Host did not authorize echo')
}
const called = await rpc('tools/call', { name: 'echo', arguments: { text } })
console.log('4. tools/call:', called.content[0].text)

// 终端一：MCP_TOKEN=dev-secret node server.mjs
// 终端二：MCP_TOKEN=dev-secret node host.mjs`

export function McpQuickstart() {
  return (
    <section className="mcp-quickstart ai-sdk-quickstart" aria-label="MCP 初学者快速入门">
      <div className="mcp-quickstart-heading ai-sdk-quickstart-heading">
        <div><span>START HERE</span><h3>先理解 Host 的授权边界，再学习 MCP 的每一个方法</h3><p><strong>一句话心智模型：</strong>MCP 是 AI 应用连接外部能力的 JSON-RPC 协议；Host 负责信任、授权和用户体验，Client 负责协议通信，Server 只暴露经过 schema 描述的工具、资源和提示。</p></div>
        <div className="mcp-install ai-sdk-install"><ShieldCheck size={16} /><span>最小环境</span><code>Node.js 20+ · 两个终端 · 无第三方依赖</code></div>
      </div>

      <div className="mcp-mental-model ai-sdk-mental-model" aria-label="MCP 五步运行链路">
        {['Host 选择 Server', 'initialize 协商', 'initialized 确认', 'tools/list 发现', 'tools/call 执行'].map((item, index, all) => <div key={item}><span>{index + 1}</span><strong>{item}</strong>{index < all.length - 1 && <ArrowRight size={15} />}</div>)}
      </div>

      <div className="mcp-choice-guide ai-sdk-choice-guide">
        <div className="mcp-guide-title ai-sdk-guide-title"><Boxes size={17} /><div><strong>遇到需求时，先这样选择核心方法</strong><p>请求有 id、必须收到结果；notification 没有 id，也不能要求 Server 回结果。</p></div></div>
        <div>{mcpChoices.map(([need, api, scene]) => <article key={api}><span>{need}</span><code>{api}</code><p>{scene}</p></article>)}</div>
      </div>

      <div className="mcp-full-example ai-sdk-full-example">
        <div><BookOpenCheck size={17} /><strong>完整可交互案例</strong><p>把两段代码分别保存为 server.mjs 和 host.mjs，再按代码末尾命令启动。你会亲手看到 initialize → initialized → tools/list → tools/call；Bearer Token 始终由 Host 持有。</p></div>
        <div className="mcp-code-grid ai-sdk-code-grid"><article><span>受保护的 server.mjs</span><pre><code>{serverExample}</code></pre></article><article><span>交互式 host.mjs</span><pre><code>{hostExample}</code></pre></article></div>
      </div>

      <div className="mcp-interview-memory ai-sdk-interview-memory"><MessageSquareQuote size={18} /><div><strong>面试 60 秒记忆句</strong><p>“MCP 不是 Agent 框架，而是 Host、Client、Server 之间的能力协议。连接先用 initialize 协商版本和 capabilities，再由 initialized 通知确认；Host 通过 tools/list 发现 schema 化工具，通过 tools/call 执行。真正的安全边界始终在 Host：它必须认证 Server、过滤工具、校验参数，并在人类确认后才允许高风险副作用。”</p></div></div>

      <div className="mcp-production-risks"><AlertTriangle size={18} /><div><strong>生产环境必须防住这些风险</strong><ul><li>不要把未知 Server 返回的全部工具直接交给模型；按租户、用户和会话做 allow-list。</li><li>Host 身份与用户身份要分别鉴权，工具内部仍要做资源级授权，schema 校验不等于权限校验。</li><li>写操作使用幂等键、超时、审计和人工确认；不能因模型重试而重复扣款、发信或删除。</li><li>限制远程 URL、响应大小和执行时间，防止 SSRF、提示注入、恶意输出与资源耗尽。</li></ul></div></div>
    </section>
  )
}
