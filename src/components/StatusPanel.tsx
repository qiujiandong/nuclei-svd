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
    <section className={`panel status-panel ${tone}`} aria-live="polite">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Validation & conversion</p>
          <h2>{headline}</h2>
        </div>
        <span className="tone-pill">{tone}</span>
      </div>
      <p className="status-detail">{detail}</p>
      {issues.length > 0 ? (
        <ol className="issue-list">
          {issues.map((issue, index) => (
            <li key={`${issue.rule}-${issue.path}-${index}`}>
              <strong>{issue.path || 'document'}</strong>
              <span>{issue.message}</span>
              <code>{issue.rule}</code>
            </li>
          ))}
        </ol>
      ) : (
        <p className="hint-text">无错误时即可预览并下载 SVD 文件。</p>
      )}
    </section>
  )
}
