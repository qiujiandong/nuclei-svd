import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { StatusIssue, StatusTone } from '../components/StatusPanel'
import { ConversionError } from '../lib/errors'
import {
  buildSvdInputFromEditor,
  cloneEditorRegister,
  createDefaultCustomPeripheral,
  createDefaultEditorDevice,
  createDefaultPeripheralTemplate,
  createEmptyField,
  createPeripheralCopyFromTemplate,
  createPeripheralInstanceFromTemplate,
  createPeripheralTemplateFromInstance,
  type EditorDevice,
  type EditorField,
  type EditorIRegionConfig,
  type EditorPeripheral,
  type EditorRegister,
} from '../lib/editorModel'
import { transformToSvd } from '../lib/transformToSvd'
import { validateSvdInput } from '../lib/validate'
import { APP_NAV_GROUPS, DEFAULT_APP_PAGE, appPageMeta, type AppPageId } from './appNavigation'
import { DeviceInfoPage } from './pages/DeviceInfoPage'
import { IRegionTemplatePage } from './pages/IRegionTemplatePage'
import { PeripheralConfigPage } from './pages/PeripheralConfigPage'
import { PreviewPage } from './pages/PreviewPage'
import { PeripheralTemplatePage } from './pages/PeripheralTemplatePage'
import { useEditorController } from './useEditorController'
import { useFieldHints } from './useFieldHints'

export type ConversionState = {
  tone: StatusTone
  headline: string
  detail: string
  issues: StatusIssue[]
  xml: string
  downloadName: string
}

const initialState: ConversionState = {
  tone: 'idle',
  headline: '等待转换',
  detail: '设置完成后，点击“校验并转换”。',
  issues: [],
  xml: '',
  downloadName: 'nuclei-device.svd',
}

// const showIRegionDebugCard = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true'
const editorConfigFormat = 'nuclei-svd-editor-config'

