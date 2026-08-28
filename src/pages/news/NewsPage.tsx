import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { groupNewsByDate, listFreshNews, NEWS_CATEGORIES, NEWS_RETENTION_DAYS, type NewsCategory } from '../../data/technology-news'

const BADGE_CLASS: Record<NewsCategory, string> = {
  前端: 'news-badge-frontend',
  后端: 'news-badge-backend',
  AI: 'news-badge-ai',
}

export function NewsPage() {
  const [filter, setFilter] = useState<NewsCategory | '全部'>('全部')
  const fresh = useMemo(() => listFreshNews(), [])
  const visible = filter === '全部' ? fresh : fresh.filter((item) => item.category === filter)
  const grouped = groupNewsByDate(visible)
  const counts = {
    前端: fresh.filter((item) => item.category === '前端').length,
    后端: fresh.filter((item) => item.category === '后端').length,
    AI: fresh.filter((item) => item.category === 'AI').length,
  }

  return (
    <DocsShell active="news" toc={grouped.map((group) => group.date)}>
      <PageIntro
        kicker="TECH NEWS"
        title="按日期阅读前端、后端和 AI 动态"
        description={`只收录能回到一手来源的短讯，按日期从新到旧排列，并去掉大约 ${NEWS_RETENTION_DAYS} 天以前的条目。标题和摘要保持一眼能认出来的长度。`}
        stats={[[String(fresh.length), '近两周条目'], [String(counts.前端), '前端'], [String(counts.后端), '后端'], [String(counts.AI), 'AI']]}
      />
      <div className="filter-row">
        {NEWS_CATEGORIES.map((category) => (
          <button key={category} type="button" className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>
            {category}
          </button>
        ))}
      </div>
      {grouped.length === 0 && <p className="news-empty">这一分类近两周没有可核验的新条目。</p>}
      {grouped.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="news-day-head">
            <span>{group.date}</span>
            <em>{group.items.length} 条</em>
          </div>
          <div className="news-list">
            {group.items.map((item) => (
              <article className="news-item" key={item.url}>
                <div className="news-item-top">
                  <span className={`news-badge ${BADGE_CLASS[item.category]}`}>{item.category}</span>
                  <time dateTime={item.time ? `${item.date}T${item.time}` : item.date}>{item.time ?? item.date}</time>
                </div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.source}
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
