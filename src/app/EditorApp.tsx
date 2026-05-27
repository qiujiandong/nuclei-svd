import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { StatusIssue, StatusTone } from '../components/StatusPanel'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { PageHeader } from '../components/ui/page-header'
import { Separator } from '../components/ui/separator'
import { cn } from '../lib/utils'
import { ConversionError } from '../lib/errors'
import {
  buildSvdInputFromEditor,
  cloneEditorRegister,
  createDefaultCustomPeripheral,
  createDefaultEditorDevice,
  createIRegionPeripherals,
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
  resolveIRegionPeripherals,
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
const editorStorageKey = 'nuclei-svd-editor-state'

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

function loadStoredEditorDevice() {
  if (typeof window === 'undefined') {
    return createDefaultEditorDevice()
  }

  try {
    const raw = window.localStorage.getItem(editorStorageKey)
    if (!raw) {
      return createDefaultEditorDevice()
    }

    const parsed = JSON.parse(raw) as unknown
    return isEditorDeviceExport(parsed) ? parsed.device : createDefaultEditorDevice()
  } catch {
    return createDefaultEditorDevice()
  }
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
  const [device, setDevice] = useState<EditorDevice>(() => loadStoredEditorDevice())
  const [state, setState] = useState<ConversionState>(initialState)
  const [templateSaveError, setTemplateSaveError] = useState<string | null>(null)
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      editorStorageKey,
      JSON.stringify({
        format: editorConfigFormat,
        version: 1,
        device,
      }),
    )
  }, [device])

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
    setTemplateSaveError(null)
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
    updateDevice((current) => ({
      ...current,
      iregionConfig: { ...current.iregionConfig, [field]: value },
      iregionPeripherals: resolveIRegionPeripherals(
        current.iregionBaseAddress,
        createIRegionPeripherals({ ...current.iregionConfig, [field]: value }),
      ),
    }))
  }

  const handleIRegionBaseAddressChange = (value: string) => {
    updateDevice((current) => ({
      ...current,
      iregionBaseAddress: value,
      iregionPeripherals: resolveIRegionPeripherals(
        value,
        createIRegionPeripherals(current.iregionConfig),
      ),
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
      ...(field === 'name' ? { groupName: value } : {}),
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
      ...(field === 'name' ? { groupName: value } : {}),
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
      peripherals: current.peripherals.filter((peripheral) => peripheral.templateId !== templateId),
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
    let duplicateTemplateName: string | null = null

    updateDevice((current) => {
      const sourcePeripheral = current.peripherals.find((peripheral) => peripheral.id === peripheralId)
      if (!sourcePeripheral || sourcePeripheral.templateId) return current

      const nextTemplate = createPeripheralTemplateFromInstance(sourcePeripheral)
      const hasDuplicateName = current.peripheralTemplates.some((template) => template.name.trim() === nextTemplate.name.trim())
      if (hasDuplicateName) {
        duplicateTemplateName = nextTemplate.name.trim()
        return current
      }

      return {
        ...current,
        peripheralTemplates: [
          ...current.peripheralTemplates,
          nextTemplate,
        ],
      }
    })

    if (duplicateTemplateName) {
      setTemplateSaveError(`模板名称 "${duplicateTemplateName}" 已存在。`)
      return
    }

    setTemplateSaveError(null)
    invalidateResult('已保存为模板，请重新执行校验与转换。')
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
          name: `REG${template.registers.filter((register) => !register.derivedFrom).length}`,
          addressOffset: formatNextOffset(template.registers),
          derivedFrom: undefined,
          expanded: false,
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
          name: `REG${peripheral.registers.filter((register) => !register.derivedFrom).length}`,
          addressOffset: formatNextOffset(peripheral.registers),
          derivedFrom: undefined,
          expanded: false,
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
          description: 'Description of this FIELD',
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
          description: 'Description of this FIELD',
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
    setTemplateSaveError(null)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(editorStorageKey)
    }
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
      setTemplateSaveError(null)
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
  const pageDescription = {
    'iregion-template': '配置 IREGION 中的不同模块是否启用，以及模块相关参数配置。',
    'peripheral-template': '维护可复用的外设模板，可供外设实例按需关联或复制。',
    'device-info': '填写 SoC 基础信息，包括设备名称、版本号等。',
    'peripheral-config': '创建并配置外设实例。',
    preview: '执行校验并查看最终 XML，确认输出后下载 .svd 文件。',
  } satisfies Record<AppPageId, string>

  return (
    <main className="app-shell min-h-screen px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
        <header className="rounded-[32px] border border-white/70 bg-white/80 px-6 py-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <img src={`${import.meta.env.BASE_URL}nuclei.svg`} alt="Nuclei" className="h-16 w-16 rounded-2xl border border-slate-200 bg-slate-50 p-3" />
              <div className="grid gap-2">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">A tool to generate CMSIS-SVD for SoC based on Nuclei CPU</p>
                <h1 className="m-0 text-3xl font-semibold tracking-tight">Nuclei SVD</h1>
                <p className="m-0 max-w-3xl text-sm leading-6 text-slate-600">
              为基于 Nuclei CPU 的 SoC 平台快速生成 CMSIS-SVD 文件，便于研发人员进行系统调试。
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white px-3 py-1.5 text-slate-600">IREGION {stats.iregionGroupCount}</Badge>
              <Badge variant="outline" className="bg-white px-3 py-1.5 text-slate-600">外设 {stats.customGroupCount}</Badge>
              <Badge variant="outline" className="bg-white px-3 py-1.5 text-slate-600">寄存器 {stats.registerCount}</Badge>
              <Badge variant="outline" className="bg-white px-3 py-1.5 text-slate-600">位域 {stats.fieldCount}</Badge>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside aria-label="配置导航" className="lg:sticky lg:top-4 lg:self-start">
            <Card className="rounded-[28px] bg-white/90">
              <CardContent className="p-4">
                <div className="grid gap-5">
                  {APP_NAV_GROUPS.map((group, index) => (
                    <div className="grid gap-3" key={group.title}>
                      <h2 className="m-0 text-sm font-semibold text-slate-900">{group.title}</h2>
                      <div className="grid gap-2">
                        {group.pages.map((page) => (
                          <button
                            type="button"
                            aria-label={page.title}
                            className={cn(
                              'rounded-2xl border px-4 py-3 text-left transition',
                              activePage === page.id
                                ? 'border-blue-200 bg-blue-50 text-blue-900 shadow-sm'
                                : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900',
                            )}
                            aria-current={activePage === page.id ? 'page' : undefined}
                            key={page.id}
                            onClick={() => {
                              setActivePage(page.id)
                              if (page.id === 'device-info') {
                                setDeviceInfoCollapsed(false)
                              }
                            }}
                          >
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{page.eyebrow}</div>
                            <div className="mt-1 text-sm font-semibold">{page.title}</div>
                          </button>
                        ))}
                      </div>
                      {index < APP_NAV_GROUPS.length - 1 ? <Separator /> : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="grid min-w-0 gap-6">
            <PageHeader
              eyebrow={activePageMeta.eyebrow}
              title={activePageMeta.title}
              description={pageDescription[activePage]}
              actions={
                <>
                  <Button type="button" variant="ghost" onClick={controllerGroups.device.actions.reset}>
                    重置设置
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => configInputRef.current?.click()}>
                    导入配置
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleExportConfig}>
                    导出配置
                  </Button>
                </>
              }
            />

            <input
              ref={configInputRef}
              className="visually-hidden"
              type="file"
              accept="application/json,.json"
              aria-label="导入配置文件"
              onChange={handleImportConfig}
            />

            <section className="rounded-[32px] border border-white/70 bg-white/90 p-5 shadow-[0_25px_60px_rgba(15,23,42,0.06)] sm:p-6">
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
                  templateSaveError={templateSaveError}
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
      </div>
    </main>
  )
}
