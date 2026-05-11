import type { Access, SvdFieldInput, SvdPeripheralInput, SvdRegisterInput, SvdYamlInput } from '../types/svd'
import { createIRegionUnitDefinitions } from './iregionData'
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
  name: string
  description: string
  baseAddress: string
  derivedFrom?: string
  groupName: string
  expanded: boolean
  registerTemplates: EditorRegister[]
  registers: EditorRegister[]
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
    fields: [createEmptyField()],
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
    name: 'GROUP1',
    description: 'Register group',
    baseAddress: '0x0',
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
    description: 'Register template',
    addressOffset: '0x0',
    fields: [createEmptyField()],
  })
}

export function createRegisterInstanceFromTemplate(
  template: EditorRegister,
  addressOffset: string,
  index: number,
): EditorRegister {
  return createEmptyRegister({
    name: `${template.name}_INST${index}`,
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
    description: 'New register group',
    baseAddress: '0x40001000',
    groupName: 'PERIPHERAL',
    expanded: true,
    registerTemplates: [createDefaultRegisterTemplate(0)],
    registers: [],
  })
}

export function createDefaultPeripheralTemplate(index = 0): EditorPeripheral {
  return createEmptyPeripheral({
    name: `GROUP${index}`,
    description: 'Register group template',
    baseAddress: '0x0',
    groupName: 'PERIPHERAL_TEMPLATE',
    expanded: false,
    registerTemplates: [createDefaultRegisterTemplate(0)],
    registers: [],
  })
}

export function createPeripheralInstanceFromTemplate(
  template: EditorPeripheral,
  index: number,
): EditorPeripheral {
  return createEmptyPeripheral({
    name: `${template.name}_INST${index}`,
    description: template.description,
    baseAddress: '0x40001000',
    derivedFrom: template.name,
    groupName: template.groupName,
    expanded: true,
    registers: [],
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

function createIRegionPeripherals() {
  return createIRegionUnitDefinitions().map((unit) =>
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

function buildField(field: EditorField): SvdFieldInput {
  return {
    name: field.name.trim(),
    description: field.description.trim(),
    bitOffset: parseIntegerInput(field.bitOffset),
    bitWidth: parseIntegerInput(field.bitWidth),
    ...optionalStringProperty('access', field.access),
  }
}

function buildRegister(register: EditorRegister): SvdRegisterInput {
  return {
    name: register.name.trim(),
    description: register.description.trim(),
    addressOffset: register.addressOffset.trim(),
    ...optionalIntegerProperty('dim', register.dim),
    ...optionalIntegerProperty('dimIncrement', register.dimIncrement),
    ...optionalStringProperty('derivedFrom', register.derivedFrom ?? ''),
    ...optionalIntegerProperty('size', register.size),
    ...optionalStringProperty('access', register.access),
    ...optionalStringProperty('resetValue', register.resetValue),
    ...optionalStringProperty('resetMask', register.resetMask),
    fields: register.fields.map((field) => buildField(field)),
  }
}

function buildPeripheral(peripheral: EditorPeripheral): SvdPeripheralInput {
  const instantiatedRegisterTemplateNames = new Set(
    peripheral.registers
      .map((register) => register.derivedFrom?.trim())
      .filter((derivedFrom): derivedFrom is string => Boolean(derivedFrom)),
  )
  const instantiatedRegisterTemplates = peripheral.registerTemplates.filter((template) =>
    instantiatedRegisterTemplateNames.has(template.name.trim()),
  )
  const registers = [...instantiatedRegisterTemplates, ...peripheral.registers]

  return {
    name: peripheral.name.trim(),
    description: peripheral.description.trim(),
    baseAddress: peripheral.baseAddress.trim(),
    ...optionalStringProperty('derivedFrom', peripheral.derivedFrom ?? ''),
    ...optionalStringProperty('groupName', peripheral.groupName),
    ...(registers.length > 0
      ? { registers: registers.map((register) => buildRegister(register)) }
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
    device.iregionPeripherals,
  )
  const instantiatedTemplateNames = new Set(
    device.peripherals
      .map((peripheral) => peripheral.derivedFrom?.trim())
      .filter((derivedFrom): derivedFrom is string => Boolean(derivedFrom)),
  )
  const instantiatedPeripheralTemplates = device.peripheralTemplates.filter((template) =>
    instantiatedTemplateNames.has(template.name.trim()),
  )

  return {
    device: {
      name: device.name.trim(),
      version: device.version.trim(),
      description: device.description.trim(),
      addressUnitBits: parseIntegerInput(device.addressUnitBits),
      width: parseIntegerInput(device.width),
      ...optionalIntegerProperty('size', device.size),
      ...optionalStringProperty('access', device.access),
      ...optionalStringProperty('resetValue', device.resetValue),
      ...optionalStringProperty('resetMask', device.resetMask),
      peripherals: [
        ...resolvedIRegionPeripherals.map((peripheral) => buildPeripheral(peripheral)),
        ...instantiatedPeripheralTemplates.map((peripheral) => buildPeripheral(peripheral)),
        ...device.peripherals.map((peripheral) => buildPeripheral(peripheral)),
      ],
    },
  }
}
