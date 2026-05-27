import { useEffect, useState } from 'react'
import type { EditorDevice } from '../../lib/editorModel'
import { Button } from '../../components/ui/button'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { cn } from '../../lib/utils'
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
  actions,
}: PeripheralConfigPageProps) {
  const templateById = new Map(device.peripheralTemplates.map((template) => [template.id, template]))
  const firstTemplateId = device.peripheralTemplates[0]?.id ?? ''
  const [linkedTemplateId, setLinkedTemplateId] = useState(firstTemplateId)
  const [detachedTemplateId, setDetachedTemplateId] = useState(firstTemplateId)
  const hasTemplates = device.peripheralTemplates.length > 0

  useEffect(() => {
    if (device.peripheralTemplates.some((template) => template.id === linkedTemplateId)) {
      return
    }

    setLinkedTemplateId(firstTemplateId)
  }, [device.peripheralTemplates, firstTemplateId, linkedTemplateId])

  useEffect(() => {
    if (device.peripheralTemplates.some((template) => template.id === detachedTemplateId)) {
      return
    }

    setDetachedTemplateId(firstTemplateId)
  }, [device.peripheralTemplates, detachedTemplateId, firstTemplateId])

  return (
    <section className="grid gap-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="editor-card rounded-3xl border border-border bg-white p-5">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">standalone peripheral</p>
            </div>
            <Button type="button" variant="secondary" onClick={actions.addPeripheral}>
              创建独立外设
            </Button>
          </div>
        </article>

        <article
          className={`editor-card rounded-3xl border p-5 transition ${hasTemplates ? 'border-border bg-white' : 'border-dashed border-slate-200 bg-slate-50 opacity-60'
            }`}
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">linked template instance</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={!hasTemplates || linkedTemplateId.length === 0}
              onClick={() => actions.addLinkedPeripheralFromTemplate(linkedTemplateId)}
            >
              创建关联实例
            </Button>
            <FormField label="外设模板">
              <Select value={linkedTemplateId} onValueChange={setLinkedTemplateId} disabled={!hasTemplates}>
                <SelectTrigger aria-label="选择用于创建关联实例的外设模板" disabled={!hasTemplates}>
                  <SelectValue placeholder="暂无可用模板" />
                </SelectTrigger>
                <SelectContent>
                  {device.peripheralTemplates.map((template, templateIndex) => (
                    <SelectItem key={template.id} value={template.id}>
                      {summarizeName(template.name, `模板 ${templateIndex + 1}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            {!hasTemplates ? (
              <p className="m-0 text-sm text-slate-500">暂无外设模板，请先在模板页面创建模板。</p>
            ) : null}
          </div>
        </article>

        <article
          className={`editor-card rounded-3xl border p-5 transition ${hasTemplates ? 'border-border bg-white' : 'border-dashed border-slate-200 bg-slate-50 opacity-60'
            }`}
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">detached template copy</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={!hasTemplates || detachedTemplateId.length === 0}
              onClick={() => actions.addDetachedPeripheralFromTemplate(detachedTemplateId)}
            >
              创建非关联副本
            </Button>
            <FormField label="外设模板">
              <Select value={detachedTemplateId} onValueChange={setDetachedTemplateId} disabled={!hasTemplates}>
                <SelectTrigger aria-label="选择用于创建非关联副本的外设模板" disabled={!hasTemplates}>
                  <SelectValue placeholder="暂无可用模板" />
                </SelectTrigger>
                <SelectContent>
                  {device.peripheralTemplates.map((template, templateIndex) => (
                    <SelectItem key={template.id} value={template.id}>
                      {summarizeName(template.name, `模板 ${templateIndex + 1}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            {!hasTemplates ? (
              <p className="m-0 text-sm text-slate-500">暂无外设模板，请先在模板页面创建模板。</p>
            ) : null}
          </div>
        </article>
      </section>

      <div className="grid gap-4">
        {device.peripherals.length > 0 ? (
          device.peripherals.map((peripheral, peripheralIndex) => {
            const template = peripheral.templateId ? templateById.get(peripheral.templateId) : undefined
            const linked = Boolean(template)
            const resolvedDefaultRegisterSize = peripheral.defaultRegisterSize.trim() || device.size.trim()

            return (
              <article
                className={`editor-card rounded-3xl border bg-white p-5 ${linked ? templateColorClass(device.peripheralTemplates.findIndex((item) => item.id === peripheral.templateId)) : 'border-border'}`}
                key={peripheral.id}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <button
                    type="button"
                    className="flex flex-1 items-start gap-3 text-left text-sm font-semibold text-slate-900"
                    aria-expanded={peripheral.expanded}
                    aria-label={`${peripheral.expanded ? '折叠' : '展开'}外设实例 ${summarizeName(peripheral.name, `外设实例 ${peripheralIndex + 1}`)}`}
                    onClick={() => actions.togglePeripheral(peripheral.id)}
                  >
                    <span className="pt-0.5 text-slate-400">{peripheral.expanded ? '▼' : '▶'}</span>
                    <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {summarizeName(peripheral.name, `外设实例 ${peripheralIndex + 1}`)}
                        </span>
                        <span className="block truncate text-sm text-slate-600">
                          {peripheral.description.trim() || '暂无描述'}
                        </span>
                      </div>
                      <div className="flex min-w-[220px] max-w-[280px] flex-1 items-center rounded-xl border border-input bg-white shadow-sm transition-colors focus-within:ring-4 focus-within:ring-ring/60 lg:flex-none">
                        <span className="shrink-0 border-r border-slate-200 px-3 text-xs font-semibold tracking-wide text-slate-500">
                          基地址
                        </span>
                        <Input
                          className={cn('border-0 shadow-none focus-visible:ring-0')}
                          aria-label="外设基地址"
                          value={peripheral.baseAddress}
                          onChange={(event) =>
                            actions.changePeripheral(peripheral.id, 'baseAddress', event.target.value)}
                          placeholder="0x40001000"
                        />
                      </div>
                    </div>
                  </button>
                  <div className="flex flex-wrap items-center justify-end gap-2 lg:flex-none">
                    {!linked ? (
                      <Button type="button" variant="secondary" size="sm" onClick={() => actions.savePeripheralAsTemplate(peripheral.id)}>
                        保存为模板
                      </Button>
                    ) : null}
                    <Button type="button" variant="ghost" size="sm" onClick={() => actions.removePeripheral(peripheral.id)}>
                      删除实例
                    </Button>
                  </div>
                </div>
                {peripheral.expanded ? (
                  <div className="mt-5 grid gap-5">
                    <div className="grid gap-4 xl:grid-cols-[max(150px)_max(100px)_1fr]">
                      <FormField label="外设名称">
                        <Input
                          value={peripheral.name}
                          onChange={(event) => actions.changePeripheral(peripheral.id, 'name', event.target.value)}
                        />
                      </FormField>
                      {!linked ? (
                        <>
                          <FormField label="寄存器位宽">
                            <Input
                              value={peripheral.defaultRegisterSize}
                              onChange={(event) =>
                                actions.changePeripheral(peripheral.id, 'defaultRegisterSize', event.target.value)}
                              placeholder={device.size}
                            />
                          </FormField>
                          <FormField label="外设描述">
                            <Input
                              value={peripheral.description}
                              onChange={(event) =>
                                actions.changePeripheral(peripheral.id, 'description', event.target.value)}
                            />
                          </FormField>
                        </>
                      ) : null}
                    </div>

                    {!linked ? (
                      <RegisterEditorList
                        registers={peripheral.registers}
                        namePrefix="实例"
                        defaultRegisterSizePlaceholder={resolvedDefaultRegisterSize}
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
          <article className="editor-card rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-4">
            <p className="m-0 text-sm text-slate-500">暂无外设实例。可以新增独立外设，或先创建模板后从模板实例化。</p>
          </article>
        )}
      </div>
    </section>
  )
}
