import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { NEWS_CATEGORIES, groupNewsByDate, visibleNewsItems, type NewsCategory } from '../../data/technology-news'

type NewsFilter = '全部' | NewsCategory

function formatStamp(date: string, time?: string) {
  return time ? `${date} ${time}` : date
}

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const items = useMemo(() => {
    const fresh = visibleNewsItems()
    return filter === '全部' ? fresh : fresh.filter((item) => item.category === filter)
  }, [filter])
  const groups = useMemo(() => groupNewsByDate(items), [items])
  const counts = useMemo(() => {
    const fresh = visibleNewsItems()
    return {
      all: fresh.length,
      前端: fresh.filter((item) => item.category === '前端').length,
      后端: fresh.filter((item) => item.category === '后端').length,
      AI: fresh.filter((item) => item.category === 'AI').length,
    }
  }, [])

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECHNOLOGY NEWS"
        title="近期前端、后端与 AI 技术新闻"
        description="按日归档可核验的一手来源。条目保持短标题与一行摘要，优先官方博客、发布说明和 GitHub Release，不收录传闻与营销稿。"
        stats={[[String(counts.all), '近两周条目'], [String(counts.前端), '前端'], [String(counts.后端), '后端'], [String(counts.AI), 'AI']]}
      />
      <div className="filter-row">
        <button className={filter === '全部' ? 'active' : ''} onClick={() => setFilter('全部')}>全部</button>
        {NEWS_CATEGORIES.map((category) => (
          <button key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{category}</button>
        ))}
      </div>
      {groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="news-day-head"><span>{group.date}</span><em>{group.items.length} 条</em></div>
          <div className="news-list">
            {group.items.map((item) => (
              <article key={item.url} className="news-item">
                <div className="news-item-meta">
                  <time dateTime={item.time ? `${item.date}T${item.time}` : item.date}>{formatStamp(item.date, item.time)}</time>
                  <span className={`news-badge news-badge-${item.category}`}>{item.category}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <a href={item.url} target="_blank" rel="noreferrer">
                  <span>{item.source}</span>
                  <small>{item.url}</small>
                  <ExternalLink size={15} />
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
      {groups.length === 0 && <p className="news-empty">这一分类近两周没有可核验条目。</p>}
    </DocsShell>
  )
}
