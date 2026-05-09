import type { EditorAccess } from './editorModel'

import iregionSource from './iregion.js?raw'

export type PresetFieldDefinition = {
  name: string
  description: string
  bitOffset: string
  bitWidth: string
  access?: EditorAccess
}

export type PresetRegisterDefinition = {
  name: string
  description: string
  addressOffset: string
  size?: string
  access?: EditorAccess
  fields?: PresetFieldDefinition[]
}

export type PresetPeripheralDefinition = {
  name: string
  description: string
  baseAddress: string
  registers: PresetRegisterDefinition[]
}

type IRegionField = {
  bits: string
  name: string
  type?: string
  description?: string
}

type IRegionRegister = {
  name: string
  description?: string
  permission?: string
  offset: string
  fields?: IRegionField[]
}

type IRegionUnit = {
  unit: string
  offset: string
  description?: string
  regs: IRegionRegister[]
}

function loadIRegionUnits(source: string): IRegionUnit[] {
  return Function(`${source}; return allUnits;`)() as IRegionUnit[]
}

function normalizeHex(value: string) {
  return value.replace(/_/g, '')
}

function normalizeName(name: string, index?: number) {
  return name
    .replace(/\[i\]/g, index === undefined ? '{index}' : String(index))
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/[^A-Za-z0-9_{}]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

function accessFromPermission(permission?: string): EditorAccess {
  if (!permission) {
    return ''
  }

  const value = permission.toUpperCase()
  if (value.includes('RW') || value.includes('W1C/R')) {
    return 'read-write'
  }
  if (value.includes('W1C')) {
    return 'write-only'
  }
  if (value.includes('WO') || value === 'W') {
    return 'write-only'
  }
  if (value.includes('RO') || value.includes('/R') || value === 'MR') {
    return 'read-only'
  }

  return ''
}

function normalizeBitExpression(part: string) {
  const trimmed = part.trim().replace(/[()]/g, '')
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed)
  }
  if (trimmed === 'core_num-1' || trimmed === 'core_num_1') {
    return 15
  }
  if (trimmed === 'core_num+15') {
    return 31
  }

  const symbols: Record<string, number> = {
    CLICINTCTLBITS: 3,
    nlbits: 1,
  }
  const numericExpression = trimmed.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (symbol) => {
    const value = symbols[symbol]
    return value === undefined ? symbol : String(value)
  })

  if (/^\d+(?:[+-]\d+)*$/.test(numericExpression)) {
    return numericExpression
      .match(/[+-]?\d+/g)
      ?.reduce((sum, value) => sum + Number(value), 0) ?? Number.NaN
  }

  return Number.NaN
}

function parseBits(bits: string) {
  const [hiRaw, loRaw] = bits.split(':')
  if (loRaw === undefined) {
    const bit = normalizeBitExpression(hiRaw)
    const normalizedBit = Number.isNaN(bit) ? 0 : bit
    return { bitOffset: String(normalizedBit), bitWidth: '1', maxBit: normalizedBit }
  }

  const hi = normalizeBitExpression(hiRaw)
  const lo = normalizeBitExpression(loRaw)
  if (Number.isNaN(hi) || Number.isNaN(lo)) {
    return { bitOffset: '0', bitWidth: '32', maxBit: 31 }
  }

  return {
    bitOffset: String(Math.min(hi, lo)),
    bitWidth: String(Math.abs(hi - lo) + 1),
    maxBit: Math.max(hi, lo),
  }
}

function offsetAtIndex(offset: string, index: number, indexedName: boolean) {
  const normalized = normalizeHex(offset.replace(/\s+/g, ''))
  if (!normalized.includes('i')) {
    const base = Number.parseInt(normalized, 16)
    return indexedName && !Number.isNaN(base)
      ? `0x${(base + 4 * index).toString(16).toUpperCase()}`
      : normalized
  }

  const match = normalized.match(/^(0x[0-9a-fA-F]+)(?:\+([0-9]+)\*i)?$/)
  if (!match) {
    return normalized.replace(/i/g, String(index))
  }

  const base = Number.parseInt(match[1], 16)
  const stride = match[2] ? Number(match[2]) : 0
  return `0x${(base + stride * index).toString(16).toUpperCase()}`
}

function uniquifyFieldName(name: string, existingNames: Map<string, number>) {
  const nextCount = existingNames.get(name) ?? 0
  existingNames.set(name, nextCount + 1)

  return nextCount === 0 ? name : `${name}_${nextCount}`
}

function uniquifyRegisterNames(registers: PresetRegisterDefinition[]) {
  const registerNameCounts = new Map<string, number>()

  return registers.map((register) => {
    const nextCount = registerNameCounts.get(register.name) ?? 0
    registerNameCounts.set(register.name, nextCount + 1)

    return nextCount === 0
      ? register
      : {
          ...register,
          name: `${register.name}_${nextCount}`,
        }
  })
}

function createRegisterInstances(register: IRegionRegister) {
  const indexed = register.name.includes('[i]') || register.offset.includes('i')
  let count = indexed ? 8 : 1

  if (register.name === "SOURCE[i]_PRIORITY") {
    count = 128
  } else if (register.name === "PENDING[i]") {
    count = 4
  } else if (register.name === "M_INT_ENABLE[i]") {
    count = 4
  } else if (register.name === "S_INT_ENABLE[i]") {
    count = 4
  } else if (register.name.includes('clicint') && register.name.includes('[i]')) {
    count = 64
  }

  return Array.from({ length: count }, (_, index): PresetRegisterDefinition => {
    const fieldNameCounts = new Map<string, number>()
    const fields = (register.fields ?? []).map((field) => {
      const parsedBits = parseBits(field.bits)
      const fieldName = normalizeName(field.name, indexed ? index : undefined)
      return {
        name: uniquifyFieldName(fieldName, fieldNameCounts),
        description: (field.description ?? '').replace(/\bi\b/g, String(index)),
        bitOffset: parsedBits.bitOffset,
        bitWidth: parsedBits.bitWidth,
        access: accessFromPermission(field.type),
        maxBit: parsedBits.maxBit,
      }
    })
    const maxBit = fields.reduce((currentMax, field) => Math.max(currentMax, field.maxBit), 31)

    return {
      name: indexed ? normalizeName(register.name, index) : normalizeName(register.name),
      description: indexed
        ? (register.description ?? '').replace(/\bi\b/g, String(index))
        : (register.description ?? ''),
      addressOffset: offsetAtIndex(register.offset, index, register.name.includes('[i]')),
      ...(maxBit >= 32 ? { size: '64' } : {}),
      ...optionalAccess(register.permission),
      fields: fields.map(({ maxBit: _maxBit, ...field }) => field),
    }
  })
}

function optionalAccess(permission?: string) {
  const access = accessFromPermission(permission)
  return access ? { access } : {}
}

export function createIRegionUnitDefinitions(): PresetPeripheralDefinition[] {
  return loadIRegionUnits(iregionSource).map((unit) => ({
    name: unit.unit.toUpperCase(),
    description: unit.description ?? '',
    baseAddress: normalizeHex(unit.offset),
    registers: uniquifyRegisterNames(
      unit.regs.flatMap((register) => createRegisterInstances(register)),
    ),
  }))
}
