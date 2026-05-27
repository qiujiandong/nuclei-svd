import type { EditorDevice } from '../../lib/editorModel'
import { Button } from '../../components/ui/button'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'
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
    <section className="grid gap-4">
      <section className="editor-card rounded-3xl border border-border bg-white p-6">
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">peripheral templates list</p>
              <h4 className="m-0 text-lg font-semibold text-slate-900">外设模板列表</h4>
            </div>
            <Button type="button" variant="secondary" onClick={actions.addPeripheralTemplate}>
              新增外设模板
            </Button>
          </div>
          <div className="grid gap-4">
            {device.peripheralTemplates.length > 0 ? (
              device.peripheralTemplates.map((template, templateIndex) => {
                const resolvedDefaultRegisterSize = template.defaultRegisterSize.trim() || device.size.trim()

                return (
                  <article className={`editor-card rounded-3xl border p-5 ${templateColorClass(templateIndex)}`} key={template.id}>
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="flex flex-1 items-start gap-3 text-left"
                        aria-expanded={template.expanded}
                        aria-label={`${template.expanded ? '折叠' : '展开'}外设模板 ${summarizeName(template.name, `外设模板 ${templateIndex + 1}`)}`}
                        onClick={() => actions.togglePeripheralTemplate(template.id)}
                      >
                        <span className="pt-1 text-slate-400">{template.expanded ? '▼' : '▶'}</span>
                        <div className="grid gap-1">
                          <span className="text-sm font-semibold text-slate-900">
                            {summarizeName(template.name, `外设模板 ${templateIndex + 1}`)}
                          </span>
                          <span className="text-sm text-slate-600">
                            {template.description.trim() || '暂无描述'}
                          </span>
                        </div>
                      </button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => actions.removePeripheralTemplate(template.id)}>
                        删除模板
                      </Button>
                    </div>
                    {template.expanded ? (
                      <div className="mt-5 grid gap-5">
                        <div className="grid gap-4 xl:grid-cols-[max(150px)_max(100px)_1fr]">
                          <FormField label="外设名称">
                            <Input
                              value={template.name}
                              onChange={(event) =>
                                actions.changePeripheralTemplate(template.id, 'name', event.target.value)}
                            />
                          </FormField>
                          <FormField label="寄存器位宽">
                            <Input
                              value={template.defaultRegisterSize}
                              onChange={(event) =>
                                actions.changePeripheralTemplate(template.id, 'defaultRegisterSize', event.target.value)}
                              placeholder={device.size}
                            />
                          </FormField>
                          <FormField label="外设描述" className="md:col-span-2 xl:col-span-1">
                            <Input
                              value={template.description}
                              onChange={(event) =>
                                actions.changePeripheralTemplate(template.id, 'description', event.target.value)}
                            />
                          </FormField>
                        </div>
                        <RegisterEditorList
                          registers={template.registers}
                          namePrefix="模板"
                          defaultRegisterSizePlaceholder={resolvedDefaultRegisterSize}
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
                )
              })
            ) : (
              <p className="m-0 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                暂无外设模板。先创建模板，再到 SoC 外设配置中实例化。
              </p>
            )}
          </div>
        </div>
      </section>
    </section>
  )
}
