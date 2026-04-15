export const ACCESS_VALUES = [
  'read-only',
  'write-only',
  'read-write',
  'writeOnce',
  'read-writeOnce',
] as const

export type Access = (typeof ACCESS_VALUES)[number]
export type NumericInput = number | string

export interface SvdFieldInput {
  name: string
  description: string
  bitOffset: number
  bitWidth: number
  access?: Access
}

export interface SvdRegisterInput {
  name: string
  description: string
  addressOffset: NumericInput
  size?: number
  access?: Access
  resetValue?: NumericInput
  resetMask?: NumericInput
  fields?: SvdFieldInput[]
}

export interface SvdPeripheralInput {
  name: string
  description: string
  baseAddress: NumericInput
  groupName?: string
  registers: SvdRegisterInput[]
}

export interface SvdDeviceInput {
  name: string
  version: string
  description: string
  addressUnitBits: number
  width: number
  size?: number
  access?: Access
  resetValue?: NumericInput
  resetMask?: NumericInput
  peripherals: SvdPeripheralInput[]
}

export interface SvdYamlInput {
  device: SvdDeviceInput
}

export interface NormalizedSvdField {
  name: string
  description: string
  bitOffset: number
  bitWidth: number
  access?: Access
}

export interface NormalizedSvdRegister {
  name: string
  description: string
  addressOffset: number
  absoluteAddress: number
  size?: number
  access?: Access
  resetValue?: number
  resetMask?: number
  fields: NormalizedSvdField[]
}

export interface NormalizedSvdPeripheral {
  name: string
  description: string
  baseAddress: number
  groupName?: string
  registers: NormalizedSvdRegister[]
}

export interface NormalizedSvdDevice {
  name: string
  version: string
  description: string
  addressUnitBits: number
  width: number
  size?: number
  access?: Access
  resetValue?: number
  resetMask?: number
  peripherals: NormalizedSvdPeripheral[]
}

export interface NormalizedSvdModel {
  device: NormalizedSvdDevice
  metadata: {
    downloadFileName: string
  }
}
