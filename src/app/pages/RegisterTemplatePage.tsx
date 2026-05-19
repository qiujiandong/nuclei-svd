import type { ReactNode } from 'react'

export type RegisterTemplatePageProps = {
  children: ReactNode
}

export function RegisterTemplatePage({ children }: RegisterTemplatePageProps) {
  return <div className="register-settings-panel">{children}</div>
}
