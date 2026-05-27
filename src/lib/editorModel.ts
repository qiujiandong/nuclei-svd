import type { Access, SvdFieldInput, SvdPeripheralInput, SvdRegisterInput, SvdYamlInput } from '../types/svd'
import { createIRegionConfig, createIRegionUnitDefinitions } from './iregionData'
import type { PresetRegisterDefinition } from './iregionData'

export type EditorAccess = Access | ''

export interface EditorField {
  id: string
  name: string
  description: string
  bitOffset: string
  bitWidth: string
  access: EditorAccess
  expanded: boolean
}

export interface EditorRegister {
  id: string
  name: string
  description: string
  addressOffset: string
  dim: string
  dimIncrement: string
  derivedFrom?: string
  size: string
  access: EditorAccess
  resetValue: string
  resetMask: string
  expanded: boolean
  fields: EditorField[]
}

export interface EditorPeripheral {
  id: string
  templateId?: string
  name: string
  description: string
  baseAddress: string
  defaultRegisterSize: string
  derivedFrom?: string
  groupName: string
  expanded: boolean
  registerTemplates: EditorRegister[]
  registers: EditorRegister[]
}

export interface EditorIRegionConfig {
  cpuCount: number
  eclicInterruptCount: number
  ciduInterruptCount: number
  plicInterruptCountX32: number
  iinfoExist: boolean
  debugExist: boolean
  eclicExist: boolean
  timerExist: boolean
  smpExist: boolean
  ciduExist: boolean
  plicExist: boolean
}

export interface EditorDevice {
  name: string
  version: string
  description: string
  addressUnitBits: string
  width: string
  size: string
  access: EditorAccess
  resetValue: string
  resetMask: string
  iregionExpanded: boolean
  iregionBaseAddress: string
  iregionConfig: EditorIRegionConfig
  iregionPeripherals: EditorPeripheral[]
  peripheralTemplates: EditorPeripheral[]
  peripherals: EditorPeripheral[]
}

let nextEditorId = 0

function createEditorId(prefix: string) {
  nextEditorId += 1
  return `${prefix}-${nextEditorId}`
}

function formatHex(value: number) {
  return `0x${value.toString(16).toUpperCase()}`
}

function parseIntegerInput(value: string) {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return Number.NaN
  }

  const parsed = Number(trimmed)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : Number.NaN
}

type PresetFieldDefinition = {
  name: string
  description: string
  bitOffset: string
  bitWidth: string
  access?: EditorAccess
}

function createPresetField({
  name,
  description,
  bitOffset,
  bitWidth,
  access = '',
}: PresetFieldDefinition): EditorField {
  return createEmptyField({
    name,
    description,
    bitOffset,
    bitWidth,
    access,
    expanded: false,
  })
}

export function createEmptyField(overrides: Partial<Omit<EditorField, 'id'>> = {}): EditorField {
  return {
    id: createEditorId('field'),
    name: 'ENABLE',
    description: 'Enable control bit',
    bitOffset: '0',
    bitWidth: '1',
    access: '',
    expanded: true,
    ...overrides,
  }
}

export function createEmptyRegister(
  overrides: Partial<Omit<EditorRegister, 'id'>> = {},
): EditorRegister {
  return {
    id: createEditorId('register'),
    name: 'CTRL',
    description: 'Control register',
    addressOffset: '0x0',
    dim: '',
    dimIncrement: '',
    derivedFrom: undefined,
    size: '',
    access: '',
    resetValue: '',
    resetMask: '',
    expanded: true,
    fields: [],
    ...overrides,
  }
}

export function cloneEditorField(
  field: EditorField,
  overrides: Partial<Omit<EditorField, 'id'>> = {},
): EditorField {
  return createEmptyField({
    name: field.name,
    description: field.description,
    bitOffset: field.bitOffset,
    bitWidth: field.bitWidth,
    access: field.access,
    expanded: field.expanded,
    ...overrides,
  })
}

export function cloneEditorRegister(
  register: EditorRegister,
  overrides: Partial<Omit<EditorRegister, 'id'>> = {},
): EditorRegister {
  return createEmptyRegister({
    name: register.name,
    description: register.description,
    addressOffset: register.addressOffset,
    dim: register.dim,
    dimIncrement: register.dimIncrement,
    derivedFrom: register.derivedFrom,
    size: register.size,
    access: register.access,
    resetValue: register.resetValue,
    resetMask: register.resetMask,
    expanded: register.expanded,
    fields: register.fields.map((field) => cloneEditorField(field)),
    ...overrides,
  })
}

