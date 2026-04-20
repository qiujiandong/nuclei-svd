import type {
  NormalizedSvdDevice,
  NormalizedSvdField,
  NormalizedSvdModel,
  NormalizedSvdPeripheral,
  NormalizedSvdRegister,
  NumericInput,
  SvdDeviceInput,
  SvdFieldInput,
  SvdPeripheralInput,
  SvdRegisterInput,
  SvdYamlInput,
} from '../types/svd'

import { ConversionError, buildConversionIssue, ensureIssues, type ConversionIssue } from './errors'

const DECIMAL_PATTERN = /^(?:0|[1-9]\d*)$/
const HEX_PATTERN = /^0x[0-9A-Fa-f]+$/

function parseNumericInput(
  value: NumericInput | undefined,
  path: string,
  label: string,
  issues: ConversionIssue[],
): number | undefined {
  if (value === undefined) {
    return undefined
  }

  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 0) {
      return value
    }

    issues.push(
      buildConversionIssue(
        path,
        `${label} must be a non-negative integer.`,
        'semantic.invalid-number',
      ),
    )
    return undefined
  }

  if (DECIMAL_PATTERN.test(value)) {
    return Number.parseInt(value, 10)
  }

  if (HEX_PATTERN.test(value)) {
    return Number.parseInt(value.slice(2), 16)
  }

  issues.push(
    buildConversionIssue(
      path,
      `${label} must be a non-negative integer literal or a 0x-prefixed hexadecimal string.`,
      'semantic.invalid-number',
    ),
  )
  return undefined
}

function registerUnique(
  seen: Map<string, string>,
  key: string,
  path: string,
  message: string,
  rule: string,
  issues: ConversionIssue[],
): void {
  const existingPath = seen.get(key)
  if (existingPath) {
    issues.push(
      buildConversionIssue(path, `${message} Already used at ${existingPath}.`, rule),
    )
    return
  }

  seen.set(key, path)
}

function normalizeField(
  field: SvdFieldInput,
  fieldIndex: number,
  registerPath: string,
  inheritedAccess: SvdRegisterInput['access'],
  issues: ConversionIssue[],
): NormalizedSvdField {
  const path = `${registerPath}.fields[${fieldIndex}]`

  if (!Number.isInteger(field.bitOffset) || field.bitOffset < 0) {
    issues.push(
      buildConversionIssue(
        `${path}.bitOffset`,
        'bitOffset must be a non-negative integer.',
        'semantic.invalid-bit-range',
      ),
    )
  }

  if (!Number.isInteger(field.bitWidth) || field.bitWidth <= 0) {
    issues.push(
      buildConversionIssue(
        `${path}.bitWidth`,
        'bitWidth must be a positive integer.',
        'semantic.invalid-bit-range',
      ),
    )
  }

  return {
    name: field.name,
    description: field.description,
    bitOffset: field.bitOffset,
    bitWidth: field.bitWidth,
    access: field.access ?? inheritedAccess,
  }
}

function normalizeRegister(
  register: SvdRegisterInput,
  registerIndex: number,
  peripheral: SvdPeripheralInput,
  device: SvdDeviceInput,
  baseAddress: number | undefined,
  issues: ConversionIssue[],
): NormalizedSvdRegister {
  const path = `$.device.peripherals[${device.peripherals.indexOf(peripheral)}].registers[${registerIndex}]`
  const addressOffset = parseNumericInput(
    register.addressOffset,
    `${path}.addressOffset`,
    'addressOffset',
    issues,
  )

  const effectiveSize = register.derivedFrom ? register.size : register.size ?? device.size
  const effectiveAccess = register.derivedFrom ? register.access : register.access ?? device.access
  const effectiveResetValue =
    parseNumericInput(
      register.derivedFrom ? register.resetValue : register.resetValue ?? device.resetValue,
      `${path}.resetValue`,
      'resetValue',
      issues,
    )
  const effectiveResetMask =
    parseNumericInput(
      register.derivedFrom ? register.resetMask : register.resetMask ?? device.resetMask,
      `${path}.resetMask`,
      'resetMask',
      issues,
    )

  const absoluteAddress =
    baseAddress !== undefined && addressOffset !== undefined
      ? baseAddress + addressOffset
      : Number.NaN

  const seenFieldNames = new Map<string, string>()
  const occupiedRanges: Array<{ start: number; end: number; path: string }> = []

  const fields = (register.fields ?? []).map((field, fieldIndex) => {
    const fieldPath = `${path}.fields[${fieldIndex}].name`
    registerUnique(
      seenFieldNames,
      field.name,
      fieldPath,
      `Field name "${field.name}" must be unique within the register.`,
      'semantic.duplicate-field-name',
      issues,
    )

    const normalizedField = normalizeField(
      field,
      fieldIndex,
      path,
      effectiveAccess,
      issues,
    )

    if (normalizedField.bitWidth > 0) {
      const start = normalizedField.bitOffset
      const end = normalizedField.bitOffset + normalizedField.bitWidth - 1
      const overlapping = occupiedRanges.find(
        (range) => !(end < range.start || start > range.end),
      )

      if (overlapping) {
        issues.push(
          buildConversionIssue(
            `${path}.fields[${fieldIndex}]`,
            `Field bit range ${start}..${end} overlaps with ${overlapping.path}.`,
            'semantic.field-overlap',
          ),
        )
      } else {
        occupiedRanges.push({
          start,
          end,
          path: `${path}.fields[${fieldIndex}]`,
        })
      }
    }

    return normalizedField
  })

  return {
    name: register.name,
    description: register.description,
    addressOffset: addressOffset ?? Number.NaN,
    absoluteAddress,
    derivedFrom: register.derivedFrom,
    size: effectiveSize,
    access: effectiveAccess,
    resetValue: effectiveResetValue,
    resetMask: effectiveResetMask,
    fields,
  }
}

