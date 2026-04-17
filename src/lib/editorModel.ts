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

function formatHex(value: number) {
  return `0x${value.toString(16).toUpperCase()}`
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

function createPresetRegister({
  name,
  description,
  addressOffset,
  size = '32',
  access = '',
}: {
  name: string
  description: string
  addressOffset: string
  size?: string
  access?: EditorAccess
}): EditorRegister {
  return createEmptyRegister({
    name,
    description,
    addressOffset,
    size,
    access,
    resetValue: '',
    resetMask: '',
    expanded: false,
    fields: [],
  })
}

function createRangeRegisters({
  count,
  startOffset,
  stride,
  nameAt,
  descriptionAt,
  size = '32',
  access = '',
}: {
  count: number
  startOffset: number
  stride: number
  nameAt: (index: number, offset: number) => string
  descriptionAt: (index: number, offset: number) => string
  size?: string
  access?: EditorAccess
}) {
  const registers: EditorRegister[] = []

  for (let index = 0; index < count; index += 1) {
    const offset = startOffset + index * stride
    registers.push(
      createPresetRegister({
        name: nameAt(index, offset),
        description: descriptionAt(index, offset),
        addressOffset: formatHex(offset),
        size,
        access,
      }),
    )
  }

  return registers
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
    registers: [createEmptyRegister()],
    ...overrides,
  }
}

