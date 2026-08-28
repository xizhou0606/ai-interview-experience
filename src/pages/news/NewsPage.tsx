import { useMemo, useState } from 'react'
import { ExternalLink, Newspaper } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { NEWS_CATEGORIES, NEWS_WINDOW_DAYS, groupNewsByDate, technologyNews, type NewsCategory } from '../../data/technology-news'

type NewsFilter = '全部' | NewsCategory

function formatTimestamp(date: string, time?: string) {
  return time ? `${date} ${time} UTC` : date
}

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const visible = useMemo(
    () => (filter === '全部' ? technologyNews : technologyNews.filter((item) => item.category === filter)),
    [filter],
  )
  const groups = useMemo(() => groupNewsByDate(visible), [visible])
  const itemCount = groups.reduce((total, group) => total + group.items.length, 0)

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECHNOLOGY NEWS"
        title="近两周可核验的技术新闻"
        description="按日归档前端、后端与 AI 一手来源。只收录能打开核对的官方博客、发布说明或 GitHub Release，不转载传闻、软文或无法验证的链接。"
        stats={[[String(itemCount), '近两周条目'], [String(NEWS_WINDOW_DAYS), '天滚动窗口'], [String(NEWS_CATEGORIES.length), '分类']]}
      />
      <div className="filter-row">
        <button className={filter === '全部' ? 'active' : ''} onClick={() => setFilter('全部')}>全部</button>
        {NEWS_CATEGORIES.map((category) => (
          <button key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{category}</button>
        ))}
      </div>
      {groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="technology-family-head">
            <span>{group.date}</span>
            <p>当天可核验的官方发布，按条目出现顺序列出。</p>
            <em>{group.items.length} 条</em>
          </div>
          <div className="news-list">
            {group.items.map((item) => (
              <a key={item.url} href={item.url} target="_blank" rel="noreferrer">
                <div className="news-item-top">
                  <span className="news-badge" data-category={item.category}>{item.category}</span>
                  <time dateTime={item.time ? `${item.date}T${item.time}:00Z` : item.date}>{formatTimestamp(item.date, item.time)}</time>
                </div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <span className="news-item-source"><Newspaper size={13} />{item.source}<ExternalLink size={13} /></span>
              </a>
            ))}
          </div>
        </section>
      ))}
      {groups.length === 0 && <div className="empty-search">这一分类近两周没有可核验条目。</div>}
    </DocsShell>
  )
}