function normalizePeripheral(
  peripheral: SvdPeripheralInput,
  peripheralIndex: number,
  device: SvdDeviceInput,
  issues: ConversionIssue[],
): NormalizedSvdPeripheral {
  const path = `$.device.peripherals[${peripheralIndex}]`
  const baseAddress = parseNumericInput(
    peripheral.baseAddress,
    `${path}.baseAddress`,
    'baseAddress',
    issues,
  )

  const seenRegisterNames = new Map<string, string>()
  const seenAbsoluteAddresses = new Map<number, string>()

  const registers = (peripheral.registers ?? []).map((register, registerIndex) => {
    const registerPath = `${path}.registers[${registerIndex}]`

    registerUnique(
      seenRegisterNames,
      register.name,
      `${registerPath}.name`,
      `Register name "${register.name}" must be unique within the peripheral.`,
      'semantic.duplicate-register-name',
      issues,
    )

    const normalizedRegister = normalizeRegister(
      register,
      registerIndex,
      peripheral,
      device,
      baseAddress,
      issues,
    )

    if (!Number.isNaN(normalizedRegister.absoluteAddress)) {
      const existingPath = seenAbsoluteAddresses.get(normalizedRegister.absoluteAddress)
      if (existingPath) {
        issues.push(
          buildConversionIssue(
            `${registerPath}.addressOffset`,
            `Register absolute address ${formatHexValue(normalizedRegister.absoluteAddress)} duplicates ${existingPath}.`,
            'semantic.duplicate-absolute-address',
          ),
        )
      } else {
        seenAbsoluteAddresses.set(
          normalizedRegister.absoluteAddress,
          `${registerPath}.addressOffset`,
        )
      }
    }

    return normalizedRegister
  })

  return {
    name: peripheral.name,
    description: peripheral.description,
    baseAddress: baseAddress ?? Number.NaN,
    derivedFrom: peripheral.derivedFrom,
    groupName: peripheral.groupName,
    registers,
  }
}

function sanitizeDeviceName(name: string): string {
  const sanitized = name.trim().replace(/[^A-Za-z0-9._-]+/g, '-')
  return sanitized.length > 0 ? sanitized : 'device'
}

export function formatHexValue(value: number): string {
  return `0x${value.toString(16).toUpperCase()}`
}

export function normalizeSvdInput(input: SvdYamlInput): NormalizedSvdModel {
  const issues: ConversionIssue[] = []
  const device = input.device
  const seenPeripheralNames = new Map<string, string>()

  const normalizedPeripherals = device.peripherals.map((peripheral, peripheralIndex) => {
    registerUnique(
      seenPeripheralNames,
      peripheral.name,
      `$.device.peripherals[${peripheralIndex}].name`,
      `Peripheral name "${peripheral.name}" must be unique within the device.`,
      'semantic.duplicate-peripheral-name',
      issues,
    )

    return normalizePeripheral(peripheral, peripheralIndex, device, issues)
  })

  const normalizedDevice: NormalizedSvdDevice = {
    name: device.name,
    version: device.version,
    description: device.description,
    addressUnitBits: device.addressUnitBits,
    width: device.width,
    size: device.size,
    access: device.access,
    resetValue: parseNumericInput(
      device.resetValue,
      '$.device.resetValue',
      'resetValue',
      issues,
    ),
    resetMask: parseNumericInput(
      device.resetMask,
      '$.device.resetMask',
      'resetMask',
      issues,
    ),
    peripherals: normalizedPeripherals,
  }

  ensureIssues('Semantic validation failed.', issues)

  return {
    device: normalizedDevice,
    metadata: {
      downloadFileName: `${sanitizeDeviceName(device.name)}.svd`,
    },
  }
}

export function assertNoSemanticIssues(input: SvdYamlInput): NormalizedSvdModel {
  try {
    return normalizeSvdInput(input)
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error
    }

    throw error
  }
}