function createIInfoRegisters() {
  return [
    createPresetRegister({
      name: 'mpasize',
      addressOffset: '0x0',
      description: 'Physical address size information register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'cmo_info',
      addressOffset: '0x4',
      description: 'RISC-V CMO implementation information register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'sec_base_addr_lo',
      addressOffset: '0x8',
      description: 'Security controller base address low register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'sec_base_addr_hi',
      addressOffset: '0xC',
      description: 'Security controller base address high register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'sec_cfg_info',
      addressOffset: '0x10',
      description: 'Security configuration information register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'mvlm_cfg_lo',
      addressOffset: '0x24',
      description: 'VLM base address low configuration register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'mvlm_cfg_hi',
      addressOffset: '0x28',
      description: 'VLM base address high configuration register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'flash_base_addr_lo',
      addressOffset: '0x2C',
      description: 'Flash bus base address low register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'flash_base_addr_hi',
      addressOffset: '0x30',
      description: 'Flash bus base address high register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'vpu_cfg_info',
      addressOffset: '0x50',
      description: 'VPU related information register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'mem_region0_cfg_lo',
      addressOffset: '0x54',
      description: 'Hardware memory-region0 low configuration register.',
    }),
    createPresetRegister({
      name: 'mem_region0_cfg_hi',
      addressOffset: '0x58',
      description: 'Hardware memory-region0 high configuration register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'mem_region1_cfg_lo',
      addressOffset: '0x5C',
      description: 'Hardware memory-region1 low configuration register.',
    }),
    createPresetRegister({
      name: 'mem_region1_cfg_hi',
      addressOffset: '0x60',
      description: 'Hardware memory-region1 high configuration register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'isa_support0',
      addressOffset: '0x70',
      description: 'Hardware ISA support information register 0.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'isa_support1',
      addressOffset: '0x74',
      description: 'Hardware ISA support information register 1.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'mcppi_cfg_lo',
      addressOffset: '0x80',
      description: 'CPPI base address low and control information register.',
    }),
    createPresetRegister({
      name: 'mcppi_cfg_hi',
      addressOffset: '0x84',
      description: 'CPPI base address high register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'mpftctl',
      addressOffset: '0x88',
      description: 'Power brake configuration control register.',
    }),
    createPresetRegister({
      name: 'performance_cfg0',
      addressOffset: '0x90',
      description: 'Hardware performance configuration register 0.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'performance_cfg1',
      addressOffset: '0x94',
      description: 'Hardware performance configuration register 1.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'pfl1dctrl1',
      addressOffset: '0x100',
      description: 'Hardware cache prefetch control register 1.',
    }),
    createPresetRegister({
      name: 'pfl1dctrl2',
      addressOffset: '0x104',
      description: 'Hardware cache prefetch control register 2.',
    }),
    createPresetRegister({
      name: 'mergel1dctrl',
      addressOffset: '0x108',
      description: 'Hardware cache write streaming or merge control register.',
    }),
    createPresetRegister({
      name: 'safety_ctrl',
      addressOffset: '0x110',
      description: 'Safety function control register.',
    }),
    createPresetRegister({
      name: 'access_ctrl',
      addressOffset: '0x114',
      description: 'Controls S-mode access to IINFO permissioned registers.',
    }),
    createPresetRegister({
      name: 'pfl1dctrl3',
      addressOffset: '0x120',
      description: 'Hardware cache prefetch control register 3.',
    }),
    createPresetRegister({
      name: 'pfl1dctrl4',
      addressOffset: '0x124',
      description: 'Hardware cache prefetch control register 4.',
    }),
    createPresetRegister({
      name: 'pfl1info',
      addressOffset: '0x128',
      description: 'Hardware prefetch information register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'crc_rf0',
      addressOffset: '0x198',
      description: 'Register x22 CRC value register.',
    }),
    createPresetRegister({
      name: 'crc_rf1',
      addressOffset: '0x19C',
      description: 'Register x23 CRC value register.',
    }),
    createPresetRegister({
      name: 'crc_fp0',
      addressOffset: '0x1A0',
      description: 'Register f23 CRC value register.',
    }),
    createPresetRegister({
      name: 'etrace_info',
      addressOffset: '0x1A4',
      description: 'etrace configuration information register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'ecc_inj_addr_lo',
      addressOffset: '0x1A8',
      description: 'Low 32-bit address of precise ECC injection.',
    }),
    createPresetRegister({
      name: 'ecc_inj_addr_hi',
      addressOffset: '0x1AC',
      description: 'High 32-bit address of precise ECC injection.',
    }),
    createPresetRegister({
      name: 'ecc_inj_way',
      addressOffset: '0x1B0',
      description: 'Precise ECC injection way selection register.',
    }),
    createPresetRegister({
      name: 'mem_crc_x22_lo',
      addressOffset: '0x300',
      description: 'Lower word CRC input register for x22.',
    }),
    createPresetRegister({
      name: 'mem_crc_x22_hi',
      addressOffset: '0x304',
      description: 'Higher word CRC input register for x22.',
    }),
    createPresetRegister({
      name: 'mem_crc_x23_lo',
      addressOffset: '0x308',
      description: 'Lower word CRC input register for x23.',
    }),
    createPresetRegister({
      name: 'mem_crc_x23_hi',
      addressOffset: '0x30C',
      description: 'Higher word CRC input register for x23.',
    }),
    createPresetRegister({
      name: 'mem_crc_f23_lo',
      addressOffset: '0x310',
      description: 'Lower word CRC input register for f23.',
    }),
    createPresetRegister({
      name: 'mem_crc_f23_hi',
      addressOffset: '0x314',
      description: 'Higher word CRC input register for f23.',
    }),
  ]
}

