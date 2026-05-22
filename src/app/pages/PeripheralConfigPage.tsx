import type { EditorDevice } from '../../lib/editorModel'
import {
  RegisterEditorList,
  type BitField,
  type PeripheralField,
  type RegisterField,
} from './peripheralEditorShared'
import { summarizeName, templateColorClass } from './peripheralEditorUtils'

export type PeripheralConfigPageActions = {
  addPeripheral: () => void
  addLinkedPeripheralFromTemplate: (templateId: string) => void
  addDetachedPeripheralFromTemplate: (templateId: string) => void
  savePeripheralAsTemplate: (peripheralId: string) => void
  togglePeripheral: (peripheralId: string) => void
  removePeripheral: (peripheralId: string) => void
  changePeripheral: (peripheralId: string, field: PeripheralField, value: string) => void
  addRegister: (peripheralId: string) => void
  toggleRegister: (peripheralId: string, registerId: string) => void
  addField: (peripheralId: string, registerId: string, fieldCount: number) => void
  removeRegister: (peripheralId: string, registerId: string) => void
  changeRegister: (peripheralId: string, registerId: string, field: RegisterField, value: string) => void
  changeField: (peripheralId: string, registerId: string, fieldId: string, field: BitField, value: string) => void
  removeField: (peripheralId: string, registerId: string, fieldId: string) => void
}

export type PeripheralConfigPageProps = {
  device: EditorDevice
  customGroupCount: number
  registerCount: number
  fieldCount: number
  actions: PeripheralConfigPageActions
}

export function PeripheralConfigPage({
  device,
  customGroupCount,
  registerCount,
  fieldCount,
  actions,
}: PeripheralConfigPageProps) {
  const templateById = new Map(device.peripheralTemplates.map((template) => [template.id, template]))

  return (
    <section className="editor-section peripheral-config-page">
      <article className="editor-card readonly-card">
        <div className="card-body">
          <p className="readonly-note">
            外设实例在这里配置 baseAddress。关联模板实例会实时继承模板寄存器；非关联实例可自由编辑并另存为模板。
          </p>
          <div className="readonly-meta">
            <span>{customGroupCount} 个外设实例</span>
            <span>{registerCount} 个寄存器</span>
            <span>{fieldCount} 个位域</span>
          </div>
        </div>
      </article>

      <div className="instance-toolbar">
        <button type="button" className="secondary" onClick={actions.addPeripheral}>
          新增独立外设
        </button>
        {device.peripheralTemplates.map((template, templateIndex) => (
          <div className={`template-action-group ${templateColorClass(templateIndex)}`} key={template.id}>
            <strong>{summarizeName(template.name, `模板 ${templateIndex + 1}`)}</strong>
            <button type="button" className="secondary" onClick={() => actions.addLinkedPeripheralFromTemplate(template.id)}>
              关联实例
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => actions.addDetachedPeripheralFromTemplate(template.id)}
            >
              非关联副本
            </button>
          </div>
        ))}
      </div>

      <div className="nested-stack">
        {device.peripherals.length > 0 ? (
          device.peripherals.map((peripheral, peripheralIndex) => {
            const template = peripheral.templateId ? templateById.get(peripheral.templateId) : undefined
            const linked = Boolean(template)
            const inheritedRegisters = template?.registers ?? []

            return (
              <article
                className={`editor-card group-card ${linked ? 'template-linked-card' : ''} ${linked ? templateColorClass(device.peripheralTemplates.findIndex((item) => item.id === peripheral.templateId)) : ''}`}
                key={peripheral.id}
              >
                <div className="card-header">
                  <button
                    type="button"
                    className="collapse-toggle"
                    aria-expanded={peripheral.expanded}
                    aria-label={`${peripheral.expanded ? '折叠' : '展开'}外设实例 ${summarizeName(peripheral.name, `外设实例 ${peripheralIndex + 1}`)}`}
                    onClick={() => actions.togglePeripheral(peripheral.id)}
                  >
                    <span>{peripheral.expanded ? '▾' : '▸'}</span>
                    <span>{summarizeName(peripheral.name, `外设实例 ${peripheralIndex + 1}`)}</span>
                  </button>
                  <div className="card-actions">
                    {!linked ? (
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => actions.savePeripheralAsTemplate(peripheral.id)}
                      >
                        保存为模板
                      </button>
                    ) : null}
                    <button type="button" className="ghost-button" onClick={() => actions.removePeripheral(peripheral.id)}>
                      删除实例
                    </button>
                  </div>
                </div>
                {peripheral.expanded ? (
                  <div className="card-body">
                    <div className="inline-field-row">
                      <label className="inline-field inline-medium">
                        <span>外设名称</span>
                        <input
                          value={peripheral.name}
                          onChange={(event) => actions.changePeripheral(peripheral.id, 'name', event.target.value)}
                        />
                      </label>
                      <label className="inline-field inline-medium">
                        <span>baseAddress</span>
                        <input
                          value={peripheral.baseAddress}
                          onChange={(event) =>
                            actions.changePeripheral(peripheral.id, 'baseAddress', event.target.value)}
                        />
                      </label>
                      {!linked ? (
                        <>
                          <label className="inline-field inline-medium">
                            <span>groupName</span>
                            <input
                              value={peripheral.groupName}
                              onChange={(event) =>
                                actions.changePeripheral(peripheral.id, 'groupName', event.target.value)}
                            />
                          </label>
                          <label className="inline-field inline-wide">
                            <span>外设描述</span>
                            <input
                              value={peripheral.description}
                              onChange={(event) =>
                                actions.changePeripheral(peripheral.id, 'description', event.target.value)}
                            />
                          </label>
                        </>
                      ) : null}
                    </div>

                    {linked && template ? (
                      <section className="editor-card inherited-summary">
                        <p className="eyebrow">linked template</p>
                        <h4>{summarizeName(template.name, '未命名模板')}</h4>
                        <p className="readonly-note">
                          描述、groupName、寄存器和位域均继承自模板。修改模板后，所有关联实例会同步更新。
                        </p>
                        <div className="readonly-meta">
                          <span>groupName: {summarizeName(template.groupName, template.name)}</span>
                          <span>{inheritedRegisters.length} 个继承寄存器</span>
                        </div>
                      </section>
                    ) : null}

                    {!linked ? (
                      <RegisterEditorList
                        registers={peripheral.registers}
                        namePrefix="实例"
                        onToggleRegister={(registerId) => actions.toggleRegister(peripheral.id, registerId)}
                        onAddRegister={() => actions.addRegister(peripheral.id)}
                        onRegisterChange={(registerId, field, value) =>
                          actions.changeRegister(peripheral.id, registerId, field, value)}
                        onRemoveRegister={(registerId) => actions.removeRegister(peripheral.id, registerId)}
                        onAddField={(registerId, fieldCount) => actions.addField(peripheral.id, registerId, fieldCount)}
                        onFieldChange={(registerId, fieldId, field, value) =>
                          actions.changeField(peripheral.id, registerId, fieldId, field, value)}
                        onRemoveField={(registerId, fieldId) => actions.removeField(peripheral.id, registerId, fieldId)}
                      />
                    ) : null}
                  </div>
                ) : null}
              </article>
            )
          })
        ) : (
          <article className="editor-card readonly-card">
            <p className="readonly-note">暂无外设实例。可以新增独立外设，或先创建模板后从模板实例化。</p>
          </article>
        )}
      </div>
    </section>
  )
}
