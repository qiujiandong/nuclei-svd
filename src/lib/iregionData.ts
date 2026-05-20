import type { EditorAccess, EditorIRegionConfig } from './editorModel'

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
  dim?: string
  dimIncrement?: string
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

function offsetAtIndex(offset: string, indexed: boolean) {
  const normalized = normalizeHex(offset.replace(/\s+/g, ''))
  if (!indexed) {
    return normalized
  }

  const match = normalized.match(/^(0x[0-9a-fA-F]+)(?:\+[0-9]+\*i)?$/)
  return match?.[1] ?? normalized
}

function offsetIncrement(offset: string) {
  const normalized = normalizeHex(offset.replace(/\s+/g, ''))
  const match = normalized.match(/^(0x[0-9a-fA-F]+)(?:\+([0-9]+)\*i)?$/)
  if (!match) {
    return '0x4'
  }
  const stride = match[2] ? Number(match[2]) : 0
  return `0x${stride.toString(16).toUpperCase()}`
}

function configuredCount(value: number, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function unitExists(unit: IRegionUnit, config: EditorIRegionConfig) {
  const unitName = unit.unit.toLowerCase()
  const existenceByUnit: Record<string, boolean> = {
    iinfo: config.iinfoExist,
    debug: config.debugExist,
    eclic: config.eclicExist,
    timer: config.timerExist,
    smp: config.smpExist,
    cidu: config.ciduExist,
    plic: config.plicExist,
  }

  return existenceByUnit[unitName] ?? true
}

function indexedRegisterCount(register: IRegionRegister, config: EditorIRegionConfig) {
  if (register.name === "SOURCE[i]_PRIORITY") {
    return configuredCount(config.plicInterruptCountX32, 4) * 32
  }
  if (register.name === "PENDING[i]") {
    return configuredCount(config.plicInterruptCountX32, 4)
  }
  if (register.name === "M_INT_ENABLE[i]") {
    return configuredCount(config.plicInterruptCountX32, 4)
  }
  if (register.name === "S_INT_ENABLE[i]") {
    return configuredCount(config.plicInterruptCountX32, 4)
  }
  if (register.name.includes('clicint') && register.name.includes('[i]')) {
    return configuredCount(config.eclicInterruptCount, 64)
  }
  if (register.name === 'CORE[i]_INT_STATUS' || register.name === 'SEMAPHORE[i]') {
    return 32
  }
  if (register.name === "INT[i]_INDICATOR") {
    return configuredCount(config.ciduInterruptCount, 32)
  }
  if (register.name === "INT[i]_MASK") {
    return configuredCount(config.ciduInterruptCount, 32)
  }
  if (register.name === "msip[i]" || register.name === "mtimecmp[i]" || register.name === "setssip[i]") {
    return configuredCount(config.cpuCount, 8)
  }

  return 8
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

// cidu -> core[i]_int_status has fixed count 32
// cidu -> semaphore[i] has fixed count 32
// register of eclic with [i] should support config -> ECLIC Interrupts
// register of timer msip0-7, mtimecmp0-7, setssip0-7 should support config -> CPU Count
// cidu -> int[i]_indicator and int[i]_mask should support config -> CIDU Interrupt Count
// plic -> source[i]_priority only support multiple of 32, the factor only support 0-31 -> PLIC Interrupt Count
function createRegisterInstances(register: IRegionRegister, config: EditorIRegionConfig): PresetRegisterDefinition {
  const indexed = register.name.includes('[i]') || register.offset.includes('i')
  const dim = indexed ? indexedRegisterCount(register, config) : undefined

  const fieldNameCounts = new Map<string, number>()
  const fields = (register.fields ?? []).map((field) => {
    const parsedBits = parseBits(field.bits)
    const fieldName = normalizeName(field.name)
    return {
      name: uniquifyFieldName(fieldName, fieldNameCounts),
      description: field.description ?? '',
      bitOffset: parsedBits.bitOffset,
      bitWidth: parsedBits.bitWidth,
      access: accessFromPermission(field.type),
      maxBit: parsedBits.maxBit,
    }
  })
  const maxBit = fields.reduce((currentMax, field) => Math.max(currentMax, field.maxBit), 31)

  return {
    name: indexed
      ? normalizeName(register.name).replace('{index}', '%s')
      : normalizeName(register.name),
    description: register.description ?? '',
    addressOffset: offsetAtIndex(register.offset, indexed),
    ...(dim
      ? {
        dim: String(dim),
        dimIncrement: offsetIncrement(register.offset),
      }
      : {}),
    ...(maxBit >= 32 ? { size: '64' } : {}),
    ...optionalAccess(register.permission),
    fields: fields.map(({ maxBit: _maxBit, ...field }) => field),
  }
}

function optionalAccess(permission?: string) {
  const access = accessFromPermission(permission)
  return access ? { access } : {}
}

export function createIRegionConfig(): EditorIRegionConfig {
  return {
    cpuCount: 8,
    eclicInterruptCount: 128,
    ciduInterruptCount: 32,
    plicInterruptCountX32: 4,
    iinfoExist: true,
    debugExist: false,
    eclicExist: true,
    timerExist: true,
    smpExist: true,
    ciduExist: true,
    plicExist: true,
  }
}

export function createIRegionUnitDefinitions(
  config: EditorIRegionConfig = createIRegionConfig(),
): PresetPeripheralDefinition[] {
  return loadIRegionUnits(iregionSource).filter((unit) => unitExists(unit, config)).map((unit) => ({
    name: unit.unit.toUpperCase(),
    description: unit.description ?? '',
    baseAddress: normalizeHex(unit.offset),
    registers: uniquifyRegisterNames(
      unit.regs.flatMap((register) => createRegisterInstances(register, config)),
    ),
  }))
}