function createTimerRegisters() {
  return [
    createPresetRegister({
      name: 'mtime_lo',
      addressOffset: '0x0',
      description: 'Lower 32-bit value of mtime.',
    }),
    createPresetRegister({
      name: 'mtime_hi',
      addressOffset: '0x4',
      description: 'Upper 32-bit value of mtime.',
    }),
    createPresetRegister({
      name: 'mtimecmp_lo',
      addressOffset: '0x8',
      description: 'Lower 32-bit value of mtimecmp.',
    }),
    createPresetRegister({
      name: 'mtimecmp_hi',
      addressOffset: '0xC',
      description: 'Upper 32-bit value of mtimecmp.',
    }),
    createPresetRegister({
      name: 'mtime_srw_ctrl',
      addressOffset: '0xFEC',
      description: 'Control whether S-mode can access timer registers.',
    }),
    createPresetRegister({
      name: 'msftrst',
      addressOffset: '0xFF0',
      description: 'Generate soft-reset request.',
    }),
    createPresetRegister({
      name: 'setssip',
      addressOffset: '0xFF4',
      description: 'Generate the S-mode software interrupt.',
    }),
    createPresetRegister({
      name: 'mtimectl',
      addressOffset: '0xFF8',
      description: 'Control time counter features.',
    }),
    createPresetRegister({
      name: 'msip',
      addressOffset: '0xFFC',
      description: 'Generate the M-mode software interrupt.',
    }),
    ...createRangeRegisters({
      count: 4,
      startOffset: 0x1000,
      stride: 4,
      nameAt: (index) => `MSIPforHart-${index}`,
      descriptionAt: (index) => `Software interrupt register for hart ${index}.`,
    }),
    ...createRangeRegisters({
      count: 4,
      startOffset: 0x5000,
      stride: 8,
      nameAt: (index) => `MTIMECMPforHart-${index}`,
      descriptionAt: (index) => `M-mode timer compare register for hart ${index}.`,
      size: '64',
    }),
    createPresetRegister({
      name: 'MTIME',
      addressOffset: '0xCFF8',
      description: 'Global MTIME register in CLINT mode.',
      size: '64',
    }),
    ...createRangeRegisters({
      count: 4,
      startOffset: 0xD000,
      stride: 4,
      nameAt: (index) => `SETSSIP${index}`,
      descriptionAt: (index) => `Set supervisor software interrupt request for hart ${index}.`,
    }),
  ]
}

function createEclicRegisters() {
  return [
    createPresetRegister({
      name: 'cliccfg',
      addressOffset: '0x0',
      description: 'Global ECLIC configuration register.',
    }),
    createPresetRegister({
      name: 'clicinfo',
      addressOffset: '0x4',
      description: 'Global ECLIC information register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'mth',
      addressOffset: '0xB',
      description: 'Target interrupt threshold level register.',
    }),
    ...createRangeRegisters({
      count: 4096,
      startOffset: 0x1000,
      stride: 4,
      nameAt: (index) => `clicintip${index}`,
      descriptionAt: (index) => `Interrupt source ${index} pending flag register.`,
      size: '8',
    }),
    ...createRangeRegisters({
      count: 4096,
      startOffset: 0x1001,
      stride: 4,
      nameAt: (index) => `clicintie${index}`,
      descriptionAt: (index) => `Interrupt source ${index} enable register.`,
      size: '8',
    }),
    ...createRangeRegisters({
      count: 4096,
      startOffset: 0x1002,
      stride: 4,
      nameAt: (index) => `clicintattr${index}`,
      descriptionAt: (index) => `Interrupt source ${index} attribute register.`,
      size: '8',
    }),
    ...createRangeRegisters({
      count: 4096,
      startOffset: 0x1003,
      stride: 4,
      nameAt: (index) => `clicintctl${index}`,
      descriptionAt: (index) => `Interrupt source ${index} level/priority control register.`,
      size: '8',
    }),
  ]
}

