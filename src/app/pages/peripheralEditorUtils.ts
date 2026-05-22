export function summarizeName(value: string, fallback: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

export function templateColorClass(index: number) {
  return `template-color-${(index % 6) + 1}`
}