function createCollapsedDefaultDevice() {
  const nextDevice = createDefaultEditorDevice()
  return {
    ...nextDevice,
    iregionExpanded: false,
    iregionPeripherals: nextDevice.iregionPeripherals.map((peripheral) => ({
      ...peripheral,
      expanded: false,
    })),
    peripheralTemplates: nextDevice.peripheralTemplates.map((template) => ({
      ...template,
      expanded: false,
    })),
    peripherals: nextDevice.peripherals.map((peripheral) => ({
      ...peripheral,
      expanded: false,
    })),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isEditorDeviceExport(value: unknown): value is { device: EditorDevice } {
  if (!isRecord(value) || value.format !== editorConfigFormat || !isRecord(value.device)) {
    return false
  }

  return (
    typeof value.device.name === 'string' &&
    Array.isArray(value.device.iregionPeripherals) &&
    Array.isArray(value.device.peripheralTemplates) &&
    Array.isArray(value.device.peripherals)
  )
}

function parseNonNegativeInteger(value: string) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null
}

function formatNextOffset(registers: EditorRegister[]) {
  const nextOffset =
    registers.reduce((maxOffset, register) => {
      const parsedOffset = parseNonNegativeInteger(register.addressOffset.trim())
      return parsedOffset === null ? maxOffset : Math.max(maxOffset, parsedOffset)
    }, -4) + 4

  return `0x${nextOffset.toString(16).toUpperCase()}`
}

function standaloneRegisterSeed(
  registers: EditorRegister[],
  registerTemplates: EditorRegister[] = [],
): EditorRegister {
  return registers.find((register) => !register.derivedFrom) ?? registerTemplates[0] ?? {
    id: 'seed',
    name: 'CTRL',
    description: 'Control register',
    addressOffset: '0x0',
    size: '',
    access: '',
    resetValue: '',
    resetMask: '',
    expanded: true,
    fields: [],
  }
}

export function EditorApp() {
  const [device, setDevice] = useState<EditorDevice>(() => createDefaultEditorDevice())
  const [state, setState] = useState<ConversionState>(initialState)
  const [activePage, setActivePage] = useState<AppPageId>(DEFAULT_APP_PAGE)
  const [deviceInfoCollapsed, setDeviceInfoCollapsed] = useState(true)
  const configInputRef = useRef<HTMLInputElement | null>(null)

  // const resolvedIRegionPeripherals = useMemo(
  //   () => resolveIRegionPeripherals(device.iregionBaseAddress, device.iregionPeripherals),
  //   [device.iregionBaseAddress, device.iregionPeripherals],
  // )

  const canDownload = state.tone === 'success' && state.xml.length > 0
  const stats = useMemo(() => {
    const iregionGroupCount = device.iregionPeripherals.length
    const customGroupCount = device.peripherals.length
    const registerCount = [...device.iregionPeripherals, ...device.peripherals].reduce(
      (total, peripheral) => total + peripheral.registers.length,
      0,
    )
    const fieldCount = [...device.iregionPeripherals, ...device.peripherals].reduce(
      (total, peripheral) =>
        total +
        peripheral.registers.reduce((registerTotal, register) => registerTotal + register.fields.length, 0),
      0,
    )
    return { iregionGroupCount, customGroupCount, registerCount, fieldCount }
  }, [device])

  useFieldHints()

  const invalidateResult = (detail = '配置已变更，请重新执行校验与转换。') => {
    setState((current) => {
      if (current.tone === 'idle' && current.xml.length === 0 && current.detail === detail) {
        return current
      }

      return {
        ...initialState,
        detail,
      }
    })
  }

  const updateDevice = (updater: (current: EditorDevice) => EditorDevice) => {
    setDevice((current) => updater(current))
    invalidateResult()
  }

  const updatePeripheral = (
    peripheralId: string,
    updater: (current: EditorPeripheral) => EditorPeripheral,
  ) => {
    updateDevice((current) => ({
      ...current,
      peripherals: current.peripherals.map((peripheral) =>
        peripheral.id === peripheralId ? updater(peripheral) : peripheral,
      ),
    }))
  }

  const updatePeripheralTemplate = (
    templateId: string,
    updater: (current: EditorPeripheral) => EditorPeripheral,
  ) => {
    updateDevice((current) => ({
      ...current,
      peripheralTemplates: current.peripheralTemplates.map((template) =>
        template.id === templateId ? updater(template) : template,
      ),
    }))
  }

  // const toggleIRegionPeripheral = (peripheralId: string) => {
  //   setDevice((current) => ({
  //     ...current,
  //     iregionPeripherals: current.iregionPeripherals.map((peripheral) =>
  //       peripheral.id === peripheralId ? { ...peripheral, expanded: !peripheral.expanded } : peripheral,
  //     ),
  //   }))
  // }
  //
  // const toggleIRegionCard = () => {
  //   setDevice((current) => ({
  //     ...current,
  //     iregionExpanded: !current.iregionExpanded,
  //   }))
  // }

  const updateTemplateRegister = (
    templateId: string,
    registerId: string,
    updater: (current: EditorRegister) => EditorRegister,
  ) => {
    updatePeripheralTemplate(templateId, (template) => ({
      ...template,
      registers: template.registers.map((register) =>
        register.id === registerId ? updater(register) : register,
      ),
    }))
  }

  const updateRegister = (
    peripheralId: string,
    registerId: string,
    updater: (current: EditorRegister) => EditorRegister,
  ) => {
    updatePeripheral(peripheralId, (peripheral) => ({
      ...peripheral,
      registers: peripheral.registers.map((register) =>
        register.id === registerId ? updater(register) : register,
      ),
    }))
  }

  const updateTemplateField = (
    templateId: string,
    registerId: string,
    fieldId: string,
    updater: (current: EditorField) => EditorField,
  ) => {
    updateTemplateRegister(templateId, registerId, (register) => ({
      ...register,
      fields: register.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
    }))
  }

  const updateField = (
    peripheralId: string,
    registerId: string,
    fieldId: string,
    updater: (current: EditorField) => EditorField,
  ) => {
    updateRegister(peripheralId, registerId, (register) => ({
      ...register,
      fields: register.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
    }))
  }

  const togglePeripheral = (peripheralId: string) => {
    setDevice((current) => ({
      ...current,
      peripherals: current.peripherals.map((peripheral) =>
        peripheral.id === peripheralId ? { ...peripheral, expanded: !peripheral.expanded } : peripheral,
      ),
    }))
  }

  const togglePeripheralTemplate = (templateId: string) => {
    setDevice((current) => ({
      ...current,
      peripheralTemplates: current.peripheralTemplates.map((template) =>
        template.id === templateId ? { ...template, expanded: !template.expanded } : template,
      ),
    }))
  }

  const toggleTemplateRegister = (templateId: string, registerId: string) => {
    setDevice((current) => ({
      ...current,
      peripheralTemplates: current.peripheralTemplates.map((template) =>
        template.id === templateId
          ? {
            ...template,
            registers: template.registers.map((register) =>
              register.id === registerId ? { ...register, expanded: !register.expanded } : register,
            ),
          }
          : template,
      ),
    }))
  }

  const toggleRegister = (peripheralId: string, registerId: string) => {
    setDevice((current) => ({
      ...current,
      peripherals: current.peripherals.map((peripheral) =>
        peripheral.id === peripheralId
          ? {
            ...peripheral,
            registers: peripheral.registers.map((register) =>
              register.id === registerId ? { ...register, expanded: !register.expanded } : register,
            ),
          }
          : peripheral,
      ),
    }))
  }

  const handleDeviceChange = (field: keyof EditorDevice, value: string) => {
    updateDevice((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleIRegionConfigChange = (field: keyof EditorIRegionConfig, value: string | boolean) => {
    const newConfigs = { ...device.iregionConfig, [field]: value }
    updateDevice((current) => ({
      ...current,
      iregionConfig: newConfigs,
    }))
  }

  const handleIRegionBaseAddressChange = (value: string) => {
    updateDevice((current) => ({
      ...current,
      iregionBaseAddress: value,
    }))
  }

  const handlePeripheralChange = (
    peripheralId: string,
    field: keyof Omit<
      EditorPeripheral,
      'id' | 'templateId' | 'expanded' | 'derivedFrom' | 'registerTemplates' | 'registers'
    >,
    value: string,
  ) => {
    updatePeripheral(peripheralId, (peripheral) => ({
      ...peripheral,
      [field]: value,
    }))
  }

  const handlePeripheralTemplateChange = (
    templateId: string,
    field: keyof Omit<
      EditorPeripheral,
      'id' | 'templateId' | 'expanded' | 'derivedFrom' | 'registerTemplates' | 'registers'
    >,
    value: string,
  ) => {
    updatePeripheralTemplate(templateId, (template) => ({
      ...template,
      [field]: value,
    }))
  }

  const handleTemplateRegisterChange = (
    templateId: string,
    registerId: string,
    field: keyof Omit<EditorRegister, 'id' | 'expanded' | 'fields'>,
    value: string,
  ) => {
    updateTemplateRegister(templateId, registerId, (register) => ({
      ...register,
      [field]: value,
    }))
  }

  const handleRegisterChange = (
    peripheralId: string,
    registerId: string,
    field: keyof Omit<EditorRegister, 'id' | 'expanded' | 'fields'>,
    value: string,
  ) => {
    updateRegister(peripheralId, registerId, (register) => ({
      ...register,
      [field]: value,
    }))
  }

  const handleTemplateFieldChange = (
    templateId: string,
    registerId: string,
    fieldId: string,
    field: keyof Omit<EditorField, 'id' | 'expanded'>,
    value: string,
  ) => {
    updateTemplateField(templateId, registerId, fieldId, (current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleFieldChange = (
    peripheralId: string,
    registerId: string,
    fieldId: string,
    field: keyof Omit<EditorField, 'id' | 'expanded'>,
    value: string,
  ) => {
    updateField(peripheralId, registerId, fieldId, (current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleAddPeripheral = () => {
    updateDevice((current) => ({
      ...current,
      peripherals: [
        ...current.peripherals,
        createDefaultCustomPeripheral(current.peripherals.length),
      ],
    }))
  }

  const handleAddPeripheralTemplate = () => {
    updateDevice((current) => ({
      ...current,
      peripheralTemplates: [
        ...current.peripheralTemplates,
        createDefaultPeripheralTemplate(current.peripheralTemplates.length),
      ],
    }))
  }

  const handleRemovePeripheralTemplate = (templateId: string) => {
    updateDevice((current) => ({
      ...current,
      peripheralTemplates: current.peripheralTemplates.filter((template) => template.id !== templateId),
      peripherals: current.peripherals.map((peripheral) =>
        peripheral.templateId === templateId ? { ...peripheral, templateId: undefined, derivedFrom: undefined } : peripheral,
      ),
    }))
  }

  const handleAddLinkedPeripheralFromTemplate = (templateId: string) => {
    updateDevice((current) => {
      const sourceTemplate = current.peripheralTemplates.find((template) => template.id === templateId)
      if (!sourceTemplate) return current

      return {
        ...current,
        peripherals: [
          ...current.peripherals,
          createPeripheralInstanceFromTemplate(sourceTemplate, current.peripherals.length),
        ],
      }
    })
  }

  const handleAddDetachedPeripheralFromTemplate = (templateId: string) => {
    updateDevice((current) => {
      const sourceTemplate = current.peripheralTemplates.find((template) => template.id === templateId)
      if (!sourceTemplate) return current

      return {
        ...current,
        peripherals: [
          ...current.peripherals,
          createPeripheralCopyFromTemplate(sourceTemplate, current.peripherals.length),
        ],
      }
    })
  }

  const handleSavePeripheralAsTemplate = (peripheralId: string) => {
    updateDevice((current) => {
      const sourcePeripheral = current.peripherals.find((peripheral) => peripheral.id === peripheralId)
      if (!sourcePeripheral || sourcePeripheral.templateId) return current

      return {
        ...current,
        peripheralTemplates: [
          ...current.peripheralTemplates,
          createPeripheralTemplateFromInstance(sourcePeripheral, current.peripheralTemplates.length),
        ],
      }
    })
  }

  const handleRemovePeripheral = (peripheralId: string) => {
    updateDevice((current) => ({
      ...current,
      peripherals: current.peripherals.filter((peripheral) => peripheral.id !== peripheralId),
    }))
  }

  const handleAddTemplateRegister = (templateId: string) => {
    updatePeripheralTemplate(templateId, (template) => ({
      ...template,
      expanded: true,
      registers: [
        ...template.registers,
        cloneEditorRegister(standaloneRegisterSeed(template.registers, template.registerTemplates), {
          name: `REG${template.registers.filter((register) => !register.derivedFrom).length + 1}`,
          addressOffset: formatNextOffset([...template.registerTemplates, ...template.registers]),
          derivedFrom: undefined,
          expanded: true,
        }),
      ],
    }))
  }

  const handleRemoveTemplateRegister = (templateId: string, registerId: string) => {
    updatePeripheralTemplate(templateId, (template) => ({
      ...template,
      registers: template.registers.filter((register) => register.id !== registerId),
    }))
  }

  const handleAddRegister = (peripheralId: string) => {
    updatePeripheral(peripheralId, (peripheral) => ({
      ...peripheral,
      expanded: true,
      registers: [
        ...peripheral.registers,
        cloneEditorRegister(standaloneRegisterSeed(peripheral.registers, peripheral.registerTemplates), {
          name: `REG${peripheral.registers.filter((register) => !register.derivedFrom).length + 1}`,
          addressOffset: formatNextOffset([...peripheral.registerTemplates, ...peripheral.registers]),
          derivedFrom: undefined,
          expanded: true,
        }),
      ],
    }))
  }

  const handleRemoveRegister = (peripheralId: string, registerId: string) => {
    updatePeripheral(peripheralId, (peripheral) => ({
      ...peripheral,
      registers: peripheral.registers.filter((register) => register.id !== registerId),
    }))
  }

  const handleAddTemplateField = (
    templateId: string,
    registerId: string,
    fieldCount: number,
  ) => {
    updateTemplateRegister(templateId, registerId, (register) => ({
      ...register,
      expanded: true,
      fields: [
        ...register.fields,
        createEmptyField({
          name: `FIELD${fieldCount}`,
          description: 'New bit field',
          bitOffset: String(fieldCount),
        }),
      ],
    }))
  }

  const handleAddField = (
    peripheralId: string,
    registerId: string,
    fieldCount: number,
  ) => {
    updateRegister(peripheralId, registerId, (register) => ({
      ...register,
      expanded: true,
      fields: [
        ...register.fields,
        createEmptyField({
          name: `FIELD${fieldCount}`,
          description: 'New bit field',
          bitOffset: String(fieldCount),
        }),
      ],
    }))
  }

  const handleRemoveTemplateField = (templateId: string, registerId: string, fieldId: string) => {
    updateTemplateRegister(templateId, registerId, (register) => ({
      ...register,
      fields: register.fields.filter((field) => field.id !== fieldId),
    }))
  }

  const handleRemoveField = (peripheralId: string, registerId: string, fieldId: string) => {
    updateRegister(peripheralId, registerId, (register) => ({
      ...register,
      fields: register.fields.filter((field) => field.id !== fieldId),
    }))
  }

  const handleConvert = () => {
    try {
      const input = buildSvdInputFromEditor(device)
      const normalized = validateSvdInput(input)
      const xml = transformToSvd(normalized)
      setState({
        tone: 'success',
        headline: '转换成功',
        detail: '可下载生成的 CMSIS-SVD 文件。',
        issues: [],
        xml,
        downloadName: normalized.metadata.downloadFileName,
      })
    } catch (error) {
      const issues =
        error instanceof ConversionError
          ? error.issues
          : [{ path: 'document', message: '发生未知错误，请检查输入或查看控制台。', rule: 'unknown' }]

      setState({
        tone: 'error',
        headline: '校验失败',
        detail: '请先修复以下错误，转换被阻止。',
        issues,
        xml: '',
        downloadName: 'nuclei-device.svd',
      })
    }
  }

  const handleReset = () => {
    setDevice(createCollapsedDefaultDevice())
    setActivePage(DEFAULT_APP_PAGE)
    setDeviceInfoCollapsed(true)
    setState(initialState)
  }

  const handleExportConfig = () => {
    const payload = JSON.stringify(
      {
        format: editorConfigFormat,
        version: 1,
        device,
      },
      null,
      2,
    )
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${device.name.trim() || 'nuclei-device'}-config.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleImportConfig = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    try {
      const parsed = JSON.parse(await file.text()) as unknown
      if (!isEditorDeviceExport(parsed)) {
        throw new Error('Unsupported editor config')
      }

      setDevice(parsed.device)
      setActivePage(DEFAULT_APP_PAGE)
      setDeviceInfoCollapsed(true)
      invalidateResult('已导入配置，请重新执行校验与转换。')
    } catch {
      setState({
        tone: 'error',
        headline: '导入失败',
        detail: '请选择由“导出配置”生成的 JSON 文件。',
        issues: [{ path: 'config', message: '无法读取编辑器配置文件。', rule: 'config.import' }],
        xml: '',
        downloadName: 'nuclei-device.svd',
      })
    }
  }

  const handleDownload = () => {
    if (!canDownload) return

    const blob = new Blob([state.xml], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = state.downloadName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const controllerGroups = useEditorController({
    device: {
      state: device,
      collapsed: deviceInfoCollapsed,
      actions: {
        setCollapsed: setDeviceInfoCollapsed,
        changeDevice: handleDeviceChange,
        changeIRegionConfig: handleIRegionConfigChange,
        changeIRegionBaseAddress: handleIRegionBaseAddressChange,
        reset: handleReset,
      },
    },
    template: {
      actions: {
        addPeripheralTemplate: handleAddPeripheralTemplate,
        removePeripheralTemplate: handleRemovePeripheralTemplate,
        generatePeripheralFromTemplate: handleAddLinkedPeripheralFromTemplate,
      },
    },
    peripheral: {
      stats,
      actions: {
        addPeripheral: handleAddPeripheral,
        removePeripheral: handleRemovePeripheral,
      },
    },
    register: {
      actions: {
        addRegister: handleAddRegister,
        removeRegister: handleRemoveRegister,
      },
    },
    conversion: {
      state,
      canDownload,
      actions: {
        convert: handleConvert,
        download: handleDownload,
      },
    },
  })

  const activePageMeta = appPageMeta(activePage)

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <div className="hero-brand">
          <img src={`${import.meta.env.BASE_URL}nuclei.svg`} alt="Nuclei" className="hero-logo" />
          <div>
            <p className="eyebrow">A tool to generate CMSIS-SVD for SoC based on Nuclei CPU</p>
            <div className="hero-title">
              <h1>Nuclei SVD</h1>
            </div>
            <p className="hero-copy">
              为基于 Nuclei CPU 的 SoC 平台快速生成 CMSIS-SVD 文件，便于研发人员进行系统调试。
            </p>
          </div>
        </div>
      </header>

      <section className="app-workspace">
        <aside className="app-sidebar" aria-label="配置导航">
          {APP_NAV_GROUPS.map((group) => (
            <div className="nav-group" key={group.title}>
              <h2>{group.title}</h2>
              <div className="nav-list">
                {group.pages.map((page) => (
                  <button
                    type="button"
                    className={`nav-item ${activePage === page.id ? 'active' : ''}`}
                    aria-current={activePage === page.id ? 'page' : undefined}
                    key={page.id}
                    onClick={() => {
                      setActivePage(page.id)
                      if (page.id === 'device-info') {
                        setDeviceInfoCollapsed(false)
                      }
                    }}
                  >
                    {page.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <div className="workspace-main">
          <section className="panel toolbar-panel" aria-label="全局操作">
            <div className="toolbar-row">
              <button type="button" className="ghost-button" onClick={controllerGroups.device.actions.reset}>
                重置设置
              </button>
              <div className="toolbar-actions">
                <button type="button" className="secondary" onClick={() => configInputRef.current?.click()}>
                  导入配置
                </button>
                <button type="button" className="secondary" onClick={handleExportConfig}>
                  导出配置
                </button>
                <input
                  ref={configInputRef}
                  className="visually-hidden"
                  type="file"
                  accept="application/json,.json"
                  aria-label="导入配置文件"
                  onChange={handleImportConfig}
                />
              </div>
            </div>
          </section>

          <section className="panel editor-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{activePageMeta.eyebrow}</p>
                <h2>{activePageMeta.title}</h2>
              </div>
            </div>

            {activePage === 'iregion-template' ? (
              <IRegionTemplatePage
                device={device}
                onIRegionConfigChange={controllerGroups.device.actions.changeIRegionConfig}
                onIRegionBaseAddressChange={controllerGroups.device.actions.changeIRegionBaseAddress}
              />
            ) : null}
            {activePage === 'peripheral-template' ? (
              <PeripheralTemplatePage
                device={device}
                actions={{
                  addPeripheralTemplate: handleAddPeripheralTemplate,
                  togglePeripheralTemplate,
                  removePeripheralTemplate: handleRemovePeripheralTemplate,
                  changePeripheralTemplate: handlePeripheralTemplateChange,
                  addTemplateRegister: handleAddTemplateRegister,
                  toggleTemplateRegister,
                  addTemplateField: handleAddTemplateField,
                  removeTemplateRegister: handleRemoveTemplateRegister,
                  changeTemplateRegister: handleTemplateRegisterChange,
                  changeTemplateField: handleTemplateFieldChange,
                  removeTemplateField: handleRemoveTemplateField,
                }}
              />
            ) : null}
            {activePage === 'device-info' ? (
              <DeviceInfoPage
                device={device}
                onDeviceChange={controllerGroups.device.actions.changeDevice}
                onIRegionBaseAddressChange={controllerGroups.device.actions.changeIRegionBaseAddress}
              />
            ) : null}
            {activePage === 'peripheral-config' ? (
              <PeripheralConfigPage
                device={device}
                customGroupCount={controllerGroups.peripheral.stats.customGroupCount}
                registerCount={controllerGroups.peripheral.stats.registerCount}
                fieldCount={controllerGroups.peripheral.stats.fieldCount}
                actions={{
                  addPeripheral: handleAddPeripheral,
                  addLinkedPeripheralFromTemplate: handleAddLinkedPeripheralFromTemplate,
                  addDetachedPeripheralFromTemplate: handleAddDetachedPeripheralFromTemplate,
                  savePeripheralAsTemplate: handleSavePeripheralAsTemplate,
                  togglePeripheral,
                  removePeripheral: handleRemovePeripheral,
                  changePeripheral: handlePeripheralChange,
                  addRegister: handleAddRegister,
                  toggleRegister,
                  addField: handleAddField,
                  removeRegister: handleRemoveRegister,
                  changeRegister: handleRegisterChange,
                  changeField: handleFieldChange,
                  removeField: handleRemoveField,
                }}
              />
            ) : null}
            {activePage === 'preview' ? (
              <PreviewPage
                canDownload={controllerGroups.conversion.canDownload}
                tone={controllerGroups.conversion.state.tone}
                headline={controllerGroups.conversion.state.headline}
                detail={controllerGroups.conversion.state.detail}
                issues={controllerGroups.conversion.state.issues}
                xml={controllerGroups.conversion.state.xml}
                onConvert={controllerGroups.conversion.actions.convert}
                onDownload={controllerGroups.conversion.actions.download}
              />
            ) : null}
          </section>
        </div>

      </section>
    </main>
  )
}