function createPlicRegisters() {
  return [
    ...createRangeRegisters({
      count: 1023,
      startOffset: 0x4,
      stride: 4,
      nameAt: (index) => `SOURCE${index + 1}_PRIORITY`,
      descriptionAt: (index) => `Priority register for interrupt source ${index + 1}.`,
    }),
    ...createRangeRegisters({
      count: 32,
      startOffset: 0x1000,
      stride: 4,
      nameAt: (index) => `PENDING_ARRAY_WORD${index}`,
      descriptionAt: (index) =>
        `Pending array word ${index}, covering interrupt sources ${index * 32}-${index * 32 + 31}.`,
    }),
    ...createRangeRegisters({
      count: 32,
      startOffset: 0x2000,
      stride: 4,
      nameAt: (index) => `HART0_M_ENABLE_WORD${index}`,
      descriptionAt: (index) =>
        `Hart 0 M-mode enable word ${index}, covering interrupt sources ${index * 32}-${index * 32 + 31}.`,
    }),
    ...createRangeRegisters({
      count: 32,
      startOffset: 0x2080,
      stride: 4,
      nameAt: (index) => `HART0_S_ENABLE_WORD${index}`,
      descriptionAt: (index) =>
        `Hart 0 S-mode enable word ${index}, covering interrupt sources ${index * 32}-${index * 32 + 31}.`,
    }),
    createPresetRegister({
      name: 'HART0_M_THRESHOLD',
      addressOffset: '0x200000',
      description: 'Hart 0 M-mode priority threshold register.',
    }),
    createPresetRegister({
      name: 'HART0_M_CLAIM_COMPLETE',
      addressOffset: '0x200004',
      description: 'Hart 0 M-mode claim/complete register.',
    }),
    createPresetRegister({
      name: 'HART0_S_THRESHOLD',
      addressOffset: '0x201000',
      description: 'Hart 0 S-mode priority threshold register.',
    }),
    createPresetRegister({
      name: 'HART0_S_CLAIM_COMPLETE',
      addressOffset: '0x201004',
      description: 'Hart 0 S-mode claim/complete register.',
    }),
    createPresetRegister({
      name: 'plic_srw_ctrl',
      addressOffset: '0x3FFFFFC',
      description: 'Controls S-mode access to PLIC priority and pending registers.',
    }),
  ]
}

function createCiduRegisters() {
  return [
    ...createRangeRegisters({
      count: 32,
      startOffset: 0x0,
      stride: 4,
      nameAt: (index) => `CORE${index}_INT_STATUS`,
      descriptionAt: (index) => `Inter-core interrupt status register for core ${index}.`,
    }),
    ...createRangeRegisters({
      count: 32,
      startOffset: 0x80,
      stride: 4,
      nameAt: (index) => `SEMAPHORE${index}`,
      descriptionAt: (index) => `Semaphore register ${index}.`,
    }),
    createPresetRegister({
      name: 'ICI_SHADOW_REG',
      addressOffset: '0x3FFC',
      description: 'Inter-core interrupt source core ID and target core ID register.',
    }),
    ...createRangeRegisters({
      count: 4096,
      startOffset: 0x4000,
      stride: 4,
      nameAt: (index) => `INT${index}_INDICATOR`,
      descriptionAt: (index) => `Indicator register for external interrupt ${index}.`,
    }),
    ...createRangeRegisters({
      count: 4096,
      startOffset: 0x8000,
      stride: 4,
      nameAt: (index) => `INT${index}_MASK`,
      descriptionAt: (index) => `Mask register for external interrupt ${index}.`,
    }),
    createPresetRegister({
      name: 'CORE_NUM',
      addressOffset: '0xC084',
      description: 'Indicates the static core count in the cluster.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'INT_NUM',
      addressOffset: '0xC090',
      description: 'Indicates the static interrupt count in the cluster.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'CIDU_SRW_CTRL',
      addressOffset: '0xC09C',
      description: 'Controls S-mode access to CIDU registers.',
    }),
  ]
}

