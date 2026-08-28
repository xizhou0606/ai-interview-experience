import { useMemo, useState } from 'react'
import { ExternalLink, Newspaper } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { NEWS_CATEGORIES, groupNewsByDate, publishedNews, type NewsCategory } from '../../data/technology-news'

type NewsFilter = '全部' | NewsCategory

const BADGE_CLASS: Record<NewsCategory, string> = {
  前端: 'news-badge-frontend',
  后端: 'news-badge-backend',
  AI: 'news-badge-ai',
}

function formatTimestamp(date: string, time?: string): string {
  return time ? `${date} ${time}` : date
}

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const items = useMemo(() => publishedNews(), [])
  const visible = filter === '全部' ? items : items.filter((item) => item.category === filter)
  const grouped = groupNewsByDate(visible)
  const counts = NEWS_CATEGORIES.map((category) => [category, items.filter((item) => item.category === category).length] as const)

  return (
    <DocsShell active="news" toc={grouped.map((group) => group.date)}>
      <PageIntro
        kicker="VERIFIED TECH NEWS"
        title="近两周可核验的前端、后端与 AI 新闻"
        description="只收录官方博客、发布说明和 GitHub Release 等一手来源。条目按日分组，标题与摘要保持短句，方便扫读；过期约 14 天的内容会从栏目撤下。"
        stats={[[String(items.length), '在窗新闻'], [String(new Set(items.map((item) => item.date)).size), '更新日期'], ...counts.map(([label, count]) => [String(count), label] as [string, string])]}
      />
      <div className="truth-note"><Newspaper size={19} /><div><strong>来源优先官方原文</strong><p>跳过传闻、营销稿和无法核验的链接。若原始出处是 X/Twitter，会给出原帖地址，但不会登录抓取。</p></div></div>
      <div className="filter-row">
        <button type="button" className={filter === '全部' ? 'active' : ''} onClick={() => setFilter('全部')}>全部</button>
        {NEWS_CATEGORIES.map((category) => <button type="button" key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{category}</button>)}
      </div>
      {grouped.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="news-day-head"><h2>{group.date}</h2><em>{group.items.length} 条</em></div>
          <div className="news-feed">
            {group.items.map((item) => (
              <a className="news-item" key={item.url} href={item.url} target="_blank" rel="noreferrer">
                <div>
                  <div className="news-item-meta">
                    <time dateTime={item.time ? `${item.date}T${item.time}` : item.date}>{formatTimestamp(item.date, item.time)}</time>
                    <span className={`news-badge ${BADGE_CLASS[item.category]}`}>{item.category}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="news-item-source">{item.source}</span>
                </div>
                <ExternalLink size={17} />
              </a>
            ))}
          </div>
        </section>
      ))}
      {grouped.length === 0 && <p className="news-empty">当前筛选没有仍在 14 天窗口内的条目。</p>}
    </DocsShell>
  )
}
