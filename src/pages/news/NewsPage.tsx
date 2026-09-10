import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { NEWS_CATEGORIES, groupNewsByDate, newsCategoryCounts, publishedTechnologyNews, type NewsCategory } from '../../data/technology-news'

type NewsFilter = '全部' | NewsCategory

function formatNewsWhen(date: string, time?: string) {
  return time ? `${date} ${time}` : date
}

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const counts = newsCategoryCounts()
  const visible = useMemo(() => filter === '全部' ? publishedTechnologyNews : publishedTechnologyNews.filter((item) => item.category === filter), [filter])
  const grouped = useMemo(() => groupNewsByDate(visible), [visible])
  const filters: NewsFilter[] = ['全部', ...NEWS_CATEGORIES]
  return (
    <DocsShell active="news" toc={grouped.map((group) => group.date)}>
      <PageIntro kicker="TECH NEWS" title="近两周可核验的技术新闻" description="只收录前端、后端和 AI 的一手来源：官方博客、发布说明或 GitHub Release。按日期分组，标题和摘要都压到一眼能看完。" stats={[[String(counts.全部), '近两周条目'], [String(counts.前端), '前端'], [String(counts.后端), '后端'], [String(counts.AI), 'AI']]} />
      <div className="filter-row">
        {filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item} {counts[item]}</button>)}
      </div>
      {grouped.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="technology-family-head"><span>{group.date}</span><p>按时间由新到旧排列，来源链接指向规范页面。</p><em>{group.items.length} 条</em></div>
          <div className="news-list">
            {group.items.map((item) => (
              <article className="news-item" key={item.url}>
                <div className="news-item-top">
                  <time dateTime={item.time ? `${item.date}T${item.time}:00Z` : item.date}>{formatNewsWhen(item.date, item.time)}</time>
                  <span className={`news-badge news-badge-${item.category}`}>{item.category}</span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <a href={item.url} target="_blank" rel="noreferrer">{item.source}<ExternalLink size={14} /></a>
              </article>
            ))}
          </div>
        </section>
      ))}
    </DocsShell>
  )
}