function createSmpCcRegisters() {
  return [
    createPresetRegister({
      name: 'SMP_VER',
      addressOffset: '0x0',
      description: 'Machine mode SMP version register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'SMP_CFG',
      addressOffset: '0x4',
      description: 'Machine mode SMP configuration register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'CC_CFG',
      addressOffset: '0x8',
      description: 'Machine mode cluster cache configuration register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'SMP_ENB',
      addressOffset: '0xC',
      description: 'Machine mode SMP enable register.',
    }),
    createPresetRegister({
      name: 'CC_CTRL',
      addressOffset: '0x10',
      description: 'Machine mode cluster cache control register.',
    }),
    createPresetRegister({
      name: 'CC_mCMD',
      addressOffset: '0x14',
      description: 'Machine mode cluster cache command and status register.',
    }),
    createPresetRegister({
      name: 'CC_ERR_INJ',
      addressOffset: '0x18',
      description: 'Cluster cache ECC error injection control register.',
    }),
    createPresetRegister({
      name: 'CC_RECV_CNT',
      addressOffset: '0x1C',
      description: 'Cluster cache ECC recoverable error count register.',
    }),
    createPresetRegister({
      name: 'CC_FATAL_CNT',
      addressOffset: '0x20',
      description: 'Cluster cache ECC fatal error count register.',
    }),
    createPresetRegister({
      name: 'CC_RECV_THV',
      addressOffset: '0x24',
      description: 'Cluster cache ECC recoverable error threshold register.',
    }),
    createPresetRegister({
      name: 'CC_FATAL_THV',
      addressOffset: '0x28',
      description: 'Cluster cache ECC fatal error threshold register.',
    }),
    createPresetRegister({
      name: 'CC_BUS_ERR_ADDR',
      addressOffset: '0x2C',
      description: 'Cluster cache maintain-operation bus error address register.',
      size: '64',
    }),
    ...createRangeRegisters({
      count: 32,
      startOffset: 0x40,
      stride: 4,
      nameAt: (index) => `CLIENT${index}_ERR_STATUS`,
      descriptionAt: (index) => `Cluster cache client ${index} error status register.`,
    }),
    createPresetRegister({
      name: 'CC_sCMD',
      addressOffset: '0xC0',
      description: 'Supervisor mode cluster cache command and status register.',
    }),
    createPresetRegister({
      name: 'CC_uCMD',
      addressOffset: '0xC4',
      description: 'User mode cluster cache command and status register.',
    }),
    createPresetRegister({
      name: 'SNOOP_PENDING',
      addressOffset: '0xC8',
      description: 'Core snoop pending register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'TRANS_PENDING',
      addressOffset: '0xCC',
      description: 'Core transaction pending register.',
      access: 'read-only',
    }),
    createPresetRegister({
      name: 'CLM_ADDR_BASE',
      addressOffset: '0xD0',
      description: 'Cluster local memory base address register.',
      size: '64',
    }),
    createPresetRegister({
      name: 'CLM_WAY_EN',
      addressOffset: '0xD8',
      description: 'Cluster local memory way enable register.',
    }),
    createPresetRegister({
      name: 'CC_INVALID_ALL',
      addressOffset: '0xDC',
      description: 'Cluster cache invalidate all register.',
    }),
    createPresetRegister({
      name: 'STM_CTRL',
      addressOffset: '0xE0',
      description: 'Stream read/write control register.',
    }),
    createPresetRegister({
      name: 'STM_CFG',
      addressOffset: '0xE4',
      description: 'Stream read/write configuration register.',
    }),
    createPresetRegister({
      name: 'STM_TIMEOUT',
      addressOffset: '0xE8',
      description: 'Stream read/write timeout register.',
    }),
    createPresetRegister({
      name: 'DFF_PROT',
      addressOffset: '0xEC',
      description: 'Hardware register protect enable register.',
    }),
    createPresetRegister({
      name: 'ECC_ERR_MSK',
      addressOffset: '0xF0',
      description: 'Cluster cache ECC error mask register.',
    }),
    ...createRangeRegisters({
      count: 16,
      startOffset: 0x100,
      stride: 8,
      nameAt: (index) => `NS_RG${index}`,
      descriptionAt: (index) => `Non-sharable memory region ${index} register.`,
      size: '64',
    }),
    ...createRangeRegisters({
      count: 16,
      startOffset: 0x180,
      stride: 4,
      nameAt: (index) => `SMP_PMON_SEL${index}`,
      descriptionAt: (index) => `Performance monitor event selector register ${index}.`,
    }),
    ...createRangeRegisters({
      count: 16,
      startOffset: 0x1C0,
      stride: 8,
      nameAt: (index) => `SMP_PMON_CNT${index}`,
      descriptionAt: (index) => `Performance monitor event counter register ${index}.`,
      size: '64',
    }),
    ...createRangeRegisters({
      count: 32,
      startOffset: 0x280,
      stride: 8,
      nameAt: (index) => `CLIENT${index}_ERR_ADDR`,
      descriptionAt: (index) => `Cluster cache client ${index} error address register.`,
      size: '64',
    }),
    ...createRangeRegisters({
      count: 32,
      startOffset: 0x380,
      stride: 4,
      nameAt: (index) => `CLIENT${index}_WAY_MASK`,
      descriptionAt: (index) => `Cluster cache client ${index} way mask register.`,
    }),
    createPresetRegister({
      name: 'CC_INV_RANGE',
      addressOffset: '0x720',
      description: 'Cluster invalidate range control and status register.',
    }),
    createPresetRegister({
      name: 'CC_INV_RANGE_START',
      addressOffset: '0x724',
      description: 'Cluster invalidate range start address register.',
    }),
    createPresetRegister({
      name: 'CC_INV_RANGE_END',
      addressOffset: '0x72C',
      description: 'Cluster invalidate range end address register.',
    }),
    createPresetRegister({
      name: 'CC_ECC_INJ_WAY',
      addressOffset: '0x740',
      description: 'Cluster precise ECC injection way register.',
    }),
    createPresetRegister({
      name: 'CC_ECC_INJ_ADDR',
      addressOffset: '0x744',
      description: 'Cluster precise ECC injection address register.',
    }),
    createPresetRegister({
      name: 'CC_ECC_INJ_DATA',
      addressOffset: '0x74C',
      description: 'Cluster precise ECC injection data register.',
    }),
    createPresetRegister({
      name: 'IOCP_ATTR_RMP',
      addressOffset: '0x750',
      description: 'IOCP attribute remap register.',
    }),
  ]
}

