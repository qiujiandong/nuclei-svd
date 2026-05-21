import type { EditorDevice, EditorField, EditorPeripheral, EditorRegister } from '../../lib/editorModel'

type PeripheralField = keyof Omit<EditorPeripheral, 'id' | 'expanded' | 'registers'>
type RegisterField = keyof Omit<EditorRegister, 'id' | 'expanded' | 'fields'>
type BitField = keyof Omit<EditorField, 'id' | 'expanded'>

export type RegisterTemplatePageActions = {
  addPeripheralTemplate: () => void
  togglePeripheralTemplate: (templateId: string) => void
  generatePeripheralFromTemplate: (templateId: string) => void
  removePeripheralTemplate: (templateId: string) => void
  changePeripheralTemplate: (templateId: string, field: PeripheralField, value: string) => void
  addTemplateRegisterTemplate: (templateId: string, templateCount: number) => void
  toggleTemplateRegisterTemplate: (templateId: string, registerTemplateId: string) => void
  addTemplateRegisterTemplateField: (templateId: string, registerTemplateId: string, fieldCount: number) => void
  generateTemplateRegisterFromTemplate: (templateId: string, registerTemplateId: string) => void
  removeTemplateRegisterTemplate: (templateId: string, registerTemplateId: string) => void
  changeTemplateRegisterTemplate: (
    templateId: string,
    registerTemplateId: string,
    field: RegisterField,
    value: string,
  ) => void
  changeTemplateRegisterTemplateField: (
    templateId: string,
    registerTemplateId: string,
    fieldId: string,
    field: BitField,
    value: string,
  ) => void
  removeTemplateRegisterTemplateField: (templateId: string, registerTemplateId: string, fieldId: string) => void
  addTemplateRegister: (templateId: string) => void
  toggleTemplateRegister: (templateId: string, registerId: string) => void
  addTemplateField: (templateId: string, registerId: string, fieldCount: number) => void
  removeTemplateRegister: (templateId: string, registerId: string) => void
  changeTemplateRegister: (templateId: string, registerId: string, field: RegisterField, value: string) => void
  changeTemplateField: (templateId: string, registerId: string, fieldId: string, field: BitField, value: string) => void
  removeTemplateField: (templateId: string, registerId: string, fieldId: string) => void
  addPeripheral: () => void
  togglePeripheral: (peripheralId: string) => void
  removePeripheral: (peripheralId: string) => void
  changePeripheral: (peripheralId: string, field: PeripheralField, value: string) => void
  addRegisterTemplate: (peripheralId: string, templateCount: number) => void
  toggleRegisterTemplate: (peripheralId: string, templateId: string) => void
  addRegisterTemplateField: (peripheralId: string, templateId: string, fieldCount: number) => void
  generateRegisterFromTemplate: (peripheralId: string, templateId: string) => void
  removeRegisterTemplate: (peripheralId: string, templateId: string) => void
  changeRegisterTemplate: (peripheralId: string, templateId: string, field: RegisterField, value: string) => void
  changeRegisterTemplateField: (
    peripheralId: string,
    templateId: string,
    fieldId: string,
    field: BitField,
    value: string,
  ) => void
  removeRegisterTemplateField: (peripheralId: string, templateId: string, fieldId: string) => void
  addRegister: (peripheralId: string) => void
  toggleRegister: (peripheralId: string, registerId: string) => void
  addField: (peripheralId: string, registerId: string, fieldCount: number) => void
  removeRegister: (peripheralId: string, registerId: string) => void
  changeRegister: (peripheralId: string, registerId: string, field: RegisterField, value: string) => void
  changeField: (peripheralId: string, registerId: string, fieldId: string, field: BitField, value: string) => void
  removeField: (peripheralId: string, registerId: string, fieldId: string) => void
}

export type RegisterTemplatePageProps = {
  device: EditorDevice
  actions: RegisterTemplatePageActions
}

type RegisterTemplateCardProps = {
  registerTemplate: EditorRegister
  registerTemplateIndex: number
  onToggle: () => void
  onAddField: () => void
  onGenerate: () => void
  onRemove: () => void
  onChange: (field: RegisterField, value: string) => void
  onFieldChange: (fieldId: string, field: BitField, value: string) => void
  onRemoveField: (fieldId: string) => void
  generateLabel: string
}

type RegisterInstanceCardProps = {
  register: EditorRegister
  registerIndex: number
  registerTemplates: EditorRegister[]
  onToggle: () => void
  onAddField: () => void
  onRemove: () => void
  onChange: (field: RegisterField, value: string) => void
  onFieldChange: (fieldId: string, field: BitField, value: string) => void
  onRemoveField: (fieldId: string) => void
  fieldNameAriaPrefix: string
  showAddressOffsetAriaLabel?: boolean
}

