interface ArticleSectionProps { index: number; title: string; children: React.ReactNode }

export function ArticleSection({ index, title, children }: ArticleSectionProps) {
  return <section className="article-section" id={`section-${index}`}><div className="article-section-heading"><span>{String(index + 1).padStart(2, '0')}</span><h2>{title}</h2></div>{children}</section>
}
