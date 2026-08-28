import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { groupNewsByDate, NEWS_CATEGORIES, TECHNOLOGY_NEWS, type NewsCategory, type TechnologyNewsItem } from '../../data/technology-news'

type NewsFilter = '全部' | NewsCategory

function formatStamp(item: TechnologyNewsItem) {
  return item.time ? `${item.date} ${item.time}` : item.date
}

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const groups = useMemo(() => {
    const all = groupNewsByDate(TECHNOLOGY_NEWS)
    if (filter === '全部') return all
    return all
      .map((group) => ({ ...group, items: group.items.filter((item) => item.category === filter) }))
      .filter((group) => group.items.length > 0)
  }, [filter])
  const visibleCount = groups.reduce((sum, group) => sum + group.items.length, 0)
  const stats: Array<[string, string]> = [
    [String(visibleCount), '可见条目'],
    [String(groups.length), '更新日期'],
    ['3', '固定分类'],
  ]

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro kicker="TECHNOLOGY NEWS" title="近两周可核验的技术新闻" description="只收录前端、后端和 AI 的一手来源：官方博客、发布说明与 GitHub Release。条目按日分组，重复链接不会再写一遍。" stats={stats} />
      <div className="filter-row" role="tablist" aria-label="按分类筛选技术新闻">
        {(['全部', ...NEWS_CATEGORIES] as const).map((label) => (
          <button key={label} type="button" className={filter === label ? 'active' : ''} onClick={() => setFilter(label)}>{label}</button>
        ))}
      </div>
      {groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="news-day-head"><h2>{group.date}</h2><small>{group.items.length} 条</small></div>
          {group.items.map((item) => (
            <a className="news-item" href={item.url} key={item.url} target="_blank" rel="noreferrer">
              <div className="news-meta"><time dateTime={item.time ? `${item.date}T${item.time}:00Z` : item.date}>{formatStamp(item)}</time><span className={`news-badge news-badge-${item.category}`}>{item.category}</span></div>
              <div><h3>{item.title}</h3><p>{item.summary}</p><small className="news-source">{item.source}</small></div>
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          ))}
        </section>
      ))}
      {groups.length === 0 && <p className="news-empty">这个分类最近 14 天没有可核验条目。</p>}
    </DocsShell>
  )
}
