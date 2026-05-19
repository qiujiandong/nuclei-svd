import type { ReactNode } from 'react'

export type IRegionTemplatePageProps = {
  children: ReactNode
}

export function IRegionTemplatePage({ children }: IRegionTemplatePageProps) {
  return <div className="register-settings-panel">{children}</div>
}