function createIRegionPeripherals() {
  return [
    createEmptyPeripheral({
      name: 'IINFO',
      description: 'IREGION internal information registers.',
      baseAddress: '0x00000000',
      groupName: 'IREGION',
      expanded: false,
      registers: createIInfoRegisters(),
    }),
    createEmptyPeripheral({
      name: 'DEBUG',
      description:
        'IREGION DEBUG address space. IREGION.pdf enumerates the unit but does not provide an internal register list.',
      baseAddress: '0x00010000',
      groupName: 'IREGION',
      expanded: false,
      registers: [
        createPresetRegister({
          name: 'DEBUG_WINDOW',
          addressOffset: '0x0',
          description: 'DEBUG unit register window placeholder derived from the IREGION top-level table.',
        }),
      ],
    }),
    createEmptyPeripheral({
      name: 'ECLIC',
      description: 'Enhanced Core-Local Interrupt Controller registers.',
      baseAddress: '0x00020000',
      groupName: 'IREGION',
      expanded: false,
      registers: createEclicRegisters(),
    }),
    createEmptyPeripheral({
      name: 'TIMER',
      description: 'Timer unit registers.',
      baseAddress: '0x00030000',
      groupName: 'IREGION',
      expanded: false,
      registers: createTimerRegisters(),
    }),
    createEmptyPeripheral({
      name: 'SMP_CC',
      description: 'SMP and cluster cache registers.',
      baseAddress: '0x00040000',
      groupName: 'IREGION',
      expanded: false,
      registers: createSmpCcRegisters(),
    }),
    createEmptyPeripheral({
      name: 'CIDU',
      description: 'Cluster Interrupt Distribution Unit registers.',
      baseAddress: '0x00050000',
      groupName: 'IREGION',
      expanded: false,
      registers: createCiduRegisters(),
    }),
    createEmptyPeripheral({
      name: 'PLIC',
      description: 'Platform-Level Interrupt Controller registers.',
      baseAddress: '0x04000000',
      groupName: 'IREGION',
      expanded: false,
      registers: createPlicRegisters(),
    }),
  ]
}

export function createDefaultEditorDevice(): EditorDevice {
  return {
    name: 'NucleiIREGION',
    version: '1.0.0',
    description:
      'Default IREGION register map derived from IREGION.pdf. Group base addresses correspond to IREGION offsets with an assumed base of 0x0.',
    addressUnitBits: '8',
    width: '32',
    size: '32',
    access: 'read-write',
    resetValue: '0x00000000',
    resetMask: '0xFFFFFFFF',
    peripherals: createIRegionPeripherals(),
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
