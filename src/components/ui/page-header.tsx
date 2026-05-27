import type { ReactNode } from 'react'
import { Badge } from './badge'
import { Card, CardContent } from './card'

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  stats?: Array<{ label: string; value: string }>
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, stats = [], actions }: PageHeaderProps) {
  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardContent className="grid gap-5 px-0 pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
            <div className="grid gap-1">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
            </div>
          </div>
          {stats.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stats.map((stat) => (
                <Badge key={stat.label} variant="outline" className="gap-2 rounded-full bg-white/90 px-3 py-1.5 text-slate-600">
                  <span className="font-medium text-slate-500">{stat.label}</span>
                  <span className="text-slate-900">{stat.value}</span>
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3 sm:justify-end">{actions}</div> : null}
      </CardContent>
    </Card>
  )
}
