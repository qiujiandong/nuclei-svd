import { Fragment } from 'react'
import type { EditorField, EditorPeripheral, EditorRegister } from '../../lib/editorModel'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { cn } from '../../lib/utils'
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
    <div className="rounded-2xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead scope="col" className="w-[100px] text-center">位域名称</TableHead>
            <TableHead scope="col" className="w-[72px] text-center">偏移</TableHead>
            <TableHead scope="col" className="w-[72px] text-center">位宽</TableHead>
            <TableHead scope="col">描述</TableHead>
            <TableHead scope="col" className="w-[64px] text-center">删除</TableHead>
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
              <TableCell className="text-center">
                <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveField(field.id)}>
                  ❌
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {onAddField ? (
            <TableRow
              className="cursor-pointer bg-slate-50/70 hover:bg-slate-100"
              onClick={onAddField}
            >
              <TableCell colSpan={5} className="py-2 text-center text-lg font-semibold text-slate-400">
                +
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
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
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div>
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">registers</p>
        <h4 className="m-0 text-base font-semibold text-slate-900">外设寄存器</h4>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="w-[64px] text-center">位域</TableHead>
              <TableHead scope="col" className="w-[100px]">名称</TableHead>
              <TableHead scope="col" className="w-[100px]">地址偏移</TableHead>
              <TableHead scope="col">描述</TableHead>
              <TableHead scope="col" className="w-[100px]">位宽</TableHead>
              <TableHead scope="col" className="w-[64px] text-center">删除</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registers.map((register, registerIndex) => (
              <Fragment key={register.id}>
                <TableRow>
                  <TableCell className="text-center">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      aria-expanded={register.expanded}
                      aria-label={`${register.expanded ? '折叠' : '展开'}寄存器 ${summarizeName(register.name, `REG${registerIndex}`)} 的位域`}
                      onClick={() => onToggleRegister(register.id)}
                    >
                      {register.expanded ? '▼' : '▶'}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Input
                      aria-label={`${namePrefix}寄存器名称 ${registerIndex + 1}`}
                      value={register.name}
                      onChange={(event) => onRegisterChange(register.id, 'name', event.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={register.addressOffset}
                      onChange={(event) => onRegisterChange(register.id, 'addressOffset', event.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={register.description}
                      onChange={(event) => onRegisterChange(register.id, 'description', event.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={register.size}
                      placeholder="继承"
                      onChange={(event) => onRegisterChange(register.id, 'size', event.target.value)}
                      className={cn(register.size.trim().length === 0 && 'text-slate-400')}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveRegister(register.id)}>
                      ❌
                    </Button>
                  </TableCell>
                </TableRow>
                {register.expanded ? (
                  <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                    <TableCell colSpan={6} className="p-4">
                      <FieldTable
                        fields={register.fields}
                        fieldNameAriaPrefix={`${namePrefix}位域名称`}
                        onAddField={() => onAddField(register.id, register.fields.length)}
                        onFieldChange={(fieldId, field, value) => onFieldChange(register.id, fieldId, field, value)}
                        onRemoveField={(fieldId) => onRemoveField(register.id, fieldId)}
                      />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            ))}
            <TableRow
              className="cursor-pointer bg-slate-50/70 hover:bg-slate-100"
              onClick={onAddRegister}
            >
              <TableCell colSpan={6} className="py-2 text-center text-lg font-semibold text-slate-400">
                +
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
