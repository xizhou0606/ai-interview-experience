import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { NEWS_CATEGORIES, NEWS_WINDOW_DAYS, groupNewsByDate, publishedNews, type NewsCategory } from '../../data/technology-news'

const BADGE_CLASS: Record<NewsCategory, string> = {
  前端: 'news-badge news-badge-frontend',
  后端: 'news-badge news-badge-backend',
  AI: 'news-badge news-badge-ai',
}

export function NewsPage() {
  const [filter, setFilter] = useState<(typeof NEWS_CATEGORIES)[number]>('全部')
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
        kicker="PRIMARY SOURCE BRIEFING"
        title="近两周可核验的技术新闻"
        description="只收录前端、后端与 AI 的官方博客、发布说明和 GitHub Release。按日期分组，重复 URL 不写第二次；超过约两周的条目会自动退出。"
        stats={[[String(items.length), '近两周条目'], [String(groups.length), '有新闻的日期'], [String(NEWS_WINDOW_DAYS), '天保留窗口']]}
      />
      <div className="filter-row">
        {NEWS_CATEGORIES.map((category) => (
          <button key={category} type="button" className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>
            {category} · {counts[category]}
          </button>
        ))}
      </div>
      {groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="news-day-head">
            <h2>{group.date}</h2>
            <em>{group.items.length} 条</em>
          </div>
          <div className="news-list">
            {group.items.map((item) => (
              <article key={item.url} className="news-card">
                <div className="news-card-meta">
                  <span className={BADGE_CLASS[item.category]}>{item.category}</span>
                  <time dateTime={item.time ? `${item.date}T${item.time}` : item.date}>
                    {item.date}{item.time ? ` ${item.time}` : ''}
                  </time>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <a className="news-source" href={item.url} target="_blank" rel="noreferrer">
                  {item.source}<ExternalLink size={13} />
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
      {groups.length === 0 && <p className="news-empty">这一分类在近两周没有可核验条目。</p>}
    </DocsShell>
  )
}
