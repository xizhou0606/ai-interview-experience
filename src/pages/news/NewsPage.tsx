import { useMemo, useState } from 'react'
import { ExternalLink, Newspaper } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { groupNewsByDate, NEWS_CATEGORIES, visibleTechnologyNews, type NewsCategory } from '../../data/technology-news'

type NewsFilter = '全部' | NewsCategory

const BADGE_CLASS: Record<NewsCategory, string> = {
  前端: 'news-frontend',
  后端: 'news-backend',
  AI: 'news-ai',
}

function formatStamp(date: string, time?: string) {
  return time ? `${date} ${time} UTC` : date
}

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const items = useMemo(() => visibleTechnologyNews(), [])
  const visible = filter === '全部' ? items : items.filter((item) => item.category === filter)
  const groups = groupNewsByDate(visible)
  const dateCount = new Set(items.map((item) => item.date)).size
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
        title="近两周可核验的技术新闻"
        description="只收录前端、后端和 AI 的一手来源：官方博客、发布说明或 GitHub Release。按日期分组，用规范 URL 去重，超过约 14 天的条目会撤下。"
        stats={[[String(items.length), '在窗条目'], [String(dateCount), '更新日期'], ['14', '天保留窗口']]}
      />
      <div className="filter-row news-filter">
        {(['全部', ...NEWS_CATEGORIES] as const).map((option) => (
          <button key={option} className={filter === option ? 'active' : ''} onClick={() => setFilter(option)}>
            {option} {counts[option]}
          </button>
        ))}
      </div>
      {groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="news-day-head">
            <span className="section-kicker">PUBLISHED</span>
            <h2>{group.date}</h2>
            <em>{group.items.length} 条</em>
          </div>
          <div className="news-list">
            {group.items.map((item) => (
              <article className="news-item" key={item.url}>
                <div className="news-item-meta">
                  <time dateTime={item.time ? `${item.date}T${item.time}:00Z` : item.date}>{formatStamp(item.date, item.time)}</time>
                  <span className={`news-badge ${BADGE_CLASS[item.category]}`}>{item.category}</span>
                </div>
                <h3>{item.title}</h3>
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
      {groups.length === 0 && (
        <div className="news-empty">
          <Newspaper size={18} />
          <div>
            <strong>这个筛选下暂无条目</strong>
            <p>近 14 天只保留带可核验链接的前端、后端与 AI 一手来源。</p>
          </div>
        </div>
      )}
    </DocsShell>
  )
}
