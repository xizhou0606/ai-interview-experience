import type { ApiParameter } from '../../../../data/apis'

export function ParameterTable({ parameters }: { parameters: ApiParameter[] }) {
  if (parameters.length === 0) return <div className="api-no-params"><strong>无调用参数</strong><p>该 API 从已配置的运行时上下文装配结果。</p></div>
  return (
    <div className="parameter-table" role="table" aria-label="API 参数">
      <div className="parameter-row parameter-head" role="row"><span>参数</span><span>类型</span><span>要求</span><span>说明</span></div>
      {parameters.map((item) => <div className="parameter-row" role="row" key={item.name}><code>{item.name}</code><code>{item.type}</code><span>{item.required ? '必填' : `可选${item.defaultValue ? ` · ${item.defaultValue}` : ''}`}</span><p>{item.description}</p></div>)}
    </div>
  )
}
