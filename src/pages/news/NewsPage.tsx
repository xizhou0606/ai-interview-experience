import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { groupNewsByDate, NEWS_CATEGORIES, technologyNews } from '../../data/technology-news'

const FILTERS = ['全部', ...NEWS_CATEGORIES] as const

function formatTimestamp(date: string, time?: string) {
  return time ? `${date} ${time} UTC` : date
}

export function NewsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('全部')
  const groups = useMemo(() => {
    const scoped = filter === '全部' ? technologyNews : technologyNews.filter((item) => item.category === filter)
    return groupNewsByDate(scoped)
  }, [filter])
  const itemCount = groups.reduce((total, group) => total + group.items.length, 0)

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECH NEWS"
        title="按日收录可核验的前端、后端与 AI 新闻"
        description="只收录官方博客、发布说明和一手调查，按日期倒序排列。条目去重、保留约 14 天，营销稿和没有可点开链接的传闻不会出现在这里。"
        stats={[[String(itemCount), '近 14 天条目'], [String(groups.length), '有新闻的日期'], ['3', '固定分类']]}
      />
      <div className="filter-row">
        {FILTERS.map((item) => (
          <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>
      {groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="news-day-head">
            <span>{group.date}</span>
            <em>{group.items.length} 条</em>
          </div>
          <div className="news-list">
            {group.items.map((item) => (
              <article className="news-card" key={item.url}>
                <div className="news-card-meta">
                  <time dateTime={item.time ? `${item.date}T${item.time}:00Z` : item.date}>{formatTimestamp(item.date, item.time)}</time>
                  <span className={`news-badge news-badge-${item.category}`}>{item.category}</span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <a href={item.url} target="_blank" rel="noreferrer">
                  <span>{item.source}</span>
                  <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
      {groups.length === 0 && <p className="news-empty">该分类近 14 天暂无已核验条目。</p>}
    </DocsShell>
  )
}
