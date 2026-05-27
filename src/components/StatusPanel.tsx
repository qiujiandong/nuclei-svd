import { Alert, AlertDescription, AlertTitle } from './ui/alert'

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
  const variant = tone === 'success' ? 'success' : tone === 'error' ? 'destructive' : 'idle'

  return (
    <Alert variant={variant} aria-live="polite">
      <AlertTitle>{headline}</AlertTitle>
      <AlertDescription>
        <p className="m-0">{detail}</p>
      </AlertDescription>
      {issues.length > 0 ? (
        <ol className="mt-3 grid gap-2 pl-5">
          {issues.map((issue, index) => (
            <li key={`${issue.rule}-${issue.path}-${index}`} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{issue.path || 'document'}</span>
              <code className="rounded-md bg-white/70 px-2 py-0.5 font-mono text-xs">{issue.rule}</code>
            </li>
          ))}
        </ol>
      ) : null}
    </Alert>
  )
}