function summarizeName(value: string, fallback: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function templateColorClass(index: number) {
  return `template-color-${(index % 6) + 1}`
}

function registerTemplateColorClass(index: number) {
  return `register-color-${(index % 6) + 1}`
}

function derivedColorClass(derivedFrom: string | undefined, templates: Array<{ name: string }>) {
  if (!derivedFrom) return ''

  const templateIndex = templates.findIndex((template) => template.name === derivedFrom)
  return templateIndex >= 0 ? templateColorClass(templateIndex) : ''
}

function derivedRegisterColorClass(derivedFrom: string | undefined, templates: Array<{ name: string }>) {
  if (!derivedFrom) return ''

  const templateIndex = templates.findIndex((template) => template.name === derivedFrom)
  return templateIndex >= 0 ? registerTemplateColorClass(templateIndex) : ''
}

function FieldTable({
  fields,
  fieldNameAriaPrefix,
  onFieldChange,
  onRemoveField,
}: {
  fields: EditorField[]
  fieldNameAriaPrefix: string
  onFieldChange: (fieldId: string, field: BitField, value: string) => void
  onRemoveField: (fieldId: string) => void
}) {
  return (
    <div className="field-table-wrap">
      <table className="field-table">
        <thead>
          <tr>
            <th scope="col">位域名称</th>
            <th scope="col">bitOffset</th>
            <th scope="col">bitWidth</th>
            <th scope="col">位域描述</th>
            <th scope="col">操作</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, fieldIndex) => (
            <tr key={field.id}>
              <td>
                <input
                  aria-label={`${fieldNameAriaPrefix} ${fieldIndex + 1}`}
                  value={field.name}
                  onChange={(event) => onFieldChange(field.id, 'name', event.target.value)}
                />
              </td>
              <td>
                <input
                  value={field.bitOffset}
                  onChange={(event) => onFieldChange(field.id, 'bitOffset', event.target.value)}
                />
              </td>
              <td>
                <input
                  value={field.bitWidth}
                  onChange={(event) => onFieldChange(field.id, 'bitWidth', event.target.value)}
                />
              </td>
              <td>
                <input
                  value={field.description}
                  onChange={(event) => onFieldChange(field.id, 'description', event.target.value)}
                />
              </td>
              <td>
                <button type="button" className="ghost-button table-action" onClick={() => onRemoveField(field.id)}>
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PeripheralRegisterTable({
  registers,
  onRegisterChange,
  onRemoveRegister,
}: {
  registers: EditorRegister[]
  onRegisterChange: (registerId: string, field: RegisterField, value: string) => void
  onRemoveRegister: (registerId: string) => void
}) {
  return (
    <div className="field-table-wrap">
      <table className="field-table">
        <thead>
          <tr>
            <th scope="col">addressOffset</th>
            <th scope="col">name</th>
            <th scope="col">description</th>
            <th scope="col">操作</th>
          </tr>
        </thead>
        <tbody>
          {registers.map((register, registerIndex) => (
            <tr key={register.id}>
              <td>
                <input
                  aria-label={`外设寄存器偏移 ${registerIndex + 1}`}
                  value={register.addressOffset}
                  onChange={(event) => onRegisterChange(register.id, 'addressOffset', event.target.value)}
                />
              </td>
              <td>
                <input
                  aria-label={`外设寄存器名称 ${registerIndex + 1}`}
                  value={register.name}
                  onChange={(event) => onRegisterChange(register.id, 'name', event.target.value)}
                />
              </td>
              <td>
                <input
                  aria-label={`外设寄存器描述 ${registerIndex + 1}`}
                  value={register.description}
                  onChange={(event) => onRegisterChange(register.id, 'description', event.target.value)}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="ghost-button table-action"
                  onClick={() => onRemoveRegister(register.id)}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RegisterTemplateCard({
  registerTemplate,
  registerTemplateIndex,
  onToggle,
  onAddField,
  onGenerate,
  onRemove,
  onChange,
  onFieldChange,
  onRemoveField,
  generateLabel,
}: RegisterTemplateCardProps) {
  const title = summarizeName(registerTemplate.name, `寄存器模板 ${registerTemplateIndex + 1}`)

  return (
    <article
      className={`editor-card register-card register-linked-card ${registerTemplateColorClass(registerTemplateIndex)}`}
      key={registerTemplate.id}
    >
      <div className="card-header">
        <button
          type="button"
          className="collapse-toggle"
          aria-expanded={registerTemplate.expanded}
          aria-label={`${registerTemplate.expanded ? '折叠' : '展开'}寄存器模板 ${title}`}
          onClick={onToggle}
        >
          <span>{registerTemplate.expanded ? '▾' : '▸'}</span>
          <span>{title}</span>
        </button>
        <div className="card-actions">
          <button type="button" className="secondary" onClick={onAddField}>
            新增位域
          </button>
          <button type="button" className="secondary" onClick={onGenerate}>
            {generateLabel}
          </button>
          <button type="button" className="ghost-button" onClick={onRemove}>
            删除模板
          </button>
        </div>
      </div>
      {registerTemplate.expanded ? (
        <div className="card-body">
          <div className="inline-field-row">
            <label className="inline-field inline-medium">
              <span>模板名称</span>
              <input
                aria-label="寄存器模板名称"
                value={registerTemplate.name}
                onChange={(event) => onChange('name', event.target.value)}
              />
            </label>
            <label className="inline-field inline-small">
              <span>addressOffset</span>
              <input
                value={registerTemplate.addressOffset}
                onChange={(event) => onChange('addressOffset', event.target.value)}
              />
            </label>
            <label className="inline-field inline-wide">
              <span>模板描述</span>
              <input
                value={registerTemplate.description}
                onChange={(event) => onChange('description', event.target.value)}
              />
            </label>
          </div>
          <FieldTable
            fields={registerTemplate.fields}
            fieldNameAriaPrefix="寄存器模板位域名称"
            onFieldChange={onFieldChange}
            onRemoveField={onRemoveField}
          />
        </div>
      ) : null}
    </article>
  )
}

function RegisterInstanceCard({
  register,
  registerIndex,
  registerTemplates,
  onToggle,
  onAddField,
  onRemove,
  onChange,
  onFieldChange,
  onRemoveField,
  fieldNameAriaPrefix,
  showAddressOffsetAriaLabel = false,
}: RegisterInstanceCardProps) {
  const title = summarizeName(register.name, `寄存器 ${registerIndex + 1}`)

  return (
    <article
      className={`editor-card register-card ${register.derivedFrom ? `register-linked-card ${derivedRegisterColorClass(register.derivedFrom, registerTemplates)}` : ''}`}
      key={register.id}
    >
      <div className="card-header">
        <button
          type="button"
          className="collapse-toggle"
          aria-expanded={register.expanded}
          aria-label={`${register.expanded ? '折叠' : '展开'}寄存器 ${title}`}
          onClick={onToggle}
        >
          <span>{register.expanded ? '▾' : '▸'}</span>
          <span>{title}</span>
        </button>
        <div className="card-actions">
          <button type="button" className="ghost-button" onClick={onRemove}>
            删除寄存器
          </button>
        </div>
      </div>
      {register.expanded ? (
        <div className="card-body">
          <div className="inline-field-row">
            <label className="inline-field inline-medium">
              <span>name</span>
              <input
                value={register.name}
                onChange={(event) => onChange('name', event.target.value)}
              />
            </label>
            <label className="inline-field inline-small">
              <span>addressOffset</span>
              <input
                value={register.addressOffset}
                onChange={(event) => onChange('addressOffset', event.target.value)}
              />
            </label>
            <label className="inline-field inline-wide">
              <span>description</span>
              <input
                value={register.description}
                onChange={(event) => onChange('description', event.target.value)}
              />
            </label>
          </div>
        </div>
      ) : null}
    </article>
  )
}

export function PeripheralTemplatePage({ device, actions }: RegisterTemplatePageProps) {
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
              {device.peripheralTemplates.map((template, templateIndex) => (
                <article
                  className={`editor-card group-card template-linked-card ${templateColorClass(templateIndex)}`}
                  key={template.id}
                >
                  <div className="card-header">
                    <button
                      type="button"
                      className="collapse-toggle"
                      aria-expanded={template.expanded}
                      aria-label={`${template.expanded ? '折叠' : '展开'}寄存器组模板 ${summarizeName(template.name, `寄存器组模板 ${templateIndex + 1}`)}`}
                      onClick={() => actions.togglePeripheralTemplate(template.id)}
                    >
                      <span>{template.expanded ? '▾' : '▸'}</span>
                      <span>{summarizeName(template.name, `寄存器组模板 ${templateIndex + 1}`)}</span>
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
                            onChange={(event) => actions.changePeripheralTemplate(template.id, 'name', event.target.value)}
                          />
                        </label>
                        <label className="inline-field inline-wide">
                          <span>外设描述</span>
                          <input
                            value={template.description}
                            onChange={(event) =>
                              actions.changePeripheralTemplate(template.id, 'description', event.target.value)
                            }
                          />
                        </label>
                      </div>
                      <div className="nested-stack">
                        <section className="editor-card column-panel">
                          <div className="column-header">
                            <div>
                              <p className="eyebrow">Peripheral registers</p>
                              <h4>外设寄存器</h4>
                            </div>
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => actions.addTemplateRegister(template.id)}
                            >
                              新增寄存器
                            </button>
                          </div>
                          <PeripheralRegisterTable
                            registers={template.registers}
                            onRegisterChange={(registerId, field, value) =>
                              actions.changeTemplateRegister(template.id, registerId, field, value)
                            }
                            onRemoveRegister={(registerId) => actions.removeTemplateRegister(template.id, registerId)}
                          />
                        </section>
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
