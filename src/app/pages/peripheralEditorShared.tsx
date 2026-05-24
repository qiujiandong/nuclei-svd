import type { EditorField, EditorPeripheral, EditorRegister } from '../../lib/editorModel'
import { Button } from '../../components/ui/button'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
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
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">fields</p>
          <strong className="text-sm text-slate-900">位域配置</strong>
        </div>
        {onAddField ? (
          <Button type="button" variant="secondary" size="sm" onClick={onAddField}>
            新增位域
          </Button>
        ) : null}
      </div>
      {fields.length > 0 ? (
        <div className="rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">位域名称</TableHead>
                <TableHead scope="col">bitOffset</TableHead>
                <TableHead scope="col">bitWidth</TableHead>
                <TableHead scope="col">位域描述</TableHead>
                <TableHead scope="col">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, fieldIndex) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <Input
                      aria-label={`${fieldNameAriaPrefix} ${fieldIndex + 1}`}
                      value={field.name}
                      onChange={(event) => onFieldChange(field.id, 'name', event.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={field.bitOffset}
                      onChange={(event) => onFieldChange(field.id, 'bitOffset', event.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={field.bitWidth}
                      onChange={(event) => onFieldChange(field.id, 'bitWidth', event.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={field.description}
                      onChange={(event) => onFieldChange(field.id, 'description', event.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveField(field.id)}>
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="m-0 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          未配置位域时，生成的 SVD 不会输出 fields 标签。
        </p>
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
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">registers</p>
          <h4 className="m-0 text-base font-semibold text-slate-900">外设寄存器</h4>
        </div>
        <Button type="button" variant="secondary" onClick={onAddRegister}>
          新增寄存器
        </Button>
      </div>
      <div className="grid gap-3">
        {registers.length > 0 ? (
          registers.map((register, registerIndex) => (
            <article className="editor-card rounded-2xl border border-slate-200 bg-white" key={register.id}>
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <button
                  type="button"
                  className="flex flex-1 items-center gap-3 text-left text-sm font-semibold text-slate-900"
                  aria-expanded={register.expanded}
                  aria-label={`${register.expanded ? '折叠' : '展开'}寄存器 ${summarizeName(register.name, `REG${registerIndex}`)}`}
                  onClick={() => onToggleRegister(register.id)}
                >
                  <span className="text-slate-400">{register.expanded ? '▾' : '▸'}</span>
                  <span>{summarizeName(register.name, `REG${registerIndex}`)}</span>
                </button>
                <div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveRegister(register.id)}>
                    删除寄存器
                  </Button>
                </div>
              </div>
              {register.expanded ? (
                <div className="grid gap-4 px-5 py-5">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <FormField label="寄存器名称">
                      <Input
                        aria-label={`${namePrefix}寄存器名称 ${registerIndex + 1}`}
                        value={register.name}
                        onChange={(event) => onRegisterChange(register.id, 'name', event.target.value)}
                      />
                    </FormField>
                    <FormField label="addressOffset">
                      <Input
                        value={register.addressOffset}
                        onChange={(event) => onRegisterChange(register.id, 'addressOffset', event.target.value)}
                      />
                    </FormField>
                    <FormField label="description" className="xl:col-span-2">
                      <Input
                        value={register.description}
                        onChange={(event) => onRegisterChange(register.id, 'description', event.target.value)}
                      />
                    </FormField>
                    <FormField label="size">
                      <Input
                        value={register.size}
                        onChange={(event) => onRegisterChange(register.id, 'size', event.target.value)}
                      />
                    </FormField>
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
          <p className="m-0 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            暂无寄存器。新增寄存器后会写入生成的 SVD。
          </p>
        )}
      </div>
    </section>
  )
}