function createPresetRegister({
  name,
  description,
  addressOffset,
  dim,
  dimIncrement,
  size = '32',
  access = '',
  fields = [],
}: {
  name: string
  description: string
  addressOffset: string
  dim?: string
  dimIncrement?: string
  size?: string
  access?: EditorAccess
  fields?: PresetFieldDefinition[]
}): EditorRegister {
  return createEmptyRegister({
    name,
    description,
    addressOffset,
    dim: dim ?? '',
    dimIncrement: dimIncrement ?? '',
    size,
    access,
    resetValue: '',
    resetMask: '',
    expanded: false,
    fields: fields.map((field) => createPresetField(field)),
  })
}

export function createEmptyPeripheral(
  overrides: Partial<Omit<EditorPeripheral, 'id'>> = {},
): EditorPeripheral {
  return {
    id: createEditorId('group'),
    templateId: undefined,
    name: 'GROUP1',
    description: 'Register group',
    baseAddress: '0x0',
    defaultRegisterSize: '',
    groupName: 'IREGION',
    expanded: true,
    registerTemplates: [],
    registers: [createEmptyRegister()],
    ...overrides,
  }
}

export function createDefaultRegisterTemplate(index = 0): EditorRegister {
  return createEmptyRegister({
    name: `REG${index}`,
    description: 'Description of this REG',
    addressOffset: '0x0',
  })
}

export function createRegisterInstanceFromTemplate(
  template: EditorRegister,
  addressOffset: string,
  index: number,
): EditorRegister {
  return createEmptyRegister({
    name: `${template.name}${index}`,
    description: template.description,
    addressOffset,
    derivedFrom: template.name,
    expanded: true,
    fields: [],
  })
}

export function createDefaultCustomPeripheral(index = 0): EditorPeripheral {
  return createEmptyPeripheral({
    name: `PERI${index}`,
    description: `Description of PERI${index}`,
    baseAddress: '0x40001000',
    defaultRegisterSize: '',
    groupName: `PERI${index}`,
    expanded: true,
    registerTemplates: [createDefaultRegisterTemplate(0)],
    registers: [],
  })
}

export function createDefaultPeripheralTemplate(index = 0): EditorPeripheral {
  return createEmptyPeripheral({
    name: `PERI${index}`,
    description: `Description of PERI${index}`,
    baseAddress: '0x0',
    defaultRegisterSize: '32',
    groupName: `PERI${index}`,
    expanded: true,
    registerTemplates: [createDefaultRegisterTemplate(0)],
    registers: [],
  })
}

export function createPeripheralInstanceFromTemplate(
  template: EditorPeripheral,
  index: number,
): EditorPeripheral {
  return createEmptyPeripheral({
    templateId: template.id,
    name: `${template.name}${index}`,
    description: template.description,
    baseAddress: '0x40001000',
    defaultRegisterSize: template.defaultRegisterSize,
    groupName: template.groupName,
    expanded: true,
    registers: [],
  })
}

export function createPeripheralCopyFromTemplate(
  template: EditorPeripheral,
  index: number,
): EditorPeripheral {
  return createEmptyPeripheral({
    name: `${template.name}${index}`,
    description: template.description,
    baseAddress: '0x40001000',
    defaultRegisterSize: template.defaultRegisterSize,
    groupName: template.groupName,
    expanded: true,
    registerTemplates: template.registerTemplates.map((registerTemplate) => cloneEditorRegister(registerTemplate)),
    registers: template.registers.map((register) => cloneEditorRegister(register)),
  })
}

export function createPeripheralTemplateFromInstance(
  peripheral: EditorPeripheral,
): EditorPeripheral {
  return createEmptyPeripheral({
    name: `${peripheral.name || 'PERI'}`,
    description: peripheral.description,
    baseAddress: '0x0',
    defaultRegisterSize: peripheral.defaultRegisterSize || peripheral.registers.find((register) => register.size.trim().length > 0)?.size || '32',
    groupName: peripheral.groupName || peripheral.name || 'PERIPHERAL',
    expanded: true,
    registerTemplates: [],
    registers: peripheral.registers.map((register) => cloneEditorRegister(register, { derivedFrom: undefined })),
  })
}

