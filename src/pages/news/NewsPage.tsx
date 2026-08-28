import { useMemo, useState } from 'react'
import { ExternalLink, Newspaper } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { groupNewsByDate, NEWS_CATEGORIES, NEWS_RETENTION_DAYS, technologyNews, type NewsCategory } from '../../data/technology-news'

type NewsFilter = '全部' | NewsCategory

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const visible = useMemo(() => (filter === '全部' ? technologyNews : technologyNews.filter((item) => item.category === filter)), [filter])
  const groups = useMemo(() => groupNewsByDate(visible), [visible])
  const counts = useMemo(() => ({
    前端: technologyNews.filter((item) => item.category === '前端').length,
    后端: technologyNews.filter((item) => item.category === '后端').length,
    AI: technologyNews.filter((item) => item.category === 'AI').length,
  }), [])

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECHNOLOGY NEWS"
        title="最近两周的前端、后端与 AI 动态"
        description="只收录可核验的一手来源：官方博客、发布说明与 GitHub Release。按日期分组，约保留 14 天，重复链接不会再写入。"
        stats={[[String(technologyNews.length), '在档条目'], [String(counts.前端), '前端'], [String(counts.后端), '后端'], [String(counts.AI), 'AI']]}
      />
      <div className="truth-note"><Newspaper size={19} /><div><strong>阅读方式</strong><p>每条都有日期、分类徽章、不超过 28 字的标题和一行摘要。点来源打开原文；X/Twitter 仅在它是原始出处时给出链接，且不会登录。</p></div></div>
      <div className="filter-row">
        <button className={filter === '全部' ? 'active' : ''} onClick={() => setFilter('全部')}>全部 {technologyNews.length}</button>
        {NEWS_CATEGORIES.map((category) => <button key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{category} {counts[category]}</button>)}
      </div>
      {groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="news-day-head"><span>{group.date}</span><em>{group.items.length} 条</em></div>
          <div className="news-list">
            {group.items.map((item) => (
              <article key={item.url}>
                <div className="news-item-top"><time dateTime={item.time ? `${item.date}T${item.time}:00Z` : item.date}>{item.time ? `${item.date} ${item.time} UTC` : item.date}</time><span className="news-badge">{item.category}</span></div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <a href={item.url} target="_blank" rel="noreferrer">{item.source}<ExternalLink size={14} /></a>
              </article>
            ))}
          </div>
        </section>
      ))}
      {groups.length === 0 && <div className="empty-search">这一分类最近 {NEWS_RETENTION_DAYS} 天没有新条目。</div>}
    </DocsShell>
  )
}
