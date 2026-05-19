import type { EditorDevice, EditorPeripheral } from '../../lib/editorModel'

export type IRegionTemplatePageProps = {
  device: EditorDevice
  resolvedIRegionPeripherals: EditorPeripheral[]
  iregionGroupCount: number
  showDebugCard: boolean
  onToggleIRegionCard: () => void
  onToggleIRegionPeripheral: (peripheralId: string) => void
}

function summarizeName(value: string, fallback: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function formatResolvedAddress(baseAddress: string, offset: string) {
  const parsedBase = Number(baseAddress)
  const parsedOffset = Number(offset)

  if (!Number.isInteger(parsedBase) || !Number.isInteger(parsedOffset)) {
    return '--'
  }

  return `0x${(parsedBase + parsedOffset).toString(16).toUpperCase()}`
}

export function IRegionTemplatePage({
  device,
  resolvedIRegionPeripherals,
  iregionGroupCount,
  showDebugCard,
  onToggleIRegionCard,
  onToggleIRegionPeripheral,
}: IRegionTemplatePageProps) {
  return (
    <div className="register-settings-panel">
      {showDebugCard ? (
        <section className="editor-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">IREGION map</p>
              <h3>IREGION</h3>
            </div>
          </div>

          <article className="editor-card readonly-card">
            <div className="card-header">
              <button
                type="button"
                className="collapse-toggle"
                aria-expanded={device.iregionExpanded}
                aria-label={device.iregionExpanded ? '折叠 IREGION' : '展开 IREGION'}
                onClick={onToggleIRegionCard}
              >
                <span>{device.iregionExpanded ? '▾' : '▸'}</span>
                <span>IREGION</span>
              </button>
              <div className="readonly-header-controls">
                <div className="readonly-meta">
                  <span>寄存器组：{iregionGroupCount}</span>
                </div>
              </div>
            </div>

            {device.iregionExpanded ? (
              <div className="card-body">
                <div className="readonly-toolbar">
                  <span className="readonly-note"></span>
                </div>

                <div className="card-stack">
                  {resolvedIRegionPeripherals.map((peripheral, peripheralIndex) => (
                    <article className="editor-card group-card readonly-card" key={peripheral.id}>
                      <div className="card-header">
                        <button
                          type="button"
                          className="collapse-toggle"
                          aria-expanded={peripheral.expanded}
                          aria-label={`${peripheral.expanded ? '折叠' : '展开'}寄存器组 ${summarizeName(peripheral.name, `IREGION 组 ${peripheralIndex + 1}`)}`}
                          onClick={() => onToggleIRegionPeripheral(peripheral.id)}
                        >
                          <span>{peripheral.expanded ? '▾' : '▸'}</span>
                          <span>{summarizeName(peripheral.name, `IREGION 组 ${peripheralIndex + 1}`)}</span>
                        </button>
                        <div className="readonly-meta">
                          <span>实际基地址：{peripheral.baseAddress}</span>
                          <span>寄存器数：{peripheral.registers.length}</span>
                        </div>
                      </div>

                      {peripheral.expanded ? (
                        <div className="card-body">
                          <div className="readonly-grid">
                            <div>
                              <span className="readonly-label">groupName</span>
                              <strong>{peripheral.groupName || '-'}</strong>
                            </div>
                            <div>
                              <span className="readonly-label">实际基地址</span>
                              <strong>{peripheral.baseAddress}</strong>
                            </div>
                            <div className="readonly-wide">
                              <span className="readonly-label">说明</span>
                              <strong>{peripheral.description}</strong>
                            </div>
                          </div>

                          <div className="field-table-wrap">
                            <table className="field-table readonly-table">
                              <thead>
                                <tr>
                                  <th scope="col">寄存器名称</th>
                                  <th scope="col">addressOffset</th>
                                  <th scope="col">实际地址</th>
                                  <th scope="col">size</th>
                                  <th scope="col">access</th>
                                  <th scope="col">说明</th>
                                </tr>
                              </thead>
                              <tbody>
                                {peripheral.registers.map((register) => (
                                  <tr key={register.id}>
                                    <td>{register.name}</td>
                                    <td>{register.addressOffset}</td>
                                    <td>{formatResolvedAddress(peripheral.baseAddress, register.addressOffset)}</td>
                                    <td>{register.size || device.size}</td>
                                    <td>{register.access || device.access || 'inherit'}</td>
                                    <td>{register.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        </section>
      ) : (
        <section className="editor-section">
          <article className="editor-card readonly-card">
            <p className="readonly-note">IREGION 模板预览在开发模式或启用 VITE_DEBUG=true 时显示。</p>
          </article>
        </section>
      )}
    </div>
  )
}