function createPresetRegisters(registers: PresetRegisterDefinition[]) {
  return registers.map((register) =>
    createPresetRegister({
      name: register.name,
      description: register.description,
      addressOffset: register.addressOffset,
      dim: register.dim,
      dimIncrement: register.dimIncrement,
      size: register.size,
      access: register.access,
      fields: register.fields ?? [],
    }),
  )
}

export function createIRegionPeripherals(config: EditorIRegionConfig = createIRegionConfig()) {
  return createIRegionUnitDefinitions(config).map((unit) =>
    createEmptyPeripheral({
      name: unit.name,
      description: unit.description,
      baseAddress: unit.baseAddress,
      groupName: 'IREGION',
      expanded: false,
      registers: createPresetRegisters(unit.registers),
    }),
  )
}

export function createDefaultEditorDevice(): EditorDevice {
  return {
    name: 'NucleiDemo',
    version: '1.0.0',
    description: 'Nuclei demo device',
    addressUnitBits: '8',
    width: '32',
    size: '32',
    access: 'read-write',
    resetValue: '0x00000000',
    resetMask: '0xFFFFFFFF',
    iregionExpanded: false,
    iregionBaseAddress: '0x18000000',
    iregionConfig: createIRegionConfig(),
    iregionPeripherals: createIRegionPeripherals(),
    peripheralTemplates: [],
    peripherals: [],
  }
}

function optionalIntegerProperty(name: string, value: string) {
  return value.trim().length > 0 ? { [name]: parseIntegerInput(value) } : {}
}

function optionalStringProperty(name: string, value: string) {
  return value.trim().length > 0 ? { [name]: value.trim() } : {}
}

function buildField(field: EditorField, includeAccess = false): SvdFieldInput {
  return {
    name: field.name.trim(),
    description: field.description.trim(),
    bitOffset: parseIntegerInput(field.bitOffset),
    bitWidth: parseIntegerInput(field.bitWidth),
    ...(includeAccess ? optionalStringProperty('access', field.access) : {}),
  }
}

function resolveRegisterSize(register: EditorRegister, fallbackSize = '') {
  return register.size.trim().length > 0 ? register.size : fallbackSize
}

function buildFieldsWithReserved(register: EditorRegister, fallbackSize = '', includeAccess = false): SvdFieldInput[] {
  const userFields = register.fields.map((field) => buildField(field, includeAccess))
  if (userFields.length === 0) {
    return []
  }

  // SVD expects explicit field coverage once any field is declared; fill gaps with reserved ranges.
  const registerWidth = parseIntegerInput(resolveRegisterSize(register, fallbackSize))
  const effectiveWidth = Number.isNaN(registerWidth) || registerWidth === 0 ? 32 : registerWidth
  const sortedFields = [...userFields].sort((left, right) => left.bitOffset - right.bitOffset)
  const fields: SvdFieldInput[] = []
  let cursor = 0
  let reservedIndex = 0

  sortedFields.forEach((field) => {
    if (Number.isInteger(field.bitOffset) && field.bitOffset > cursor) {
      fields.push({
        name: `RESERVED${reservedIndex}`,
        description: 'Reserved bits',
        bitOffset: cursor,
        bitWidth: field.bitOffset - cursor,
      })
      reservedIndex += 1
    }

    fields.push(field)
    if (Number.isInteger(field.bitOffset) && Number.isInteger(field.bitWidth)) {
      cursor = Math.max(cursor, field.bitOffset + field.bitWidth)
    }
  })

  if (cursor < effectiveWidth) {
    fields.push({
      name: `RESERVED${reservedIndex}`,
      description: 'Reserved bits',
      bitOffset: cursor,
      bitWidth: effectiveWidth - cursor,
    })
  }

  return fields
}

function buildRegister(register: EditorRegister, fallbackSize = '', includeAccess = false): SvdRegisterInput {
  const resolvedSize = resolveRegisterSize(register, fallbackSize)

  return {
    name: register.name.trim(),
    description: register.description.trim(),
    addressOffset: register.addressOffset.trim(),
    ...optionalIntegerProperty('dim', register.dim),
    ...optionalIntegerProperty('dimIncrement', register.dimIncrement),
    ...optionalStringProperty('derivedFrom', register.derivedFrom ?? ''),
    ...optionalIntegerProperty('size', resolvedSize),
    ...(includeAccess ? optionalStringProperty('access', register.access) : {}),
    fields: buildFieldsWithReserved(register, fallbackSize, includeAccess),
  }
}

