import { useMemo, useState } from 'react'
import { ExternalLink, Newspaper } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { NEWS_CATEGORIES, NEWS_RETENTION_DAYS, groupNewsByDate, publishedNewsItems, type TechnologyNewsCategory } from '../../data/technology-news'

type NewsFilter = '全部' | TechnologyNewsCategory

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const items = useMemo(() => {
    const fresh = publishedNewsItems()
    return filter === '全部' ? fresh : fresh.filter((item) => item.category === filter)
  }, [filter])
  const groups = groupNewsByDate(items)
  const freshCount = publishedNewsItems().length

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECH NEWS"
        title="近两周可核验的技术新闻"
        description="只收录前端、后端与 AI 的一手来源：官方博客、发布说明或 GitHub Release。按日期分组，条目去重后只保留约 14 天。"
        stats={[[String(freshCount), '近两周条目'], [String(NEWS_CATEGORIES.length), '分类'], [String(NEWS_RETENTION_DAYS), '天窗口']]}
      />
      <div className="filter-row">
        {(['全部', ...NEWS_CATEGORIES] as const).map((label) => (
          <button key={label} className={filter === label ? 'active' : ''} onClick={() => setFilter(label)}>{label}</button>
        ))}
      </div>
      {groups.length === 0 ? (
        <div className="news-empty"><Newspaper size={18} /><p>这一分类近两周没有可核验条目。</p></div>
      ) : groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <h2 className="news-day-heading">{group.date}</h2>
          <div className="news-list">
            {group.items.map((item) => (
              <a className="news-item" key={item.url} href={item.url} target="_blank" rel="noreferrer">
                <div>
                  <div className="news-item-meta">
                    <span className={`news-badge news-badge-${item.category}`}>{item.category}</span>
                    <time dateTime={item.time ? `${item.date}T${item.time}` : item.date}>{item.time ? `${item.date} ${item.time}` : item.date}</time>
                  </div>
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
