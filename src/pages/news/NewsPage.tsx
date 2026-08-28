import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { NEWS_CATEGORIES, TECHNOLOGY_NEWS, groupNewsByDate, type NewsCategory } from '../../data/technology-news'

const FILTERS = ['全部', ...NEWS_CATEGORIES] as const
const BADGE_CLASS: Record<NewsCategory, string> = { 前端: 'frontend', 后端: 'backend', AI: 'ai' }

export function NewsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('全部')
  const visible = filter === '全部' ? TECHNOLOGY_NEWS : TECHNOLOGY_NEWS.filter((item) => item.category === filter)
  const groups = useMemo(() => groupNewsByDate(visible), [visible])
  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro kicker="TECHNOLOGY NEWS" title="近两周的前端、后端与 AI 新闻" description="只收录可核验的官方或一手来源，按日分组、按规范链接去重。标题与摘要保持一眼可辨，过期条目会在约 14 天后撤下。" stats={[[String(TECHNOLOGY_NEWS.length), '在窗条目'], [String(new Set(TECHNOLOGY_NEWS.map((item) => item.date)).size), '覆盖日期'], [String(NEWS_CATEGORIES.length), '分类']]} />
      <div className="filter-row">{FILTERS.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
      {groups.length === 0 ? <p className="news-empty">这个分类近期没有可核验条目。</p> : groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <h2>{group.date}</h2>
          {group.items.map((item) => (
            <article key={item.url} className="news-item">
              <div className="news-item-meta"><span className={`news-badge news-badge-${BADGE_CLASS[item.category]}`}>{item.category}</span><time dateTime={item.time ? `${item.date}T${item.time}:00Z` : item.date}>{item.time ? `${item.date} ${item.time} UTC` : item.date}</time></div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <a href={item.url} target="_blank" rel="noreferrer">{item.source}<ExternalLink size={14} /></a>
            </article>
          ))}
        </section>
      ))}
    </DocsShell>
  )
}
