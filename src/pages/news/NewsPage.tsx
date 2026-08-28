import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { NEWS_CATEGORIES, NEWS_WINDOW_DAYS, groupNewsByDate, technologyNews, type NewsCategory } from '../../data/technology-news'

export function NewsPage() {
  const [filter, setFilter] = useState<(typeof NEWS_CATEGORIES)[number]>('全部')
  const allGroups = useMemo(() => groupNewsByDate(technologyNews), [])
  const allItems = allGroups.flatMap((group) => group.items)
  const groups = useMemo(() => {
    const visible = filter === '全部' ? technologyNews : technologyNews.filter((item) => item.category === filter)
    return groupNewsByDate(visible)
  }, [filter])
  const countBy = (category: NewsCategory) => allItems.filter((item) => item.category === category).length

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECHNOLOGY NEWS"
        title="近两周前端、后端与 AI 要闻"
        description="只收录可核验的一手来源：官方博客、发行说明与 GitHub Release。按日期分组，条目去重后保留约 14 天。标题与摘要保持短句，方便扫读。"
        stats={[[String(allItems.length), `近${NEWS_WINDOW_DAYS}天条目`], [String(countBy('前端')), '前端'], [String(countBy('后端')), '后端'], [String(countBy('AI')), 'AI']]}
      />
      <div className="filter-row">
        {NEWS_CATEGORIES.map((category) => (
          <button key={category} type="button" className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{category}</button>
        ))}
      </div>
      {groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="news-day-head"><span>{group.date}</span><em>{group.items.length} 条</em></div>
          <div className="news-list">
            {group.items.map((item) => (
              <article className="news-item" key={item.url}>
                <div className="news-item-top">
                  <span className={`news-badge news-badge-${item.category}`}>{item.category}</span>
                  <time dateTime={item.time ? `${item.date}T${item.time}:00Z` : item.date}>{item.time ? `${item.date} ${item.time} UTC` : item.date}</time>
                </div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <a className="news-item-source" href={item.url} target="_blank" rel="noreferrer">
                  <span>{item.source}</span>
                  <small>{item.url.replace(/^https?:\/\//, '')}</small>
                  <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
      {groups.length === 0 && <div className="news-empty"><strong>这一分类暂无近两周条目</strong><p>换一个分类，或稍后再来查看新的一手来源。</p></div>}
    </DocsShell>
  )
}
