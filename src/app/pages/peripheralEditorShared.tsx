import type { EditorField, EditorPeripheral, EditorRegister } from '../../lib/editorModel'
import { summarizeName } from './peripheralEditorUtils'

export type PeripheralField = keyof Omit<
  EditorPeripheral,
  'id' | 'templateId' | 'expanded' | 'derivedFrom' | 'registerTemplates' | 'registers'
>
export type RegisterField = keyof Omit<EditorRegister, 'id' | 'expanded' | 'fields'>
export type BitField = keyof Omit<EditorField, 'id' | 'expanded'>

type FieldTableProps = {
  fields: EditorField[]
  fieldNameAriaPrefix: string
  onAddField?: () => void
  onFieldChange: (fieldId: string, field: BitField, value: string) => void
  onRemoveField: (fieldId: string) => void
}

export function FieldTable({
  fields,
  fieldNameAriaPrefix,
  onAddField,
  onFieldChange,
  onRemoveField,
}: FieldTableProps) {
  return (
    <div className="nested-stack">
      <div className="table-heading-row">
        <div>
          <p className="eyebrow">fields</p>
          <strong>位域配置</strong>
        </div>
        {onAddField ? (
          <button type="button" className="secondary" onClick={onAddField}>
            新增位域
          </button>
        ) : null}
      </div>
      {fields.length > 0 ? (
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
      ) : (
        <p className="readonly-note">未配置位域时，生成的 SVD 不会输出 fields 标签。</p>
      )}
    </div>
  )
}

type RegisterListProps = {
  registers: EditorRegister[]
  namePrefix: string
  onToggleRegister: (registerId: string) => void
  onAddRegister: () => void
  onRegisterChange: (registerId: string, field: RegisterField, value: string) => void
  onRemoveRegister: (registerId: string) => void
  onAddField: (registerId: string, fieldCount: number) => void
  onFieldChange: (registerId: string, fieldId: string, field: BitField, value: string) => void
  onRemoveField: (registerId: string, fieldId: string) => void
}

export function RegisterEditorList({
  registers,
  namePrefix,
  onToggleRegister,
  onAddRegister,
  onRegisterChange,
  onRemoveRegister,
  onAddField,
  onFieldChange,
  onRemoveField,
}: RegisterListProps) {
  return (
    <section className="editor-card column-panel">
      <div className="column-header">
        <div>
          <p className="eyebrow">registers</p>
          <h4>外设寄存器</h4>
        </div>
        <button type="button" className="secondary" onClick={onAddRegister}>
          新增寄存器
        </button>
      </div>
      <div className="nested-stack">
        {registers.length > 0 ? (
          registers.map((register, registerIndex) => (
            <article className="editor-card register-card" key={register.id}>
              <div className="card-header">
                <button
                  type="button"
                  className="collapse-toggle"
                  aria-expanded={register.expanded}
                  aria-label={`${register.expanded ? '折叠' : '展开'}寄存器 ${summarizeName(register.name, `REG${registerIndex}`)}`}
                  onClick={() => onToggleRegister(register.id)}
                >
                  <span>{register.expanded ? '▾' : '▸'}</span>
                  <span>{summarizeName(register.name, `REG${registerIndex}`)}</span>
                </button>
                <div className="card-actions">
                  <button type="button" className="ghost-button" onClick={() => onRemoveRegister(register.id)}>
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
                        aria-label={`${namePrefix}寄存器名称 ${registerIndex + 1}`}
                        value={register.name}
                        onChange={(event) => onRegisterChange(register.id, 'name', event.target.value)}
                      />
                    </label>
                    <label className="inline-field inline-small">
                      <span>addressOffset</span>
                      <input
                        value={register.addressOffset}
                        onChange={(event) => onRegisterChange(register.id, 'addressOffset', event.target.value)}
                      />
                    </label>
                    <label className="inline-field inline-wide">
                      <span>description</span>
                      <input
                        value={register.description}
                        onChange={(event) => onRegisterChange(register.id, 'description', event.target.value)}
                      />
                    </label>
                    <label className="inline-field inline-small">
                      <span>size</span>
                      <input
                        value={register.size}
                        onChange={(event) => onRegisterChange(register.id, 'size', event.target.value)}
                      />
                    </label>
                  </div>
                  <FieldTable
                    fields={register.fields}
                    fieldNameAriaPrefix={`${namePrefix}位域名称`}
                    onAddField={() => onAddField(register.id, register.fields.length)}
                    onFieldChange={(fieldId, field, value) => onFieldChange(register.id, fieldId, field, value)}
                    onRemoveField={(fieldId) => onRemoveField(register.id, fieldId)}
                  />
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <p className="readonly-note">暂无寄存器。新增寄存器后会写入生成的 SVD。</p>
        )}
      </div>
    </section>
  )
}
