import { AlertTriangle, ArrowRight, BookOpenCheck, Boxes, MessageSquareQuote, PackageCheck } from 'lucide-react'

const langGraphChoices = [
  ['声明全图共享数据', 'StateGraph(State)', '先定义可序列化状态；每个节点只返回自己要更新的字段。'],
  ['增加一个处理步骤', 'add_node', '把普通同步或异步函数注册为节点，节点接收当前 state 并返回 state update。'],
  ['连接固定执行顺序', 'add_edge', '流程始终从 A 到 B 时使用；开始和结束分别连接 START、END。'],
  ['按状态选择下一步', 'add_conditional_edges', '审批、重试、工具分支或质量判断需要动态路由时使用。'],
  ['只关心最终状态', 'invoke / ainvoke', '一次运行结束后再获取结果，适合后台任务和测试。'],
  ['观察每个节点更新', 'stream / astream', '聊天界面、调试或进度展示需要边执行边消费更新时使用。'],
  ['保存并恢复线程', 'compile(checkpointer) + thread_id', '多轮会话、暂停恢复和人工审批必须使用稳定 thread_id 与持久化 checkpointer。'],
]

const pythonExample = `# quickstart.py
# Python 3.11+
# python -m venv .venv && source .venv/bin/activate
# pip install -U langgraph

from typing import TypedDict
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph


class InterviewState(TypedDict, total=False):
    topic: str
    question: str
    answer: str
    feedback: str


def draft_question(state: InterviewState) -> dict:
    topic = state.get("topic", "AI 工程")
    return {"question": f"请用初学者能懂的话解释：{topic} 的核心原理是什么？"}


def review_answer(state: InterviewState) -> dict:
    answer = state.get("answer", "").strip()
    if not answer:
        return {"feedback": "等待回答：先理解问题，再使用同一 thread_id 继续。"}
    has_principle = any(word in answer for word in ("状态", "节点", "边", "流程"))
    return {
        "feedback": (
            "回答已经提到核心组成，可以再补充 checkpoint 与 thread_id。"
            if has_principle
            else "建议按『状态 → 节点 → 边 → 编译 → 执行』重新组织回答。"
        )
    }


builder = StateGraph(InterviewState)
builder.add_node("draft_question", draft_question)
builder.add_node("review_answer", review_answer)
builder.add_edge(START, "draft_question")
builder.add_edge("draft_question", "review_answer")
builder.add_edge("review_answer", END)

# InMemorySaver 只适合本地学习；生产应换数据库 checkpointer。
graph = builder.compile(checkpointer=InMemorySaver())
config = {"configurable": {"thread_id": "learner-001"}}

# 第一次 invoke：写入 topic，并得到完整最终状态。
first = graph.invoke({"topic": "LangGraph"}, config=config)
print("面试题：", first["question"])

# 同一个 thread_id 会从 checkpoint 继续；stream 展示每个节点的 update。
answer = input("你的回答：")
for update in graph.stream(
    {"answer": answer},
    config=config,
    stream_mode="updates",
):
    print("节点更新：", update)

snapshot = graph.get_state(config)
print("checkpoint 中的最终反馈：", snapshot.values["feedback"])
print("下一次运行仍可继续使用 thread_id=learner-001")`

export function LangGraphQuickstart() {
  return (
    <section className="langgraph-quickstart ai-sdk-quickstart" aria-label="LangGraph 初学者快速入门">
      <div className="langgraph-quickstart-heading ai-sdk-quickstart-heading">
        <div><span>START HERE</span><h3>把复杂 Agent 画成“状态如何流过节点”的图</h3><p><strong>一句话心智模型：</strong>LangGraph 是有状态工作流运行时：State 保存全图共享数据，Node 读取状态并返回局部更新，Edge 决定下一步，compile 把定义变成可执行图，checkpointer 让同一 thread_id 可以暂停、恢复和继续。</p></div>
        <div className="langgraph-install ai-sdk-install"><PackageCheck size={16} /><span>安装依赖</span><code>pip install -U langgraph</code></div>
      </div>

      <div className="langgraph-mental-model ai-sdk-mental-model" aria-label="LangGraph 五步运行链路">
        {['定义 State', '添加 Nodes', '连接 Edges', 'compile 图', 'invoke / stream + checkpoint'].map((item, index, all) => <div key={item}><span>{index + 1}</span><strong>{item}</strong>{index < all.length - 1 && <ArrowRight size={15} />}</div>)}
      </div>

      <div className="langgraph-choice-guide ai-sdk-choice-guide">
        <div className="langgraph-guide-title ai-sdk-guide-title"><Boxes size={17} /><div><strong>遇到需求时，先这样选择核心 API</strong><p>先判断你是在“定义图”还是“运行图”；compile 之前修改结构，compile 之后 invoke、stream、读取状态。</p></div></div>
        <div>{langGraphChoices.map(([need, api, scene]) => <article key={api}><span>{need}</span><code>{api}</code><p>{scene}</p></article>)}</div>
      </div>

      <div className="langgraph-full-example ai-sdk-full-example">
        <div><BookOpenCheck size={17} /><strong>完整可交互案例</strong><p>案例不调用任何模型，因此安装后即可运行。第一次 invoke 生成问题，终端输入回答后用同一 thread_id 执行 stream，最后从 checkpoint 读取完整状态。</p></div>
        <div className="langgraph-code-grid ai-sdk-code-grid"><article><span>quickstart.py</span><pre><code>{pythonExample}</code></pre></article></div>
      </div>

      <div className="langgraph-interview-memory ai-sdk-interview-memory"><MessageSquareQuote size={18} /><div><strong>面试 60 秒记忆句</strong><p>“LangGraph 用显式状态图管理长流程：State 是可持久化的数据合同，Node 是纯粹的状态转换，Edge 表示固定或条件控制流；StateGraph compile 后才得到可 invoke/stream 的执行图。加入 checkpointer 与稳定 thread_id 后，流程能跨请求保存检查点、暂停恢复和支持人工审批。它解决控制流与状态一致性，不替代模型、向量库和业务权限。”</p></div></div>

      <div className="langgraph-production-risks"><AlertTriangle size={18} /><div><strong>生产环境必须防住这些风险</strong><ul><li>InMemorySaver 进程重启就丢失，只适合本地；生产使用数据库 checkpointer，并做 schema 版本迁移。</li><li>thread_id 是数据定位键，不是权限凭证；每次读取、恢复和写入都要校验租户与用户归属。</li><li>节点可能因重试或恢复重复执行，发信、扣款等副作用必须幂等，并记录外部操作结果。</li><li>不要无限扩张 state；大文件和长历史存外部存储，只在状态中保存可序列化引用和必要摘要。</li><li>stream 只提供观察方式，不自动保证客户端断线恢复；需要持久事件、取消传播和失败补偿策略。</li></ul></div></div>
    </section>
  )
}
