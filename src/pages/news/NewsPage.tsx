import { useMemo, useState } from 'react'
import { ExternalLink, Newspaper } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { groupNewsByDate, publishedNews, type NewsCategory } from '../../data/technology-news'

const FILTERS = ['全部', '前端', '后端', 'AI'] as const

export function NewsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('全部')
  const items = useMemo(() => publishedNews(), [])
  const visible = filter === '全部' ? items : items.filter((item) => item.category === filter)
  const groups = groupNewsByDate(visible)
  const counts = {
    全部: items.length,
    前端: items.filter((item) => item.category === '前端').length,
    后端: items.filter((item) => item.category === '后端').length,
    AI: items.filter((item) => item.category === 'AI').length,
  } satisfies Record<(typeof FILTERS)[number], number>

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECHNOLOGY NEWS"
        title="近两周可核验的技术新闻"
        description="只收录前端、后端与 AI 的一手来源：官方博客、发布说明或 GitHub Release。按日期分组，条目去重后保留约 14 天。"
        stats={[[String(items.length), '在窗条目'], [String(groups.length || 0), '更新日期'], ['14 天', '保留窗口']]}
      />
      <div className="filter-row news-filter">
        {FILTERS.map((label) => (
          <button key={label} className={filter === label ? 'active' : ''} onClick={() => setFilter(label)}>
            {label} {counts[label]}
          </button>
        ))}
      </div>
      {groups.length === 0 ? (
        <div className="news-empty">
          <Newspaper size={22} />
          <strong>当前窗口没有可展示条目</strong>
          <p>没有通过一手来源核验的新闻时，这里会保持空白，而不是用二手转述填满。</p>
        </div>
      ) : groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="news-day-head">
            <h2>{group.date}</h2>
            <em>{group.items.length} 条</em>
          </div>
          <div className="news-list">
            {group.items.map((item) => (
              <a className="news-card" key={item.url} href={item.url} target="_blank" rel="noreferrer">
                <span className={`news-badge news-badge-${item.category as NewsCategory}`}>{item.category}</span>
                <div>
                  <small>{item.time ? `${item.date} ${item.time}` : item.date}</small>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="news-source">{item.source}</span>
                </div>
                <ExternalLink size={16} />
              </a>
            ))}
          </div>
        </section>
      ))}
    </DocsShell>
  )
}
