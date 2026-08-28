import { useMemo, useState } from 'react'
import { ExternalLink, Newspaper } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { NEWS_CATEGORIES, NEWS_RETENTION_DAYS, groupNewsByDate, publishedNews } from '../../data/technology-news'

const FILTERS = ['全部', ...NEWS_CATEGORIES] as const
type NewsFilter = (typeof FILTERS)[number]

function formatTimestamp(date: string, time?: string) {
  return time ? `${date} ${time} UTC` : date
}

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const items = useMemo(() => {
    const fresh = publishedNews()
    return filter === '全部' ? fresh : fresh.filter((entry) => entry.category === filter)
  }, [filter])
  const groups = useMemo(() => groupNewsByDate(items), [items])
  const counts = useMemo(() => {
    const fresh = publishedNews()
    return {
      全部: fresh.length,
      前端: fresh.filter((entry) => entry.category === '前端').length,
      后端: fresh.filter((entry) => entry.category === '后端').length,
      AI: fresh.filter((entry) => entry.category === 'AI').length,
    } satisfies Record<NewsFilter, number>
  }, [])

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="PRIMARY SOURCES · LAST 14 DAYS"
        title="技术新闻，只收录可核验的一手稿"
        description={`按日归档近 ${NEWS_RETENTION_DAYS} 天的前端、后端与 AI 动态。优先官方博客、发布说明和 GitHub Release；营销稿、传闻和没有规范链接的条目不会出现在这里。`}
        stats={[[String(counts.全部), '在窗条目'], [String(groups.length), '日期分组'], [String(counts.前端), '前端'], [String(counts.AI), 'AI']]}
      />
      <div className="filter-row">
        {FILTERS.map((option) => (
          <button key={option} className={filter === option ? 'active' : ''} onClick={() => setFilter(option)}>
            {option} {counts[option]}
          </button>
        ))}
      </div>
      {groups.length === 0 ? (
        <div className="truth-note">
          <Newspaper size={19} />
          <div>
            <strong>当前筛选没有条目</strong>
            <p>试试「全部」，或等下一轮按小时扫描补上新的一手来源。</p>
          </div>
        </div>
      ) : groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="news-day-head">
            <time dateTime={group.date}>{group.date}</time>
            <em>{group.items.length} 条</em>
          </div>
          <div className="news-list">
            {group.items.map((entry) => (
              <article className="news-card" key={entry.url}>
                <div className="news-card-meta">
                  <span className="news-badge" data-category={entry.category}>{entry.category}</span>
                  <time dateTime={entry.time ? `${entry.date}T${entry.time}:00Z` : entry.date}>{formatTimestamp(entry.date, entry.time)}</time>
                </div>
                <h2>{entry.title}</h2>
                <p>{entry.summary}</p>
                <a href={entry.url} target="_blank" rel="noreferrer">
                  {entry.source}
                  <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
    </DocsShell>
  )
}
