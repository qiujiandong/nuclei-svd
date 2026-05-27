import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type FormFieldProps = {
  label: string
  children: ReactNode
  className?: string
}

export function FormField({ label, children, className }: FormFieldProps) {
  return (
    <label className={cn('grid gap-2 text-sm text-slate-700', className)}>
      <span className="text-xs font-semibold tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  )
}
