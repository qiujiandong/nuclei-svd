export type StatusTone = 'idle' | 'success' | 'error'

export type StatusIssue = {
  path: string
  message: string
  rule: string
}

type StatusPanelProps = {
  tone: StatusTone
  headline: string
  detail: string
  issues: StatusIssue[]
}

export function StatusPanel({ tone, headline, detail, issues }: StatusPanelProps) {
  return (
    <section className={`status-panel ${tone}`} aria-live="polite">
      <div className="status-summary">
        <span className="status-dot" aria-hidden="true" />
        <strong>{headline}</strong>
      </div>
      <p className="status-detail">{detail}</p>
      {issues.length > 0 ? (
        <ol className="issue-list">
          {issues.map((issue, index) => (
            <li key={`${issue.rule}-${issue.path}-${index}`}>
              <span>{issue.path || 'document'}</span>
              <code>{issue.rule}</code>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}
