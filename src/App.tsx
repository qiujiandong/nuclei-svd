import { useEffect, useMemo, useState } from 'react'
import tippy, { type Instance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import './App.css'
import { StatusPanel, type StatusIssue, type StatusTone } from './components/StatusPanel'
import { XmlPreview } from './components/XmlPreview'
import { ConversionError } from './lib/errors'
import {
  buildSvdInputFromEditor,
  cloneEditorRegister,
  createDefaultCustomPeripheral,
  createDefaultEditorDevice,
  createDefaultPeripheralTemplate,
  createDefaultRegisterTemplate,
  createEmptyField,
  createPeripheralInstanceFromTemplate,
  createRegisterInstanceFromTemplate,
  resolveIRegionPeripherals,
  type EditorAccess,
  type EditorDevice,
  type EditorField,
  type EditorPeripheral,
  type EditorRegister,
} from './lib/editorModel'
import { transformToSvd } from './lib/transformToSvd'
import { validateSvdInput } from './lib/validate'
import { ACCESS_VALUES } from './types/svd'

type ConversionState = {
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

const FIELD_HINTS: Record<string, string> = {
  设备名称: '生成 <device><name>，也会作为默认下载文件名的一部分。',
  版本: '生成 SVD device.version，用于标识当前设备描述版本。',
  addressUnitBits: '地址最小寻址单位位宽，CMSIS-SVD 常用值为 8。',
  width: '设备默认总线访问位宽，常见 Nuclei CPU 配置为 32。',
  '默认 size': '寄存器未单独设置 size 时继承该默认位宽。',
  '默认 access': '寄存器或位域未设置访问权限时继承该默认值。',
  '默认 resetValue': '寄存器未设置 resetValue 时继承该复位值。',
  '默认 resetMask': '寄存器未设置 resetMask 时继承该复位掩码。',
  设备描述: '生成 device.description，用于说明当前 Nuclei CPU/SoC 目标。',
  'IREGION 基地址': 'IREGION 所有内置寄存器组会以该地址为基准计算实际地址。',
  模板名称: '模板名称会被实例通过 derivedFrom 引用；改名后请确认实例引用关系。',
  name: '生成 SVD 中的 peripheral 名称，同一 device 下必须唯一。',
  groupName: '生成 SVD groupName，用于将相关 peripheral 归组显示。',
  baseAddress: '寄存器组基地址，寄存器绝对地址 = baseAddress + addressOffset。',
  description: '生成该项的 description，用于在调试工具中展示说明。',
  模板描述: '生成模板寄存器组或模板寄存器的 description。',
  寄存器名称: '生成 SVD register.name，同一寄存器组内必须唯一。',
  addressOffset: '寄存器相对当前寄存器组 baseAddress 的偏移地址。',
  寄存器描述: '生成寄存器 description，用于说明寄存器用途。',
  access: '访问权限；留空时继承设备或寄存器默认 access。',
  size: '寄存器位宽；留空时继承设备默认 size。',
  resetValue: '寄存器复位值；留空时继承设备默认 resetValue。',
  resetMask: '寄存器复位有效位掩码；留空时继承设备默认 resetMask。',
  位域名称: '生成 SVD field.name，同一寄存器内必须唯一。',
  bitOffset: '位域起始 bit，下标从 0 开始。',
  bitWidth: '位域宽度；bitOffset + bitWidth 不能超过寄存器 size。',
  位域描述: '生成位域 description，用于说明 bit 域含义。',
}

function labelHintFor(label: HTMLLabelElement) {
  const labelText = label.querySelector('span')?.textContent?.trim()
  return labelText ? FIELD_HINTS[labelText] : undefined
}

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

function summarizeName(value: string, fallback: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
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

function formatResolvedAddress(baseAddress: string, offset: string) {
  const parsedBase = Number(baseAddress)
  const parsedOffset = Number(offset)

  if (!Number.isInteger(parsedBase) || !Number.isInteger(parsedOffset)) {
    return '--'
  }

  return `0x${(parsedBase + parsedOffset).toString(16).toUpperCase()}`
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

function AccessSelect({
  value,
  onChange,
  label,
  className,
}: {
  value: EditorAccess
  onChange: (nextValue: EditorAccess) => void
  label: string
  className?: string
}) {
  return (
    <label className={className}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as EditorAccess)}>
        <option value="">继承默认</option>
        {ACCESS_VALUES.map((access) => (
          <option key={access} value={access}>
            {access}
          </option>
        ))}
      </select>
    </label>
  )
}

function App() {
  const [device, setDevice] = useState<EditorDevice>(() => createDefaultEditorDevice())
  const [state, setState] = useState<ConversionState>(initialState)
  const [deviceInfoCollapsed, setDeviceInfoCollapsed] = useState(false)

  const resolvedIRegionPeripherals = useMemo(
    () => resolveIRegionPeripherals(device.iregionBaseAddress, device.iregionPeripherals),
    [device.iregionBaseAddress, device.iregionPeripherals],
  )

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

  useEffect(() => {
    const instances: Instance[] = []
    const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('.app-shell label'))

    labels.forEach((label) => {
      if (!label.querySelector('input, select')) return

      const content = labelHintFor(label)
      if (!content) return

      label.classList.add('has-input-hint')
      label.setAttribute('data-input-hint', 'true')
      instances.push(
        tippy(label, {
          content,
          delay: [650, 0],
          duration: [150, 100],
          placement: 'top',
          theme: 'nuclei-field',
          appendTo: () => document.body,
        }),
      )
    })

    return () => {
      instances.forEach((instance) => instance.destroy())
    }
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

  const toggleIRegionPeripheral = (peripheralId: string) => {
    setDevice((current) => ({
      ...current,
      iregionPeripherals: current.iregionPeripherals.map((peripheral) =>
        peripheral.id === peripheralId ? { ...peripheral, expanded: !peripheral.expanded } : peripheral,
      ),
    }))
  }

  const toggleIRegionCard = () => {
    setDevice((current) => ({
      ...current,
      iregionExpanded: !current.iregionExpanded,
    }))
  }

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

  const updateTemplateRegisterTemplate = (
    templateId: string,
    registerTemplateId: string,
    updater: (current: EditorRegister) => EditorRegister,
  ) => {
    updatePeripheralTemplate(templateId, (template) => ({
      ...template,
      registerTemplates: template.registerTemplates.map((registerTemplate) =>
        registerTemplate.id === registerTemplateId ? updater(registerTemplate) : registerTemplate,
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

  const updateTemplateRegisterTemplateField = (
    templateId: string,
    registerTemplateId: string,
    fieldId: string,
    updater: (current: EditorField) => EditorField,
  ) => {
    updateTemplateRegisterTemplate(templateId, registerTemplateId, (registerTemplate) => ({
      ...registerTemplate,
      fields: registerTemplate.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
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

  const toggleTemplateRegisterTemplate = (templateId: string, registerTemplateId: string) => {
    setDevice((current) => ({
      ...current,
      peripheralTemplates: current.peripheralTemplates.map((template) =>
        template.id === templateId
          ? {
              ...template,
              registerTemplates: template.registerTemplates.map((registerTemplate) =>
                registerTemplate.id === registerTemplateId
                  ? { ...registerTemplate, expanded: !registerTemplate.expanded }
                  : registerTemplate,
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

  const handleIRegionBaseAddressChange = (value: string) => {
    updateDevice((current) => ({
      ...current,
      iregionBaseAddress: value,
    }))
  }

  const handlePeripheralChange = (
    peripheralId: string,
    field: keyof Omit<EditorPeripheral, 'id' | 'expanded' | 'registers'>,
    value: string,
  ) => {
    updatePeripheral(peripheralId, (peripheral) => ({
      ...peripheral,
      [field]: value,
    }))
  }

  const handlePeripheralTemplateChange = (
    templateId: string,
    field: keyof Omit<EditorPeripheral, 'id' | 'expanded' | 'registers'>,
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

  const handleTemplateRegisterTemplateChange = (
    templateId: string,
    registerTemplateId: string,
    field: keyof Omit<EditorRegister, 'id' | 'expanded' | 'fields'>,
    value: string,
  ) => {
    updateTemplateRegisterTemplate(templateId, registerTemplateId, (registerTemplate) => ({
      ...registerTemplate,
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

  const handleTemplateRegisterTemplateFieldChange = (
    templateId: string,
    registerTemplateId: string,
    fieldId: string,
    field: keyof Omit<EditorField, 'id' | 'expanded'>,
    value: string,
  ) => {
    updateTemplateRegisterTemplateField(templateId, registerTemplateId, fieldId, (current) => ({
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
    updateDevice((current) => {
      const removedTemplate = current.peripheralTemplates.find((template) => template.id === templateId)
      const removedTemplateName = removedTemplate?.name.trim()

      return {
        ...current,
        peripheralTemplates: current.peripheralTemplates.filter((template) => template.id !== templateId),
        peripherals: removedTemplateName
          ? current.peripherals.filter((peripheral) => peripheral.derivedFrom !== removedTemplateName)
          : current.peripherals,
      }
    })
  }

  const handleGeneratePeripheralFromTemplate = (templateId: string) => {
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

  const updateRegisterTemplate = (
    peripheralId: string,
    templateId: string,
    updater: (current: EditorRegister) => EditorRegister,
  ) => {
    updatePeripheral(peripheralId, (peripheral) => ({
      ...peripheral,
      registerTemplates: peripheral.registerTemplates.map((template) =>
        template.id === templateId ? updater(template) : template,
      ),
    }))
  }

  const updateRegisterTemplateField = (
    peripheralId: string,
    templateId: string,
    fieldId: string,
    updater: (current: EditorField) => EditorField,
  ) => {
    updateRegisterTemplate(peripheralId, templateId, (template) => ({
      ...template,
      fields: template.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
    }))
  }

  const toggleRegisterTemplate = (peripheralId: string, templateId: string) => {
    setDevice((current) => ({
      ...current,
      peripherals: current.peripherals.map((peripheral) =>
        peripheral.id === peripheralId
          ? {
              ...peripheral,
              registerTemplates: peripheral.registerTemplates.map((template) =>
                template.id === templateId ? { ...template, expanded: !template.expanded } : template,
              ),
            }
          : peripheral,
      ),
    }))
  }

  const handleRegisterTemplateChange = (
    peripheralId: string,
    templateId: string,
    field: keyof Omit<EditorRegister, 'id' | 'expanded' | 'fields'>,
    value: string,
  ) => {
    updateRegisterTemplate(peripheralId, templateId, (template) => ({
      ...template,
      [field]: value,
    }))
  }

  const handleRegisterTemplateFieldChange = (
    peripheralId: string,
    templateId: string,
    fieldId: string,
    field: keyof Omit<EditorField, 'id' | 'expanded'>,
    value: string,
  ) => {
    updateRegisterTemplateField(peripheralId, templateId, fieldId, (current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleAddRegisterTemplate = (peripheralId: string, templateCount: number) => {
    updatePeripheral(peripheralId, (peripheral) => ({
      ...peripheral,
      expanded: true,
      registerTemplates: [
        ...peripheral.registerTemplates,
        createDefaultRegisterTemplate(templateCount),
      ],
    }))
  }

  const handleRemoveRegisterTemplate = (peripheralId: string, templateId: string) => {
    updatePeripheral(peripheralId, (peripheral) => {
      const removedTemplate = peripheral.registerTemplates.find((template) => template.id === templateId)
      const removedTemplateName = removedTemplate?.name.trim()

      return {
        ...peripheral,
        registerTemplates: peripheral.registerTemplates.filter((template) => template.id !== templateId),
        registers: removedTemplateName
          ? peripheral.registers.filter((register) => register.derivedFrom !== removedTemplateName)
          : peripheral.registers,
      }
    })
  }

  const handleGenerateRegisterFromTemplate = (peripheralId: string, templateId: string) => {
    updatePeripheral(peripheralId, (peripheral) => {
      const sourceTemplate = peripheral.registerTemplates.find((template) => template.id === templateId)
      if (!sourceTemplate) return peripheral

      return {
        ...peripheral,
        registers: [
          ...peripheral.registers,
          createRegisterInstanceFromTemplate(
            sourceTemplate,
            formatNextOffset([...peripheral.registerTemplates, ...peripheral.registers]),
            peripheral.registers.length,
          ),
        ],
      }
    })
  }

  const handleAddRegisterTemplateField = (
    peripheralId: string,
    templateId: string,
    fieldCount: number,
  ) => {
    updateRegisterTemplate(peripheralId, templateId, (template) => ({
      ...template,
      expanded: true,
      fields: [
        ...template.fields,
        createEmptyField({
          name: `FIELD${fieldCount}`,
          description: 'New bit field',
          bitOffset: String(fieldCount),
        }),
      ],
    }))
  }

  const handleRemoveRegisterTemplateField = (
    peripheralId: string,
    templateId: string,
    fieldId: string,
  ) => {
    updateRegisterTemplate(peripheralId, templateId, (template) => ({
      ...template,
      fields: template.fields.filter((field) => field.id !== fieldId),
    }))
  }

  const handleRemovePeripheral = (peripheralId: string) => {
    updateDevice((current) => ({
      ...current,
      peripherals: current.peripherals.filter((peripheral) => peripheral.id !== peripheralId),
    }))
  }

  const handleAddTemplateRegisterTemplate = (templateId: string, templateCount: number) => {
    updatePeripheralTemplate(templateId, (template) => ({
      ...template,
      expanded: true,
      registerTemplates: [
        ...template.registerTemplates,
        createDefaultRegisterTemplate(templateCount),
      ],
    }))
  }

  const handleRemoveTemplateRegisterTemplate = (templateId: string, registerTemplateId: string) => {
    updatePeripheralTemplate(templateId, (template) => {
      const removedTemplate = template.registerTemplates.find(
        (registerTemplate) => registerTemplate.id === registerTemplateId,
      )
      const removedTemplateName = removedTemplate?.name.trim()

      return {
        ...template,
        registerTemplates: template.registerTemplates.filter(
          (registerTemplate) => registerTemplate.id !== registerTemplateId,
        ),
        registers: removedTemplateName
          ? template.registers.filter((register) => register.derivedFrom !== removedTemplateName)
          : template.registers,
      }
    })
  }

  const handleGenerateTemplateRegisterFromTemplate = (
    templateId: string,
    registerTemplateId: string,
  ) => {
    updatePeripheralTemplate(templateId, (template) => {
      const sourceTemplate = template.registerTemplates.find(
        (registerTemplate) => registerTemplate.id === registerTemplateId,
      )
      if (!sourceTemplate) return template

      return {
        ...template,
        registers: [
          ...template.registers,
          createRegisterInstanceFromTemplate(
            sourceTemplate,
            formatNextOffset([...template.registerTemplates, ...template.registers]),
            template.registers.length,
          ),
        ],
      }
    })
  }

  const handleAddTemplateRegister = (templateId: string, registerCount: number) => {
    updatePeripheralTemplate(templateId, (template) => ({
      ...template,
      expanded: true,
      registers: [
        ...template.registers,
        cloneEditorRegister(template.registers[0] ?? template.registerTemplates[0] ?? {
          id: 'seed',
          name: 'CTRL',
          description: 'Control register',
          addressOffset: '0x0',
          size: '',
          access: '',
          resetValue: '',
          resetMask: '',
          expanded: true,
          fields: [createEmptyField()],
        }, {
          name: `REG${registerCount}`,
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

  const handleAddRegister = (peripheralId: string, registerCount: number) => {
    updatePeripheral(peripheralId, (peripheral) => ({
      ...peripheral,
      expanded: true,
      registers: [
        ...peripheral.registers,
        cloneEditorRegister(peripheral.registers[0] ?? {
          id: 'seed',
          name: 'CTRL',
          description: 'Control register',
          addressOffset: '0x0',
          size: '',
          access: '',
          resetValue: '',
          resetMask: '',
          expanded: true,
          fields: [createEmptyField()],
        }, {
          name: `REG${registerCount}`,
          addressOffset: formatNextOffset(peripheral.registers),
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

  const handleAddTemplateRegisterTemplateField = (
    templateId: string,
    registerTemplateId: string,
    fieldCount: number,
  ) => {
    updateTemplateRegisterTemplate(templateId, registerTemplateId, (registerTemplate) => ({
      ...registerTemplate,
      expanded: true,
      fields: [
        ...registerTemplate.fields,
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

  const handleRemoveTemplateRegisterTemplateField = (
    templateId: string,
    registerTemplateId: string,
    fieldId: string,
  ) => {
    updateTemplateRegisterTemplate(templateId, registerTemplateId, (registerTemplate) => ({
      ...registerTemplate,
      fields: registerTemplate.fields.filter((field) => field.id !== fieldId),
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
    setState(initialState)
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
        <div className="hero-actions">
          <button type="button" className="primary" onClick={handleConvert}>
            校验并转换
          </button>
          <StatusPanel
            tone={state.tone}
            headline={state.headline}
            detail={state.detail}
            issues={state.issues}
          />
          <button type="button" className="secondary" onClick={handleDownload} disabled={!canDownload}>
            下载 .svd
          </button>
        </div>
      </header>

      <section className="metrics-bar" aria-label="当前寄存器配置统计">
        <span>设备：{summarizeName(device.name, '未命名设备')}</span>
        <span>{stats.iregionGroupCount} 个 IREGION 寄存器组</span>
        <span>{stats.customGroupCount} 个自定义寄存器组</span>
        <span>{stats.registerCount} 个寄存器</span>
        <span>{stats.fieldCount} 个位域</span>
      </section>

      <section className="layout-grid">
        <section className="panel editor-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Interactive register designer</p>
              <h2>寄存器设置界面</h2>
            </div>
            <div className="card-actions">
              <button type="button" className="secondary" onClick={handleReset}>
                重置设置
              </button>
            </div>
          </div>

          <div className={`editor-workspace ${deviceInfoCollapsed ? 'device-info-collapsed' : ''}`}>
            <aside className="device-info-panel" aria-label="设备基础信息设置">
              <div className="device-info-header">
                <div>
                  <p className="eyebrow">Device profile</p>
                  <h3>设备基础信息</h3>
                </div>
                <button
                  type="button"
                  className="secondary collapse-side-button"
                  aria-expanded={!deviceInfoCollapsed}
                  aria-label={deviceInfoCollapsed ? '展开设备基础信息侧栏' : '向左折叠设备基础信息'}
                  onClick={() => setDeviceInfoCollapsed((current) => !current)}
                >
                  {deviceInfoCollapsed ? '›' : '‹'}
                </button>
              </div>
              {deviceInfoCollapsed ? (
                <button
                  type="button"
                  className="device-info-rail"
                  aria-label="展开设备基础信息"
                  onClick={() => setDeviceInfoCollapsed(false)}
                >
                  <span>设备基础信息</span>
                </button>
              ) : (
                <div className="form-grid device-form-grid">
                  <label>
                    <span>设备名称</span>
                    <input
                      value={device.name}
                      onChange={(event) => handleDeviceChange('name', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>版本</span>
                    <input
                      value={device.version}
                      onChange={(event) => handleDeviceChange('version', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>addressUnitBits</span>
                    <input
                      value={device.addressUnitBits}
                      onChange={(event) => handleDeviceChange('addressUnitBits', event.target.value)}
                      inputMode="numeric"
                    />
                  </label>
                  <label>
                    <span>width</span>
                    <input
                      value={device.width}
                      onChange={(event) => handleDeviceChange('width', event.target.value)}
                      inputMode="numeric"
                    />
                  </label>
                  <label>
                    <span>默认 size</span>
                    <input
                      value={device.size}
                      onChange={(event) => handleDeviceChange('size', event.target.value)}
                      inputMode="numeric"
                    />
                  </label>
                  <AccessSelect
                    value={device.access}
                    onChange={(nextValue) => handleDeviceChange('access', nextValue)}
                    label="默认 access"
                  />
                  <label>
                    <span>默认 resetValue</span>
                    <input
                      value={device.resetValue}
                      onChange={(event) => handleDeviceChange('resetValue', event.target.value)}
                      placeholder="0x00000000"
                    />
                  </label>
                  <label>
                    <span>默认 resetMask</span>
                    <input
                      value={device.resetMask}
                      onChange={(event) => handleDeviceChange('resetMask', event.target.value)}
                      placeholder="0xFFFFFFFF"
                    />
                  </label>
                  <label className="device-span-full">
                    <span>设备描述</span>
                    <input
                      value={device.description}
                      onChange={(event) => handleDeviceChange('description', event.target.value)}
                    />
                  </label>
                </div>
              )}
            </aside>
            <div className="register-settings-panel">
          <section className="editor-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">IREGION map</p>
                <h3>IREGION</h3>
              </div>
            </div>

            <article className="editor-card readonly-card">
              <div className="card-header">
                <button
                  type="button"
                  className="collapse-toggle"
                  aria-expanded={device.iregionExpanded}
                  aria-label={device.iregionExpanded ? '折叠 IREGION' : '展开 IREGION'}
                  onClick={toggleIRegionCard}
                >
                  <span>{device.iregionExpanded ? '▾' : '▸'}</span>
                  <span>IREGION</span>
                </button>
                <div className="readonly-header-controls">
                  <label className="inline-field inline-medium">
                    <span>IREGION 基地址</span>
                    <input
                      aria-label="IREGION 基地址"
                      value={device.iregionBaseAddress}
                      onChange={(event) => handleIRegionBaseAddressChange(event.target.value)}
                      placeholder="0x18000000"
                    />
                  </label>
                  <div className="readonly-meta">
                    <span>寄存器组：{stats.iregionGroupCount}</span>
                  </div>
                </div>
              </div>

              {device.iregionExpanded ? (
                <div className="card-body">
                  <div className="readonly-toolbar">
                    <span className="readonly-note">
                      IREGION 中的寄存器组来自 `IREGION.pdf`，只读展示，实际地址 = 基地址 + 组偏移。
                    </span>
                  </div>

                  <div className="card-stack">
                    {resolvedIRegionPeripherals.map((peripheral, peripheralIndex) => (
                      <article className="editor-card group-card readonly-card" key={peripheral.id}>
                        <div className="card-header">
                          <button
                            type="button"
                            className="collapse-toggle"
                            aria-expanded={peripheral.expanded}
                            aria-label={`${peripheral.expanded ? '折叠' : '展开'}寄存器组 ${summarizeName(peripheral.name, `IREGION 组 ${peripheralIndex + 1}`)}`}
                            onClick={() => toggleIRegionPeripheral(peripheral.id)}
                          >
                            <span>{peripheral.expanded ? '▾' : '▸'}</span>
                            <span>{summarizeName(peripheral.name, `IREGION 组 ${peripheralIndex + 1}`)}</span>
                          </button>
                          <div className="readonly-meta">
                            <span>实际基地址：{peripheral.baseAddress}</span>
                            <span>寄存器数：{peripheral.registers.length}</span>
                          </div>
                        </div>

                        {peripheral.expanded ? (
                          <div className="card-body">
                            <div className="readonly-grid">
                              <div>
                                <span className="readonly-label">groupName</span>
                                <strong>{peripheral.groupName || '-'}</strong>
                              </div>
                              <div>
                                <span className="readonly-label">实际基地址</span>
                                <strong>{peripheral.baseAddress}</strong>
                              </div>
                              <div className="readonly-wide">
                                <span className="readonly-label">说明</span>
                                <strong>{peripheral.description}</strong>
                              </div>
                            </div>

                            <div className="field-table-wrap">
                              <table className="field-table readonly-table">
                                <thead>
                                  <tr>
                                    <th scope="col">寄存器名称</th>
                                    <th scope="col">addressOffset</th>
                                    <th scope="col">实际地址</th>
                                    <th scope="col">size</th>
                                    <th scope="col">access</th>
                                    <th scope="col">说明</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {peripheral.registers.map((register) => (
                                    <tr key={register.id}>
                                      <td>{register.name}</td>
                                      <td>{register.addressOffset}</td>
                                      <td>{formatResolvedAddress(peripheral.baseAddress, register.addressOffset)}</td>
                                      <td>{register.size || device.size}</td>
                                      <td>{register.access || device.access || 'inherit'}</td>
                                      <td>{register.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          </section>

          <section className="editor-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Custom register groups</p>
                <h3>自定义寄存器组</h3>
              </div>
            </div>

            <div className="custom-group-columns">
              <section className="editor-card column-panel">
                <div className="column-header">
                  <div>
                    <p className="eyebrow">Group templates</p>
                    <h4>寄存器组模板</h4>
                  </div>
                  <button type="button" className="secondary" onClick={handleAddPeripheralTemplate}>
                    新增寄存器组模板
                  </button>
                </div>
                <div className="nested-stack">
                  {device.peripheralTemplates.map((template, templateIndex) => (
                    <article className={`editor-card group-card template-linked-card ${templateColorClass(templateIndex)}`} key={template.id}>
                      <div className="card-header">
                        <button
                          type="button"
                          className="collapse-toggle"
                          aria-expanded={template.expanded}
                          aria-label={`${template.expanded ? '折叠' : '展开'}寄存器组模板 ${summarizeName(template.name, `寄存器组模板 ${templateIndex + 1}`)}`}
                          onClick={() => togglePeripheralTemplate(template.id)}
                        >
                          <span>{template.expanded ? '▾' : '▸'}</span>
                          <span>{summarizeName(template.name, `寄存器组模板 ${templateIndex + 1}`)}</span>
                        </button>
                        <div className="card-actions">
                          <button
                            type="button"
                            className="secondary"
                            onClick={() =>
                              handleAddTemplateRegisterTemplate(
                                template.id,
                                template.registerTemplates.length,
                              )
                            }
                          >
                            新增寄存器模板
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => handleAddTemplateRegister(template.id, template.registers.length + 1)}
                          >
                            新增寄存器
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => handleGeneratePeripheralFromTemplate(template.id)}
                          >
                            生成实例
                          </button>
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => handleRemovePeripheralTemplate(template.id)}
                          >
                            删除模板
                          </button>
                        </div>
                      </div>
                      {template.expanded ? (
                        <div className="card-body">
                          <div className="inline-field-row">
                            <label className="inline-field inline-medium">
                              <span>模板名称</span>
                              <input
                                aria-label="寄存器组模板名称"
                                value={template.name}
                                onChange={(event) =>
                                  handlePeripheralTemplateChange(template.id, 'name', event.target.value)
                                }
                              />
                            </label>
                            <label className="inline-field inline-small">
                              <span>groupName</span>
                              <input
                                value={template.groupName}
                                onChange={(event) =>
                                  handlePeripheralTemplateChange(template.id, 'groupName', event.target.value)
                                }
                              />
                            </label>
                            <label className="inline-field inline-wide">
                              <span>模板描述</span>
                              <input
                                value={template.description}
                                onChange={(event) =>
                                  handlePeripheralTemplateChange(template.id, 'description', event.target.value)
                                }
                              />
                            </label>
                          </div>
                          <div className="nested-stack">
                            <section className="editor-card column-panel">
                              <div className="column-header">
                                <div>
                                  <p className="eyebrow">Register templates</p>
                                  <h4>寄存器模板</h4>
                                </div>
                                <span className="column-hint">模板寄存器可生成 derivedFrom 实例。</span>
                              </div>
                              <div className="nested-stack">
                                {template.registerTemplates.map((registerTemplate, registerTemplateIndex) => (
                                  <article
                                    className={`editor-card register-card register-linked-card ${registerTemplateColorClass(registerTemplateIndex)}`}
                                    key={registerTemplate.id}
                                  >
                                    <div className="card-header">
                                      <button
                                        type="button"
                                        className="collapse-toggle"
                                        aria-expanded={registerTemplate.expanded}
                                        aria-label={`${registerTemplate.expanded ? '折叠' : '展开'}寄存器模板 ${summarizeName(registerTemplate.name, `寄存器模板 ${registerTemplateIndex + 1}`)}`}
                                        onClick={() => toggleTemplateRegisterTemplate(template.id, registerTemplate.id)}
                                      >
                                        <span>{registerTemplate.expanded ? '▾' : '▸'}</span>
                                        <span>{summarizeName(registerTemplate.name, `寄存器模板 ${registerTemplateIndex + 1}`)}</span>
                                      </button>
                                      <div className="card-actions">
                                        <button
                                          type="button"
                                          className="secondary"
                                          onClick={() =>
                                            handleAddTemplateRegisterTemplateField(
                                              template.id,
                                              registerTemplate.id,
                                              registerTemplate.fields.length + 1,
                                            )
                                          }
                                        >
                                          新增位域
                                        </button>
                                        <button
                                          type="button"
                                          className="secondary"
                                          onClick={() =>
                                            handleGenerateTemplateRegisterFromTemplate(template.id, registerTemplate.id)
                                          }
                                        >
                                          生成寄存器实例
                                        </button>
                                        <button
                                          type="button"
                                          className="ghost-button"
                                          onClick={() => handleRemoveTemplateRegisterTemplate(template.id, registerTemplate.id)}
                                        >
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
                                              onChange={(event) =>
                                                handleTemplateRegisterTemplateChange(
                                                  template.id,
                                                  registerTemplate.id,
                                                  'name',
                                                  event.target.value,
                                                )
                                              }
                                            />
                                          </label>
                                          <label className="inline-field inline-small">
                                            <span>addressOffset</span>
                                            <input
                                              value={registerTemplate.addressOffset}
                                              onChange={(event) =>
                                                handleTemplateRegisterTemplateChange(
                                                  template.id,
                                                  registerTemplate.id,
                                                  'addressOffset',
                                                  event.target.value,
                                                )
                                              }
                                            />
                                          </label>
                                          <label className="inline-field inline-wide">
                                            <span>模板描述</span>
                                            <input
                                              value={registerTemplate.description}
                                              onChange={(event) =>
                                                handleTemplateRegisterTemplateChange(
                                                  template.id,
                                                  registerTemplate.id,
                                                  'description',
                                                  event.target.value,
                                                )
                                              }
                                            />
                                          </label>
                                        </div>
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
                                              {registerTemplate.fields.map((field, fieldIndex) => (
                                                <tr key={field.id}>
                                                  <td>
                                                    <input
                                                      aria-label={`寄存器模板位域名称 ${fieldIndex + 1}`}
                                                      value={field.name}
                                                      onChange={(event) =>
                                                        handleTemplateRegisterTemplateFieldChange(
                                                          template.id,
                                                          registerTemplate.id,
                                                          field.id,
                                                          'name',
                                                          event.target.value,
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <input
                                                      value={field.bitOffset}
                                                      onChange={(event) =>
                                                        handleTemplateRegisterTemplateFieldChange(
                                                          template.id,
                                                          registerTemplate.id,
                                                          field.id,
                                                          'bitOffset',
                                                          event.target.value,
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <input
                                                      value={field.bitWidth}
                                                      onChange={(event) =>
                                                        handleTemplateRegisterTemplateFieldChange(
                                                          template.id,
                                                          registerTemplate.id,
                                                          field.id,
                                                          'bitWidth',
                                                          event.target.value,
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <input
                                                      value={field.description}
                                                      onChange={(event) =>
                                                        handleTemplateRegisterTemplateFieldChange(
                                                          template.id,
                                                          registerTemplate.id,
                                                          field.id,
                                                          'description',
                                                          event.target.value,
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <button
                                                      type="button"
                                                      className="ghost-button table-action"
                                                      onClick={() =>
                                                        handleRemoveTemplateRegisterTemplateField(
                                                          template.id,
                                                          registerTemplate.id,
                                                          field.id,
                                                        )
                                                      }
                                                    >
                                                      删除
                                                    </button>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    ) : null}
                                  </article>
                                ))}
                              </div>
                            </section>
                            <section className="editor-card column-panel">
                              <div className="column-header">
                                <div>
                                  <p className="eyebrow">Register instances</p>
                                  <h4>寄存器实例</h4>
                                </div>
                                <span className="column-hint">实例可继承模板，也可作为普通寄存器。</span>
                              </div>
                              {template.registers.map((register, registerIndex) => (
                                <article
                                  className={`editor-card register-card ${register.derivedFrom ? `register-linked-card ${derivedRegisterColorClass(register.derivedFrom, template.registerTemplates)}` : ''}`}
                                  key={register.id}
                                >
                                <div className="card-header">
                                  <button
                                    type="button"
                                    className="collapse-toggle"
                                    aria-expanded={register.expanded}
                                    aria-label={`${register.expanded ? '折叠' : '展开'}寄存器 ${summarizeName(register.name, `寄存器 ${registerIndex + 1}`)}`}
                                    onClick={() => toggleTemplateRegister(template.id, register.id)}
                                  >
                                    <span>{register.expanded ? '▾' : '▸'}</span>
                                    <span>{summarizeName(register.name, `寄存器 ${registerIndex + 1}`)}</span>
                                  </button>
                                  <div className="card-actions">
                                    <button
                                      type="button"
                                      className="secondary"
                                      onClick={() =>
                                        handleAddTemplateField(template.id, register.id, register.fields.length + 1)
                                      }
                                      disabled={Boolean(register.derivedFrom)}
                                    >
                                      新增位域
                                    </button>
                                    <button
                                      type="button"
                                      className="ghost-button"
                                      onClick={() => handleRemoveTemplateRegister(template.id, register.id)}
                                    >
                                      删除寄存器
                                    </button>
                                  </div>
                                </div>
                                {register.expanded ? (
                                  <div className="card-body">
                                    <div className="inline-field-row">
                                      <label className="inline-field inline-medium">
                                        <span>寄存器名称</span>
                                        <input
                                          aria-label="寄存器名称"
                                          value={register.name}
                                          onChange={(event) =>
                                            handleTemplateRegisterChange(
                                              template.id,
                                              register.id,
                                              'name',
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </label>
                                      <label className="inline-field inline-small">
                                        <span>addressOffset</span>
                                        <input
                                          value={register.addressOffset}
                                          onChange={(event) =>
                                            handleTemplateRegisterChange(
                                              template.id,
                                              register.id,
                                              'addressOffset',
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </label>
                                      <label className="inline-field inline-wide">
                                        <span>寄存器描述</span>
                                        <input
                                          value={register.description}
                                          onChange={(event) =>
                                            handleTemplateRegisterChange(
                                              template.id,
                                              register.id,
                                              'description',
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </label>
                                    </div>
                                    <div className="readonly-meta">
                                      <span>derivedFrom：{register.derivedFrom || '-'}</span>
                                    </div>
                                    {!register.derivedFrom ? (
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
                                          {register.fields.map((field, fieldIndex) => (
                                            <tr key={field.id}>
                                              <td>
                                                <input
                                                  aria-label={`模板位域名称 ${fieldIndex + 1}`}
                                                  value={field.name}
                                                  onChange={(event) =>
                                                    handleTemplateFieldChange(
                                                      template.id,
                                                      register.id,
                                                      field.id,
                                                      'name',
                                                      event.target.value,
                                                    )
                                                  }
                                                />
                                              </td>
                                              <td>
                                                <input
                                                  value={field.bitOffset}
                                                  onChange={(event) =>
                                                    handleTemplateFieldChange(
                                                      template.id,
                                                      register.id,
                                                      field.id,
                                                      'bitOffset',
                                                      event.target.value,
                                                    )
                                                  }
                                                />
                                              </td>
                                              <td>
                                                <input
                                                  value={field.bitWidth}
                                                  onChange={(event) =>
                                                    handleTemplateFieldChange(
                                                      template.id,
                                                      register.id,
                                                      field.id,
                                                      'bitWidth',
                                                      event.target.value,
                                                    )
                                                  }
                                                />
                                              </td>
                                              <td>
                                                <input
                                                  value={field.description}
                                                  onChange={(event) =>
                                                    handleTemplateFieldChange(
                                                      template.id,
                                                      register.id,
                                                      field.id,
                                                      'description',
                                                      event.target.value,
                                                    )
                                                  }
                                                />
                                              </td>
                                              <td>
                                                <button
                                                  type="button"
                                                  className="ghost-button table-action"
                                                  onClick={() => handleRemoveTemplateField(template.id, register.id, field.id)}
                                                >
                                                  删除
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                    ) : null}
                                  </div>
                                ) : null}
                              </article>
                            ))}
                            </section>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>

              <section className="editor-card column-panel">
                <div className="column-header">
                  <div>
                    <p className="eyebrow">Derived instances</p>
                    <h4>实例寄存器组</h4>
                  </div>
                  <div className="card-actions">
                    <span className="column-hint">实例通过 derivedFrom 继承上方模板。</span>
                    <button type="button" className="secondary" onClick={handleAddPeripheral}>
                      新增寄存器组
                    </button>
                  </div>
                </div>
                <div className="nested-stack">
                  {device.peripherals.map((peripheral, peripheralIndex) => (
                    <article
                      className={`editor-card group-card ${peripheral.derivedFrom ? `template-linked-card ${derivedColorClass(peripheral.derivedFrom, device.peripheralTemplates)}` : ''}`}
                      key={peripheral.id}
                    >
                      <div className="card-header">
                        <button
                          type="button"
                          className="collapse-toggle"
                          aria-expanded={peripheral.expanded}
                          aria-label={`${peripheral.expanded ? '折叠' : '展开'}寄存器组 ${summarizeName(peripheral.name, `寄存器组 ${peripheralIndex + 1}`)}`}
                          onClick={() => togglePeripheral(peripheral.id)}
                        >
                          <span>{peripheral.expanded ? '▾' : '▸'}</span>
                          <span>{summarizeName(peripheral.name, `寄存器组 ${peripheralIndex + 1}`)}</span>
                        </button>
                        <div className="card-actions">
                          {!peripheral.derivedFrom ? (
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => handleAddRegister(peripheral.id, peripheral.registers.length + 1)}
                            >
                              新增寄存器
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => handleRemovePeripheral(peripheral.id)}
                          >
                            删除组
                          </button>
                        </div>
                      </div>
                      {peripheral.expanded ? (
                        <div className="card-body">
                          <div className="inline-field-row">
                            <label className="inline-field inline-medium">
                              <span>name</span>
                              <input
                                value={peripheral.name}
                                onChange={(event) => handlePeripheralChange(peripheral.id, 'name', event.target.value)}
                              />
                            </label>
                            <label className="inline-field inline-small">
                              <span>groupName</span>
                              <input
                                value={peripheral.groupName}
                                onChange={(event) =>
                                  handlePeripheralChange(peripheral.id, 'groupName', event.target.value)
                                }
                              />
                            </label>
                            <label className="inline-field inline-small">
                              <span>baseAddress</span>
                              <input
                                value={peripheral.baseAddress}
                                onChange={(event) =>
                                  handlePeripheralChange(peripheral.id, 'baseAddress', event.target.value)
                                }
                              />
                            </label>
                            <label className="inline-field inline-wide">
                              <span>description</span>
                              <input
                                value={peripheral.description}
                                onChange={(event) =>
                                  handlePeripheralChange(peripheral.id, 'description', event.target.value)
                                }
                              />
                            </label>
                          </div>
                          <div className="readonly-meta">
                            <span>derivedFrom：{peripheral.derivedFrom || '-'}</span>
                          </div>
                          {!peripheral.derivedFrom ? (
                            <div className="nested-stack">
                              <section className="editor-card column-panel">
                                <div className="column-header">
                                  <div>
                                    <p className="eyebrow">Register templates</p>
                                    <h4>寄存器模板</h4>
                                  </div>
                                  <div className="card-actions">
                                    <button
                                      type="button"
                                      className="secondary"
                                      onClick={() =>
                                        handleAddRegisterTemplate(
                                          peripheral.id,
                                          peripheral.registerTemplates.length,
                                        )
                                      }
                                    >
                                      新增寄存器模板
                                    </button>
                                    <button
                                      type="button"
                                      className="secondary"
                                      onClick={() => handleAddRegister(peripheral.id, peripheral.registers.length + 1)}
                                    >
                                      新增寄存器
                                    </button>
                                  </div>
                                </div>
                                <div className="nested-stack">
                                  {peripheral.registerTemplates.map((template, templateIndex) => (
                                    <article className={`editor-card register-card register-linked-card ${registerTemplateColorClass(templateIndex)}`} key={template.id}>
                                      <div className="card-header">
                                        <button
                                          type="button"
                                          className="collapse-toggle"
                                          aria-expanded={template.expanded}
                                          aria-label={`${template.expanded ? '折叠' : '展开'}寄存器模板 ${summarizeName(template.name, `寄存器模板 ${templateIndex + 1}`)}`}
                                          onClick={() => toggleRegisterTemplate(peripheral.id, template.id)}
                                        >
                                          <span>{template.expanded ? '▾' : '▸'}</span>
                                          <span>{summarizeName(template.name, `寄存器模板 ${templateIndex + 1}`)}</span>
                                        </button>
                                        <div className="card-actions">
                                          <button
                                            type="button"
                                            className="secondary"
                                            onClick={() =>
                                              handleAddRegisterTemplateField(
                                                peripheral.id,
                                                template.id,
                                                template.fields.length + 1,
                                              )
                                            }
                                          >
                                            新增位域
                                          </button>
                                          <button
                                            type="button"
                                            className="secondary"
                                            onClick={() => handleGenerateRegisterFromTemplate(peripheral.id, template.id)}
                                          >
                                            生成实例
                                          </button>
                                          <button
                                            type="button"
                                            className="ghost-button"
                                            onClick={() => handleRemoveRegisterTemplate(peripheral.id, template.id)}
                                          >
                                            删除模板
                                          </button>
                                        </div>
                                      </div>
                                      {template.expanded ? (
                                        <div className="card-body">
                                          <div className="inline-field-row">
                                            <label className="inline-field inline-medium">
                                              <span>模板名称</span>
                                              <input
                                                aria-label="寄存器模板名称"
                                                value={template.name}
                                                onChange={(event) =>
                                                  handleRegisterTemplateChange(
                                                    peripheral.id,
                                                    template.id,
                                                    'name',
                                                    event.target.value,
                                                  )
                                                }
                                              />
                                            </label>
                                            <label className="inline-field inline-small">
                                              <span>addressOffset</span>
                                              <input
                                                value={template.addressOffset}
                                                onChange={(event) =>
                                                  handleRegisterTemplateChange(
                                                    peripheral.id,
                                                    template.id,
                                                    'addressOffset',
                                                    event.target.value,
                                                  )
                                                }
                                              />
                                            </label>
                                            <label className="inline-field inline-wide">
                                              <span>模板描述</span>
                                              <input
                                                value={template.description}
                                                onChange={(event) =>
                                                  handleRegisterTemplateChange(
                                                    peripheral.id,
                                                    template.id,
                                                    'description',
                                                    event.target.value,
                                                  )
                                                }
                                              />
                                            </label>
                                          </div>
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
                                                {template.fields.map((field, fieldIndex) => (
                                                  <tr key={field.id}>
                                                    <td>
                                                      <input
                                                        aria-label={`寄存器模板位域名称 ${fieldIndex + 1}`}
                                                        value={field.name}
                                                        onChange={(event) =>
                                                          handleRegisterTemplateFieldChange(
                                                            peripheral.id,
                                                            template.id,
                                                            field.id,
                                                            'name',
                                                            event.target.value,
                                                          )
                                                        }
                                                      />
                                                    </td>
                                                    <td>
                                                      <input
                                                        value={field.bitOffset}
                                                        onChange={(event) =>
                                                          handleRegisterTemplateFieldChange(
                                                            peripheral.id,
                                                            template.id,
                                                            field.id,
                                                            'bitOffset',
                                                            event.target.value,
                                                          )
                                                        }
                                                      />
                                                    </td>
                                                    <td>
                                                      <input
                                                        value={field.bitWidth}
                                                        onChange={(event) =>
                                                          handleRegisterTemplateFieldChange(
                                                            peripheral.id,
                                                            template.id,
                                                            field.id,
                                                            'bitWidth',
                                                            event.target.value,
                                                          )
                                                        }
                                                      />
                                                    </td>
                                                    <td>
                                                      <input
                                                        value={field.description}
                                                        onChange={(event) =>
                                                          handleRegisterTemplateFieldChange(
                                                            peripheral.id,
                                                            template.id,
                                                            field.id,
                                                            'description',
                                                            event.target.value,
                                                          )
                                                        }
                                                      />
                                                    </td>
                                                    <td>
                                                      <button
                                                        type="button"
                                                        className="ghost-button table-action"
                                                        onClick={() =>
                                                          handleRemoveRegisterTemplateField(
                                                            peripheral.id,
                                                            template.id,
                                                            field.id,
                                                          )
                                                        }
                                                      >
                                                        删除
                                                      </button>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      ) : null}
                                    </article>
                                  ))}
                                </div>
                              </section>
                              <section className="editor-card column-panel">
                                <div className="column-header">
                                  <div>
                                    <p className="eyebrow">Register instances</p>
                                    <h4>寄存器实例</h4>
                                  </div>
                                  <span className="column-hint">实例通过 derivedFrom 继承上方模板。</span>
                                </div>
                              {peripheral.registers.map((register, registerIndex) => (
                                <article
                                  className={`editor-card register-card ${register.derivedFrom ? `register-linked-card ${derivedRegisterColorClass(register.derivedFrom, peripheral.registerTemplates)}` : ''}`}
                                  key={register.id}
                                >
                                  <div className="card-header">
                                    <button
                                      type="button"
                                      className="collapse-toggle"
                                      aria-expanded={register.expanded}
                                      aria-label={`${register.expanded ? '折叠' : '展开'}寄存器 ${summarizeName(register.name, `寄存器 ${registerIndex + 1}`)}`}
                                      onClick={() => toggleRegister(peripheral.id, register.id)}
                                    >
                                      <span>{register.expanded ? '▾' : '▸'}</span>
                                      <span>{summarizeName(register.name, `寄存器 ${registerIndex + 1}`)}</span>
                                    </button>
                                    <div className="card-actions">
                                      <button
                                        type="button"
                                        className="secondary"
                                        onClick={() =>
                                          handleAddField(peripheral.id, register.id, register.fields.length + 1)
                                        }
                                        disabled={Boolean(register.derivedFrom)}
                                      >
                                        新增位域
                                      </button>
                                      <button
                                        type="button"
                                        className="ghost-button"
                                        onClick={() => handleRemoveRegister(peripheral.id, register.id)}
                                      >
                                        删除寄存器
                                      </button>
                                    </div>
                                  </div>

                                  {register.expanded ? (
                                    <div className="card-body">
                                      <div className="inline-field-row">
                                        <label className="inline-field inline-medium">
                                          <span>寄存器名称</span>
                                          <input
                                            aria-label="寄存器名称"
                                            value={register.name}
                                            onChange={(event) =>
                                              handleRegisterChange(
                                                peripheral.id,
                                                register.id,
                                                'name',
                                                event.target.value,
                                              )
                                            }
                                          />
                                        </label>
                                        <label className="inline-field inline-small">
                                          <span>addressOffset</span>
                                          <input
                                            aria-label="addressOffset"
                                            value={register.addressOffset}
                                            onChange={(event) =>
                                              handleRegisterChange(
                                                peripheral.id,
                                                register.id,
                                                'addressOffset',
                                                event.target.value,
                                              )
                                            }
                                          />
                                        </label>
                                        <label className="inline-field inline-wide">
                                          <span>寄存器描述</span>
                                          <input
                                            value={register.description}
                                            onChange={(event) =>
                                              handleRegisterChange(
                                                peripheral.id,
                                                register.id,
                                                'description',
                                                event.target.value,
                                              )
                                            }
                                          />
                                        </label>
                                      </div>
                                      <div className="readonly-meta">
                                        <span>derivedFrom：{register.derivedFrom || '-'}</span>
                                      </div>
                                      {!register.derivedFrom ? (
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
                                            {register.fields.map((field, fieldIndex) => (
                                              <tr key={field.id}>
                                                <td>
                                                  <input
                                                    aria-label={`位域名称 ${fieldIndex + 1}`}
                                                    value={field.name}
                                                    onChange={(event) =>
                                                      handleFieldChange(
                                                        peripheral.id,
                                                        register.id,
                                                        field.id,
                                                        'name',
                                                        event.target.value,
                                                      )
                                                    }
                                                  />
                                                </td>
                                                <td>
                                                  <input
                                                    value={field.bitOffset}
                                                    onChange={(event) =>
                                                      handleFieldChange(
                                                        peripheral.id,
                                                        register.id,
                                                        field.id,
                                                        'bitOffset',
                                                        event.target.value,
                                                      )
                                                    }
                                                  />
                                                </td>
                                                <td>
                                                  <input
                                                    value={field.bitWidth}
                                                    onChange={(event) =>
                                                      handleFieldChange(
                                                        peripheral.id,
                                                        register.id,
                                                        field.id,
                                                        'bitWidth',
                                                        event.target.value,
                                                      )
                                                    }
                                                  />
                                                </td>
                                                <td>
                                                  <input
                                                    value={field.description}
                                                    onChange={(event) =>
                                                      handleFieldChange(
                                                        peripheral.id,
                                                        register.id,
                                                        field.id,
                                                        'description',
                                                        event.target.value,
                                                      )
                                                    }
                                                  />
                                                </td>
                                                <td>
                                                  <button
                                                    type="button"
                                                    className="ghost-button table-action"
                                                    onClick={() =>
                                                      handleRemoveField(peripheral.id, register.id, field.id)
                                                    }
                                                  >
                                                    删除
                                                  </button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </article>
                              ))}
                              </section>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>
            </div>
          </div>
        </section>

      </section>

      <XmlPreview xml={state.xml} />
    </main>
  )
}

export default App
