interface PageIntroProps {
  kicker: string
  title: string
  description: string
  stats?: Array<[string, string]>
}

export function PageIntro({ kicker, title, description, stats }: PageIntroProps) {
  return (
    <header className="page-intro">
      <span className="section-kicker">{kicker}</span><h1>{title}</h1><p>{description}</p>
      {stats && <div className="intro-stats">{stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>}
    </header>
  )
}