function buildPeripheral(peripheral: EditorPeripheral, includeAccess = false): SvdPeripheralInput {
  const instantiatedRegisterTemplateNames = new Set(
    peripheral.registers
      .map((register) => register.derivedFrom?.trim())
      .filter((derivedFrom): derivedFrom is string => Boolean(derivedFrom)),
  )
  const instantiatedRegisterTemplates = peripheral.registerTemplates.filter((template) =>
    instantiatedRegisterTemplateNames.has(template.name.trim()),
  )
  const registers = [...instantiatedRegisterTemplates, ...peripheral.registers]
  const fallbackSize = peripheral.defaultRegisterSize

  return {
    name: peripheral.name.trim(),
    description: peripheral.description.trim(),
    baseAddress: peripheral.baseAddress.trim(),
    ...optionalStringProperty('derivedFrom', peripheral.derivedFrom ?? ''),
    ...optionalStringProperty('groupName', peripheral.groupName),
    ...(registers.length > 0
      ? { registers: registers.map((register) => buildRegister(register, fallbackSize, includeAccess)) }
      : {}),
  }
}

function buildLinkedPeripheral(
  instance: EditorPeripheral,
  template: EditorPeripheral,
  derivedFrom?: string,
): SvdPeripheralInput {
  return {
    name: instance.name.trim(),
    description: template.description.trim(),
    baseAddress: instance.baseAddress.trim(),
    ...(derivedFrom ? { derivedFrom } : {}),
    ...optionalStringProperty('groupName', template.groupName || template.name),
    ...(!derivedFrom && template.registers.length > 0
      ? { registers: template.registers.map((register) => buildRegister(register, template.defaultRegisterSize)) }
      : {}),
  }
}

function resolveIRegionPeripheral(
  baseAddress: string,
  peripheral: EditorPeripheral,
): EditorPeripheral {
  const parsedBaseAddress = parseIntegerInput(baseAddress)
  const parsedOffset = parseIntegerInput(peripheral.baseAddress)

  const nextBaseAddress =
    !Number.isNaN(parsedBaseAddress) && !Number.isNaN(parsedOffset)
      ? formatHex(parsedBaseAddress + parsedOffset)
      : baseAddress.trim()

  return {
    ...peripheral,
    baseAddress: nextBaseAddress,
  }
}

export function resolveIRegionPeripherals(
  baseAddress: string,
  peripherals: EditorPeripheral[],
): EditorPeripheral[] {
  return peripherals.map((peripheral) => resolveIRegionPeripheral(baseAddress, peripheral))
}

export function buildSvdInputFromEditor(device: EditorDevice): SvdYamlInput {
  const resolvedIRegionPeripherals = resolveIRegionPeripherals(
    device.iregionBaseAddress,
    createIRegionPeripherals(device.iregionConfig),
  )
  const templateById = new Map(device.peripheralTemplates.map((template) => [template.id, template]))
  const legacyTemplateByName = new Map(
    device.peripheralTemplates.map((template) => [template.name.trim(), template]),
  )
  const firstLinkedInstanceByTemplateId = new Map<string, string>()
  const resolvedCustomPeripherals = device.peripherals.map((peripheral) => {
    const linkedTemplate =
      (peripheral.templateId ? templateById.get(peripheral.templateId) : undefined) ??
      (peripheral.derivedFrom ? legacyTemplateByName.get(peripheral.derivedFrom.trim()) : undefined)

    if (!linkedTemplate) {
      return buildPeripheral({ ...peripheral, derivedFrom: undefined })
    }

    // For linked template instances, the first concrete instance carries registers and later instances derive from it.
    const firstInstanceName = firstLinkedInstanceByTemplateId.get(linkedTemplate.id)
    if (!firstInstanceName) {
      firstLinkedInstanceByTemplateId.set(linkedTemplate.id, peripheral.name.trim())
      return buildLinkedPeripheral(peripheral, linkedTemplate)
    }

    return buildLinkedPeripheral(peripheral, linkedTemplate, firstInstanceName)
  })

  return {
    device: {
      name: device.name.trim(),
    version: device.version.trim(),
    description: device.description.trim(),
    addressUnitBits: parseIntegerInput(device.addressUnitBits),
    width: parseIntegerInput(device.width),
    ...optionalIntegerProperty('size', device.size),
      peripherals: [
        ...resolvedIRegionPeripherals.map((peripheral) => buildPeripheral(peripheral, true)),
        ...resolvedCustomPeripherals,
      ],
    },
  }
}
