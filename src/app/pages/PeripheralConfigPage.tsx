export type PeripheralConfigPageProps = {
  customGroupCount: number
  registerCount: number
  fieldCount: number
}

export function PeripheralConfigPage({ customGroupCount, registerCount, fieldCount }: PeripheralConfigPageProps) {
  return (
    <section className="editor-section">
      <article className="editor-card readonly-card">
        <div className="card-body">
          <p className="readonly-note">
            暂无独立的外设基础配置内容。当前外设和寄存器实例仍在寄存器模板页统一管理。
          </p>
          <div className="readonly-meta">
            <span>{customGroupCount} 个自定义寄存器组</span>
            <span>{registerCount} 个寄存器</span>
            <span>{fieldCount} 个位域</span>
          </div>
        </div>
      </article>
    </section>
  )
}
