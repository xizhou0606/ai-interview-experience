import { useMemo, useState } from 'react'
import { ExternalLink, Newspaper } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { NEWS_CATEGORIES, NEWS_WINDOW_DAYS, groupNewsByDate, technologyNews, type NewsCategory } from '../../data/technology-news'

type NewsFilter = '全部' | NewsCategory

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const visible = useMemo(() => filter === '全部' ? technologyNews : technologyNews.filter((item) => item.category === filter), [filter])
  const groups = useMemo(() => groupNewsByDate(visible), [visible])
  const freshCount = groups.reduce((total, group) => total + group.items.length, 0)
  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECH NEWS"
        title="近两周可核验的技术新闻"
        description="只收录前端、后端和 AI 的一手来源：官方博客、发布说明或可公开访问的原文。按日期分组，约保留 14 天，重复链接不会再写一遍。"
        stats={[[String(freshCount), '在窗条目'], [String(NEWS_WINDOW_DAYS), '天窗口'], [String(NEWS_CATEGORIES.length), '固定分类']]}
      />
      <div className="filter-row">
        {(['全部', ...NEWS_CATEGORIES] as const).map((label) => (
          <button key={label} className={filter === label ? 'active' : ''} onClick={() => setFilter(label)}>{label}</button>
        ))}
      </div>
      {groups.map((group, index) => (
        <section className="news-day" id={`section-${index}`} key={group.date}>
          <div className="technology-family-head">
            <span>{group.date}</span>
            <p>按 ISO 日期归组，新的一天排在前面。</p>
            <em>{group.items.length} 条</em>
          </div>
          <div className="news-list">
            {group.items.map((item) => (
              <article key={item.url}>
                <div className="news-meta">
                  <time dateTime={item.time ? `${item.date}T${item.time}` : item.date}>{item.time ? `${item.date} ${item.time}` : item.date}</time>
                  <span className="news-badge">{item.category}</span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <a className="news-source" href={item.url} target="_blank" rel="noreferrer">
                  {item.source}<ExternalLink size={13} />
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
      {groups.length === 0 && (
        <div className="news-empty">
          <Newspaper size={18} />
          <strong>这一分类暂时没有在窗条目</strong>
          <p>换一个分类，或等下一轮核验后再看。</p>
        </div>
      )}
    </DocsShell>
  )
}
