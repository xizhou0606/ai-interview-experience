import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { NEWS_CATEGORIES, NEWS_WINDOW_DAYS, groupNewsByDate, publishedNews, type NewsCategory } from '../../data/technology-news'

type NewsFilter = '全部' | NewsCategory

const FILTERS: NewsFilter[] = ['全部', ...NEWS_CATEGORIES]
const BADGE_CLASS: Record<NewsCategory, string> = {
  前端: 'news-badge news-badge-frontend',
  后端: 'news-badge news-badge-backend',
  AI: 'news-badge news-badge-ai',
}

function formatStamp(date: string, time?: string) {
  return time ? `${date} ${time}` : date
}

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const visible = useMemo(() => filter === '全部' ? publishedNews : publishedNews.filter((item) => item.category === filter), [filter])
  const groups = useMemo(() => groupNewsByDate(visible), [visible])
  const counts = useMemo(() => ({
    前端: publishedNews.filter((item) => item.category === '前端').length,
    后端: publishedNews.filter((item) => item.category === '后端').length,
    AI: publishedNews.filter((item) => item.category === 'AI').length,
  }), [])

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECH NEWS"
        title="近两周前端、后端与 AI 技术新闻"
        description="只收录可核验的一手来源。按日分组，标题和摘要尽量一眼看完；条目会按规范链接去重，并只保留约两周窗口。"
        stats={[[String(publishedNews.length), '条新闻'], [String(groupNewsByDate(publishedNews).length), '个日期'], [String(NEWS_WINDOW_DAYS), '天窗口']]}
      />
      <div className="filter-row" role="tablist" aria-label="新闻分类">
        {FILTERS.map((item) => (
          <button key={item} type="button" className={filter === item ? 'active' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>
            {item}{item === '全部' ? ` ${publishedNews.length}` : ` ${counts[item]}`}
          </button>
        ))}
      </div>
      {groups.map((group, index) => (
        <section className="news-day" key={group.date} id={`section-${index}`}>
          <div className="news-day-head"><span>{group.date}</span><em>{group.items.length} 条</em></div>
          <div className="news-list">
            {group.items.map((item) => (
              <article className="news-item" key={item.url}>
                <div className="news-item-meta">
                  <time dateTime={item.time ? `${item.date}T${item.time}:00Z` : item.date}>{formatStamp(item.date, item.time)}</time>
                  <span className={BADGE_CLASS[item.category]}>{item.category}</span>
                </div>
                <h3>{item.title}</h3>
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
      {groups.length === 0 && <p className="news-empty">这个分类在近两周窗口里还没有条目。</p>}
    </DocsShell>
  )
}
