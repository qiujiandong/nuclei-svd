import type { Access, SvdFieldInput, SvdPeripheralInput, SvdRegisterInput, SvdYamlInput } from '../types/svd'

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
  groupName: string
  expanded: boolean
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
  peripherals: EditorPeripheral[]
}

let nextEditorId = 0

function createEditorId(prefix: string) {
  nextEditorId += 1
  return `${prefix}-${nextEditorId}`
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
    size: '',
    access: '',
    resetValue: '',
    resetMask: '',
    expanded: true,
    fields: [createEmptyField()],
    ...overrides,
  }
}

export function createEmptyPeripheral(
  overrides: Partial<Omit<EditorPeripheral, 'id'>> = {},
): EditorPeripheral {
  return {
    id: createEditorId('group'),
    name: 'ECLIC',
    description: 'Enhanced Core-Local Interrupt Controller',
    baseAddress: '0x40000000',
    groupName: 'CPU',
    expanded: true,
    registers: [createEmptyRegister()],
    ...overrides,
  }
}

export function createDefaultEditorDevice(): EditorDevice {
  return {
    name: 'NucleiDemoRV32',
    version: '1.0.0',
    description: 'Nuclei CPU reference device',
    addressUnitBits: '8',
    width: '32',
    size: '32',
    access: 'read-write',
    resetValue: '0x00000000',
    resetMask: '0xFFFFFFFF',
    peripherals: [
      createEmptyPeripheral({
        name: 'ECLIC',
        description: 'Enhanced Core-Local Interrupt Controller',
        baseAddress: '0x40000000',
        groupName: 'CPU',
        registers: [
          createEmptyRegister({
            name: 'CFG',
            description: 'Core interrupt control register',
            addressOffset: '0x0',
            fields: [
              createEmptyField({
                name: 'ENABLE',
                description: 'Enables interrupt handling',
                bitOffset: '0',
                bitWidth: '1',
              }),
            ],
          }),
        ],
      }),
    ],
  }
}

function parseIntegerInput(value: string) {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return Number.NaN
  }

  const parsed = Number(trimmed)
  return Number.isInteger(parsed) ? parsed : Number.NaN
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
    ...optionalIntegerProperty('size', register.size),
    ...optionalStringProperty('access', register.access),
    ...optionalStringProperty('resetValue', register.resetValue),
    ...optionalStringProperty('resetMask', register.resetMask),
    fields: register.fields.map((field) => buildField(field)),
  }
}

function buildPeripheral(peripheral: EditorPeripheral): SvdPeripheralInput {
  return {
    name: peripheral.name.trim(),
    description: peripheral.description.trim(),
    baseAddress: peripheral.baseAddress.trim(),
    ...optionalStringProperty('groupName', peripheral.groupName),
    registers: peripheral.registers.map((register) => buildRegister(register)),
  }
}

export function buildSvdInputFromEditor(device: EditorDevice): SvdYamlInput {
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
      peripherals: device.peripherals.map((peripheral) => buildPeripheral(peripheral)),
    },
  }
}
