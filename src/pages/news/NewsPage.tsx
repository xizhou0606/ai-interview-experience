import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { groupNewsByDate, publishedNews, type NewsCategory } from '../../data/technology-news'

const FILTERS = ['全部', '前端', '后端', 'AI'] as const
type NewsFilter = (typeof FILTERS)[number]

const BADGE_CLASS: Record<NewsCategory, string> = {
  前端: 'news-badge-frontend',
  后端: 'news-badge-backend',
  AI: 'news-badge-ai',
}

function formatStamp(date: string, time?: string) {
  return time ? `${date} ${time} UTC` : date
}

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const items = useMemo(() => {
    const fresh = publishedNews()
    return filter === '全部' ? fresh : fresh.filter((item) => item.category === filter)
  }, [filter])
  const groups = useMemo(() => groupNewsByDate(items), [items])
  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECHNOLOGY NEWS"
        title="近两周可核验的技术新闻"
        description="只收录有一手链接的前端、后端与 AI 发布。条目按日期分组，过期约 14 天后自动撤下；营销稿和无法核验的传闻不会出现在这里。"
        stats={[[String(items.length), filter === '全部' ? '条在窗新闻' : `${filter} 条目`], [String(groups.length), '个日期'], ['14', '天保留窗口']]}
      />
      <div className="filter-row">
        {FILTERS.map((label) => (
          <button key={label} type="button" className={filter === label ? 'active' : ''} onClick={() => setFilter(label)}>{label}</button>
        ))}
      </div>
      <div className="news-feed">
        {groups.map((group, index) => (
          <section className="news-day" id={`section-${index}`} key={group.date}>
            <div className="news-day-head"><time dateTime={group.date}>{group.date}</time><em>{group.items.length} 条</em></div>
            {group.items.map((item) => (
              <article className="news-item" key={item.url}>
                <div className="news-item-top">
                  <span className={`news-badge ${BADGE_CLASS[item.category]}`}>{item.category}</span>
                  <time dateTime={item.time ? `${item.date}T${item.time}:00Z` : item.date}>{formatStamp(item.date, item.time)}</time>
                </div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <a href={item.url} target="_blank" rel="noreferrer">{item.source}<ExternalLink size={14} /></a>
              </article>
            ))}
          </section>
        ))}
        {groups.length === 0 && <p className="news-empty">这个分类在近 14 天没有可核验条目。</p>}
      </div>
    </DocsShell>
  )
}
