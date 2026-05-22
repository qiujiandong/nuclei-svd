import type { EditorDevice } from '../../lib/editorModel'
import {
  RegisterEditorList,
  type BitField,
  type PeripheralField,
  type RegisterField,
} from './peripheralEditorShared'
import { summarizeName, templateColorClass } from './peripheralEditorUtils'

export type PeripheralTemplatePageActions = {
  addPeripheralTemplate: () => void
  togglePeripheralTemplate: (templateId: string) => void
  removePeripheralTemplate: (templateId: string) => void
  changePeripheralTemplate: (templateId: string, field: PeripheralField, value: string) => void
  addTemplateRegister: (templateId: string) => void
  toggleTemplateRegister: (templateId: string, registerId: string) => void
  addTemplateField: (templateId: string, registerId: string, fieldCount: number) => void
  removeTemplateRegister: (templateId: string, registerId: string) => void
  changeTemplateRegister: (templateId: string, registerId: string, field: RegisterField, value: string) => void
  changeTemplateField: (templateId: string, registerId: string, fieldId: string, field: BitField, value: string) => void
  removeTemplateField: (templateId: string, registerId: string, fieldId: string) => void
}

export type PeripheralTemplatePageProps = {
  device: EditorDevice
  actions: PeripheralTemplatePageActions
}

export function PeripheralTemplatePage({ device, actions }: PeripheralTemplatePageProps) {
  return (
    <div className="register-settings-panel">
      <section className="editor-section">
        <div className="custom-group-columns">
          <section className="editor-card column-panel">
            <div className="column-header">
              <div>
                <p className="eyebrow">peripheral templates list</p>
                <h4>外设模板列表</h4>
              </div>
              <button type="button" className="secondary" onClick={actions.addPeripheralTemplate}>
                新增外设模板
              </button>
            </div>
            <div className="nested-stack">
              {device.peripheralTemplates.length > 0 ? (
                device.peripheralTemplates.map((template, templateIndex) => (
                  <article
                    className={`editor-card group-card template-linked-card ${templateColorClass(templateIndex)}`}
                    key={template.id}
                  >
                    <div className="card-header">
                      <button
                        type="button"
                        className="collapse-toggle"
                        aria-expanded={template.expanded}
                        aria-label={`${template.expanded ? '折叠' : '展开'}外设模板 ${summarizeName(template.name, `外设模板 ${templateIndex + 1}`)}`}
                        onClick={() => actions.togglePeripheralTemplate(template.id)}
                      >
                        <span>{template.expanded ? '▾' : '▸'}</span>
                        <span>{summarizeName(template.name, `外设模板 ${templateIndex + 1}`)}</span>
                      </button>
                      <div className="card-actions">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => actions.removePeripheralTemplate(template.id)}
                        >
                          删除模板
                        </button>
                      </div>
                    </div>
                    {template.expanded ? (
                      <div className="card-body">
                        <div className="inline-field-row">
                          <label className="inline-field inline-medium">
                            <span>外设名称</span>
                            <input
                              value={template.name}
                              onChange={(event) =>
                                actions.changePeripheralTemplate(template.id, 'name', event.target.value)}
                            />
                          </label>
                          <label className="inline-field inline-medium">
                            <span>groupName</span>
                            <input
                              value={template.groupName}
                              onChange={(event) =>
                                actions.changePeripheralTemplate(template.id, 'groupName', event.target.value)}
                            />
                          </label>
                          <label className="inline-field inline-wide">
                            <span>外设描述</span>
                            <input
                              value={template.description}
                              onChange={(event) =>
                                actions.changePeripheralTemplate(template.id, 'description', event.target.value)}
                            />
                          </label>
                        </div>
                        <RegisterEditorList
                          registers={template.registers}
                          namePrefix="模板"
                          onToggleRegister={(registerId) => actions.toggleTemplateRegister(template.id, registerId)}
                          onAddRegister={() => actions.addTemplateRegister(template.id)}
                          onRegisterChange={(registerId, field, value) =>
                            actions.changeTemplateRegister(template.id, registerId, field, value)}
                          onRemoveRegister={(registerId) => actions.removeTemplateRegister(template.id, registerId)}
                          onAddField={(registerId, fieldCount) =>
                            actions.addTemplateField(template.id, registerId, fieldCount)}
                          onFieldChange={(registerId, fieldId, field, value) =>
                            actions.changeTemplateField(template.id, registerId, fieldId, field, value)}
                          onRemoveField={(registerId, fieldId) =>
                            actions.removeTemplateField(template.id, registerId, fieldId)}
                        />
                      </div>
                    ) : null}
                  </article>
                ))
              ) : (
                <p className="readonly-note">暂无外设模板。先创建模板，再到 SoC 外设配置中实例化。</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
