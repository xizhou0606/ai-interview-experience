import { useMemo, useState } from 'react'
import { ExternalLink, Newspaper } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { groupNewsByDate, publishedNews, type NewsCategory } from '../../data/technology-news'

const FILTERS = ['全部', '前端', '后端', 'AI'] as const
type NewsFilter = (typeof FILTERS)[number]

const BADGE_CLASS: Record<NewsCategory, string> = {
  前端: 'news-badge news-badge-frontend',
  后端: 'news-badge news-badge-backend',
  AI: 'news-badge news-badge-ai',
}

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const items = useMemo(() => publishedNews(), [])
  const visible = filter === '全部' ? items : items.filter((item) => item.category === filter)
  const groups = groupNewsByDate(visible)
  const counts = {
    全部: items.length,
    前端: items.filter((item) => item.category === '前端').length,
    后端: items.filter((item) => item.category === '后端').length,
    AI: items.filter((item) => item.category === 'AI').length,
  }

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECHNOLOGY NEWS"
        title="近两周可核验的前端、后端与 AI 动态"
        description="只收录官方博客、发布说明和 GitHub Release 等一手来源。按日分组、按链接去重，过期条目不再展示。"
        stats={[[String(items.length), '在窗条目'], [String(counts.前端), '前端'], [String(counts.后端), '后端'], [String(counts.AI), 'AI']]}
      />
      <div className="filter-row goal-filter">
        {FILTERS.map((name) => (
          <button key={name} className={filter === name ? 'active' : ''} onClick={() => setFilter(name)}>
            {name}
            <em>{counts[name]}</em>
          </button>
        ))}
      </div>
      {groups.length === 0 ? (
        <div className="news-empty" role="status"><Newspaper size={18} /><p>当前筛选没有仍在 14 天窗口内的条目。</p></div>
      ) : groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <h2>{group.date}</h2>
          <div className="news-list">
            {group.items.map((item) => (
              <a className="news-item" key={item.url} href={item.url} target="_blank" rel="noreferrer">
                <div className="news-item-meta">
                  <time dateTime={item.time ? `${item.date}T${item.time}:00Z` : item.date}>{item.time ? `${item.date} ${item.time} UTC` : item.date}</time>
                  <span className={BADGE_CLASS[item.category]}>{item.category}</span>
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="news-item-source">{item.source}<span>{item.url.replace(/^https?:\/\//, '')}</span></span>
                  {item.twitterUrl && <span className="news-item-source">X 原文<span>{item.twitterUrl.replace(/^https?:\/\//, '')}</span></span>}
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
