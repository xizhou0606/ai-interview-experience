import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import {
  NEWS_CATEGORIES,
  TECHNOLOGY_NEWS,
  formatNewsTimestamp,
  groupNewsByDate,
  isFreshNews,
  type NewsCategory,
} from '../../data/technology-news'

type NewsFilter = '全部' | NewsCategory

export function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>('全部')
  const fresh = useMemo(() => TECHNOLOGY_NEWS.filter((item) => isFreshNews(item)), [])
  const visible = filter === '全部' ? fresh : fresh.filter((item) => item.category === filter)
  const groups = groupNewsByDate(visible)
  const dayCount = new Set(fresh.map((item) => item.date)).size

  return (
    <DocsShell active="news" toc={groups.map((group) => group.date)}>
      <PageIntro
        kicker="TECH NEWS"
        title="近两周前端、后端与 AI 快讯"
        description="只收录可核验的官方博客、发布说明与 GitHub Release，按日期归档。跳过传闻、营销稿和没有规范链接的条目。"
        stats={[[String(fresh.length), '条近两周快讯'], [String(dayCount), '个发布日'], ['3', '个分类']]}
      />
      <div className="filter-row" role="tablist" aria-label="按分类筛选新闻">
        {(['全部', ...NEWS_CATEGORIES] as NewsFilter[]).map((category) => (
          <button key={category} type="button" className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>
            {category}
          </button>
        ))}
      </div>
      {groups.map((group, index) => (
        <section className="news-day article-section" id={`section-${index}`} key={group.date}>
          <div className="article-section-heading">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h2>{group.date}</h2>
            <em>{group.items.length} 条</em>
          </div>
          <div className="news-list">
            {group.items.map((item) => (
              <article key={item.url} className="news-item">
                <div className="news-item-meta">
                  <time dateTime={item.time ? `${item.date}T${item.time}:00Z` : item.date}>{formatNewsTimestamp(item)}</time>
                  <span className={`news-badge news-badge-${item.category}`}>{item.category}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <div className="news-item-source">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.source}
                    <ExternalLink size={14} />
                  </a>
                  {item.twitterUrl && (
                    <a href={item.twitterUrl} target="_blank" rel="noreferrer">
                      X 原文
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
      {groups.length === 0 && <div className="news-empty">这个分类近两周没有可核验条目。</div>}
    </DocsShell>
  )
}
