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
              device.peripheralTemplates.map((template, templateIndex) => (
                <article
                  className={`editor-card rounded-3xl border p-5 ${templateColorClass(templateIndex)}`}
                  key={template.id}
                >
                  <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className="flex flex-1 items-center gap-3 text-left text-sm font-semibold text-slate-900"
                        aria-expanded={template.expanded}
                        aria-label={`${template.expanded ? '折叠' : '展开'}外设模板 ${summarizeName(template.name, `外设模板 ${templateIndex + 1}`)}`}
                        onClick={() => actions.togglePeripheralTemplate(template.id)}
                      >
                        <span className="text-slate-400">{template.expanded ? '▾' : '▸'}</span>
                        <span>{summarizeName(template.name, `外设模板 ${templateIndex + 1}`)}</span>
                      </button>
                    <div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => actions.removePeripheralTemplate(template.id)}>
                          删除模板
                      </Button>
                    </div>
                  </div>
                  {template.expanded ? (
                    <div className="mt-5 grid gap-5">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <FormField label="外设名称">
                          <Input
                              value={template.name}
                              onChange={(event) =>
                                actions.changePeripheralTemplate(template.id, 'name', event.target.value)}
                            />
                        </FormField>
                        <FormField label="groupName">
                          <Input
                              value={template.groupName}
                              onChange={(event) =>
                                actions.changePeripheralTemplate(template.id, 'groupName', event.target.value)}
                            />
                        </FormField>
                        <FormField label="外设描述" className="xl:col-span-1">
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
