import { ArrowRight, BookOpenCheck, Boxes, MessageSquareQuote, PackageCheck } from 'lucide-react'

const apiChoices = [
  ['一次拿完整答案', 'generateText', '后台摘要、分类、抽取或下一步必须等待完整结果'],
  ['边生成边显示', 'streamText', '聊天、长文、工具状态和需要停止按钮的界面'],
  ['得到可靠对象', 'Output.object', '评分、表单、工作流参数和任何要继续被程序处理的结果'],
  ['让模型调用能力', 'tool / ToolLoopAgent', '查数据库、调用业务 API 或执行多步任务'],
  ['做语义检索', 'embed / embedMany / rerank', 'RAG 入库、查询向量和候选文档精排'],
  ['连接 React 聊天', 'useChat', '管理消息、流式状态、停止、重试和工具卡片'],
]

const serverExample = `import { convertToModelMessages, streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const result = streamText({
    model: openai(process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'),
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}`

const clientExample = `'use client'
import { useChat } from '@ai-sdk/react'
import { useState } from 'react'

export function Chat() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, stop } = useChat()

  return <form onSubmit={(event) => {
    event.preventDefault()
    if (!input.trim()) return
    sendMessage({ text: input })
    setInput('')
  }}>
    {messages.map(message => message.parts.map((part, index) =>
      part.type === 'text' ? <p key={index}>{part.text}</p> : null
    ))}
    <input value={input} onChange={event => setInput(event.target.value)} />
    <button>{status === 'streaming' ? '生成中…' : '发送'}</button>
    {status === 'streaming' && <button type="button" onClick={stop}>停止</button>}
  </form>
}`

export function AiSdkQuickstart() {
  return (
    <section className="ai-sdk-quickstart" aria-label="AI SDK 初学者快速入门">
      <div className="ai-sdk-quickstart-heading">
        <div><span>START HERE</span><h3>先跑通一条完整链路，再逐个学习 56 个 API</h3><p>下面所有 API 案例都默认你已经准备好 Provider 模型。第一次学习只要记住：模型负责生成，Tool 提供事实，Output 约束结果，UIMessage 把服务端状态送到 React。</p></div>
        <div className="ai-sdk-install"><PackageCheck size={16} /><span>安装依赖</span><code>pnpm add ai @ai-sdk/react @ai-sdk/openai zod</code></div>
      </div>

      <div className="ai-sdk-mental-model" aria-label="AI SDK 核心链路">
        {['Provider / Model', 'generateText / streamText', 'Tool / Output', 'UIMessage Stream', 'useChat / UI'].map((item, index, all) => <div key={item}><span>{index + 1}</span><strong>{item}</strong>{index < all.length - 1 && <ArrowRight size={15} />}</div>)}
      </div>

      <div className="ai-sdk-choice-guide">
        <div className="ai-sdk-guide-title"><Boxes size={17} /><div><strong>遇到需求时，先这样选 API</strong><p>不要从 56 个名字里盲猜，先按你真正要解决的问题缩小范围。</p></div></div>
        <div>{apiChoices.map(([need, api, scene]) => <article key={api}><span>{need}</span><code>{api}</code><p>{scene}</p></article>)}</div>
      </div>

      <div className="ai-sdk-full-example">
        <div><BookOpenCheck size={17} /><strong>最小全栈案例</strong><p>服务端负责密钥和模型调用，客户端只消费 UIMessage 流。把模型 ID 和 API 路由替换成你的实际配置即可运行。</p></div>
        <div className="ai-sdk-code-grid"><article><span>服务端 route.ts</span><pre><code>{serverExample}</code></pre></article><article><span>客户端 Chat.tsx</span><pre><code>{clientExample}</code></pre></article></div>
      </div>

      <div className="ai-sdk-interview-memory"><MessageSquareQuote size={18} /><div><strong>面试先记这句话</strong><p>“AI SDK 是面向 TypeScript 应用的统一 AI 应用层：它用 Provider 抹平模型差异，用 generate/stream 统一生成，用 Tool 和 Output 建立类型安全边界，再用 UIMessage 协议把文本、工具状态和自定义数据可靠地流到前端。它不负责持久工作流、长期记忆和业务权限。”</p></div></div>
    </section>
  )
}
