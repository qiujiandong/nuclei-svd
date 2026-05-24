export function summarizeName(value: string, fallback: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

export function templateColorClass(index: number) {
  return [
    'border-sky-200 bg-sky-50/60',
    'border-emerald-200 bg-emerald-50/60',
    'border-amber-200 bg-amber-50/60',
    'border-rose-200 bg-rose-50/60',
    'border-violet-200 bg-violet-50/60',
    'border-cyan-200 bg-cyan-50/60',
  ][index % 6]
}
