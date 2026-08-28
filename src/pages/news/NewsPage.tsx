import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { groupNewsByDate, NEWS_CATEGORIES, NEWS_RETENTION_DAYS, selectPublishedNews, type NewsCategory } from '../../data/technology-news'

const BADGE_CLASS: Record<NewsCategory, string> = {
  前端: 'news-badge-frontend',
  后端: 'news-badge-backend',
  AI: 'news-badge-ai',
}

export function NewsPage() {
  const [category, setCategory] = useState<NewsCategory | '全部'>('全部')
  const published = useMemo(() => selectPublishedNews(), [])
  const groups = useMemo(() => {
    const items = category === '全部' ? published : published.filter((item) => item.category === category)
    return groupNewsByDate(items)
  }, [category, published])
  const visibleCount = groups.reduce((total, group) => total + group.items.length, 0)

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECHNOLOGY NEWS"
        title="近两周可核验的前端、后端与 AI 新闻"
        description="只收录官方博客、发布说明和调查报告。按日倒序，一条链接对应一条新闻，过期条目会从本页消失。"
        stats={[[String(visibleCount), '条在窗口内'], [String(NEWS_RETENTION_DAYS), '天保留期'], [String(NEWS_CATEGORIES.length), '个分类']]}
      />
      <div className="filter-row" role="tablist" aria-label="按分类筛选新闻">
        {(['全部', ...NEWS_CATEGORIES] as const).map((item) => (
          <button key={item} type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>
        ))}
      </div>
      <div className="news-feed">
        {groups.map((group, index) => (
          <section className="news-day" id={`section-${index}`} key={group.date}>
            <div className="news-day-head"><h2>{group.date}</h2><em>{group.items.length} 条</em></div>
            {group.items.map((item) => (
              <a className="news-item" key={item.url} href={item.url} target="_blank" rel="noreferrer">
                <span className={`news-badge ${BADGE_CLASS[item.category]}`}>{item.category}</span>
                <span>
                  <small>{item.time ? `${item.date} ${item.time} UTC` : item.date}</small>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <em>{item.source}</em>
                </span>
                <ExternalLink size={16} />
              </a>
            ))}
          </section>
        ))}
        {groups.length === 0 && <p className="news-empty">这个分类在近 {NEWS_RETENTION_DAYS} 天没有可核验条目。</p>}
      </div>
    </DocsShell>
  )
}
