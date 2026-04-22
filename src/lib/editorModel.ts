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
  size = '32',
  access = '',
  fields = [],
}: {
  name: string
  description: string
  addressOffset: string
  size?: string
  access?: EditorAccess
  fields?: PresetFieldDefinition[]
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
    fields: fields.map((field) => createPresetField(field)),
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
    registerTemplates: [],
    registers: [createEmptyRegister()],
    ...overrides,
  }
}

export function createDefaultRegisterTemplate(index = 0): EditorRegister {
  return createEmptyRegister({
    name: `REG_TEMPLATE${index}`,
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
    name: `GROUP${index}`,
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
    name: `GROUP_TEMPLATE${index}`,
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
      fields: [
        { name: 'cmo_cfg', bitOffset: '0', bitWidth: '1', description: 'CMO exists.' },
        { name: 'cmo_pft', bitOffset: '1', bitWidth: '1', description: 'CMO has prefetch.' },
        { name: 'cmo_size', bitOffset: '2', bitWidth: '4', description: 'Cache block size.' },
        { name: 'cbozero_size', bitOffset: '6', bitWidth: '4', description: 'Cache block size of cbo.zero.' },
      ],
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
      fields: [
        { name: 'security', bitOffset: '0', bitWidth: '1', description: 'Security feature support.' },
        { name: 'sec_debug', bitOffset: '1', bitWidth: '1', description: 'Secure debug feature support.' },
        { name: 'arcg', bitOffset: '2', bitWidth: '1', description: 'Architecture random clock gate feature support.' },
        { name: 'remap', bitOffset: '3', bitWidth: '1', description: 'Vector table remap feature support.' },
        { name: 'parity_protection', bitOffset: '4', bitWidth: '1', description: 'Register parity protection feature support.' },
        { name: 'trwb', bitOffset: '5', bitWidth: '1', description: 'Garbage register write-back feature support.' },
        { name: 'ppi_lock', bitOffset: '6', bitWidth: '1', description: 'PPI lock feature support.' },
        { name: 'cct', bitOffset: '7', bitWidth: '1', description: 'Instruction execution time consistency feature support.' },
        { name: 'cache_froze', bitOffset: '8', bitWidth: '1', description: 'Cache frozen feature support.' },
        { name: 'sec_mon_bus', bitOffset: '9', bitWidth: '1', description: 'Security monitor bus feature support.' },
        { name: 'exe_monitor', bitOffset: '10', bitWidth: '1', description: 'Execution monitor feature support.' },
        { name: 'key_state_clear', bitOffset: '11', bitWidth: '1', description: 'Key state clear feature support.' },
        { name: 'data_polarity', bitOffset: '12', bitWidth: '1', description: 'Data polarity feature support.' },
        { name: 'random_ins_insert', bitOffset: '13', bitWidth: '1', description: 'Random instruction insert feature support.' },
        { name: 'power_disturb', bitOffset: '14', bitWidth: '1', description: 'Power scrambling feature support.' },
        { name: 'stack_check', bitOffset: '15', bitWidth: '1', description: 'Stack check feature support.' },
        { name: 'bjp_random_flush', bitOffset: '16', bitWidth: '1', description: 'BJP instruction random flush feature support.' },
        { name: 'parity_mode', bitOffset: '17', bitWidth: '1', description: 'Parity mode when parity_protection is enabled.' },
        { name: 'mpu_num', bitOffset: '22', bitWidth: '5', description: 'Number of MPU entries.' },
        { name: 'bbox_num', bitOffset: '27', bitWidth: '5', description: 'Number of BBOX entries.' },
      ],
    }),
    createPresetRegister({
      name: 'mvlm_cfg_lo',
      addressOffset: '0x24',
      description: 'VLM base address low configuration register.',
      access: 'read-only',
      fields: [
        { name: 'vlm', bitOffset: '0', bitWidth: '1', description: 'VLM configuration exists.' },
        { name: 'vlm_size', bitOffset: '1', bitWidth: '5', description: 'VLM size.' },
        { name: 'vlm_base_lo', bitOffset: '10', bitWidth: '22', description: 'VLM base address low bits.' },
      ],
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
      fields: [
        { name: 'flash', bitOffset: '0', bitWidth: '1', description: 'Flash bus configuration exists.' },
        { name: 'flash_size', bitOffset: '1', bitWidth: '5', description: 'Flash size.' },
        { name: 'flash_base_lo', bitOffset: '10', bitWidth: '22', description: 'Flash base address low bits.' },
      ],
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
      fields: [
        { name: 'exist', bitOffset: '0', bitWidth: '1', description: 'Memory region configuration exists.' },
        { name: 'mem_region_size', bitOffset: '1', bitWidth: '5', description: 'Memory region size.' },
        { name: 'mem_region_ena', bitOffset: '9', bitWidth: '1', description: 'Enable memory region.' },
        { name: 'mem_region_base_lo', bitOffset: '10', bitWidth: '22', description: 'Memory region base address low bits.' },
      ],
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
      fields: [
        { name: 'exist', bitOffset: '0', bitWidth: '1', description: 'Memory region configuration exists.' },
        { name: 'mem_region_size', bitOffset: '1', bitWidth: '5', description: 'Memory region size.' },
        { name: 'mem_region_ena', bitOffset: '9', bitWidth: '1', description: 'Enable memory region.' },
        { name: 'mem_region_base_lo', bitOffset: '10', bitWidth: '22', description: 'Memory region base address low bits.' },
      ],
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
      name: 'MTIMER',
      addressOffset: '0x0',
      description: 'System Timer current value 64-bit register.',
      size: '64',
    }),
    createPresetRegister({
      name: 'MTIMERCMP',
      addressOffset: '0x8',
      description: 'System Timer compare value 64-bit register.',
      size: '64',
    }),
    createPresetRegister({
      name: 'MTIME_SRW_CTRL',
      addressOffset: '0xFEC',
      description: 'Control whether S-mode can access timer registers.',
      fields: [
        { name: 'SRW', bitOffset: '0', bitWidth: '1', description: 'Control S-mode read/write access.' },
      ],
    }),
    createPresetRegister({
      name: 'MSFTRST',
      addressOffset: '0xFF0',
      description: 'Generate soft-reset request.',
    }),
    createPresetRegister({
      name: 'SSIP',
      addressOffset: '0xFF4',
      description: 'S-mode System Timer software interrupt register.',
      fields: [
        { name: 'SSIP', bitOffset: '0', bitWidth: '1', description: 'S-mode software interrupt pending bit.' },
      ],
    }),
    createPresetRegister({
      name: 'MTIMECTL',
      addressOffset: '0xFF8',
      description: 'System Timer control register, previously MSTOP register.',
      fields: [
        { name: 'TIMESTOP', bitOffset: '0', bitWidth: '1', description: 'Stop the timer.' },
        { name: 'CMPCLREN', bitOffset: '1', bitWidth: '1', description: 'Clear timer interrupt when compare value is updated.' },
        { name: 'CLKSRC', bitOffset: '2', bitWidth: '1', description: 'Timer clock source select.' },
        { name: 'HDBG', bitOffset: '3', bitWidth: '1', description: 'Timer behavior in halt debug mode.' },
        { name: 'MTIME_SRC', bitOffset: '4', bitWidth: '1', description: 'MTIME source select.' },
      ],
    }),
    createPresetRegister({
      name: 'MSIP',
      addressOffset: '0xFFC',
      description: 'Generate the M-mode software interrupt.',
      fields: [
        { name: 'MSIP', bitOffset: '0', bitWidth: '1', description: 'M-mode software interrupt pending bit.' },
      ],
    }),
    ...createRangeRegisters({
      count: 4,
      startOffset: 0x1000,
      stride: 4,
      nameAt: (index) => `CLINT_MSIP_HART${index}`,
      descriptionAt: (index) => `Software interrupt register for hart ${index}.`,
    }),
    ...createRangeRegisters({
      count: 4,
      startOffset: 0x5000,
      stride: 8,
      nameAt: (index) => `CLINT_MTIMECMP_HART${index}`,
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
      nameAt: (index) => `CLINT_SSIP_HART${index}`,
      descriptionAt: (index) => `Set supervisor software interrupt request for hart ${index}.`,
    }),
  ]
}

function createEclicRegisters() {
  return [
    createPresetRegister({
      name: 'CFG',
      addressOffset: '0x0',
      description: 'CLIC configuration register.',
      size: '8',
      fields: [
        { name: 'nlbits', bitOffset: '1', bitWidth: '4', description: 'Bit-width of level and priority in CLICINTCTL.' },
        { name: 'nmbits', bitOffset: '5', bitWidth: '2', description: 'Supervisor-level interrupt support indicator.' },
      ],
    }),
    createPresetRegister({
      name: 'INFO',
      addressOffset: '0x4',
      description: 'CLIC information register.',
      access: 'read-only',
      fields: [
        { name: 'numint', bitOffset: '0', bitWidth: '13', description: 'Maximum interrupt inputs supported.' },
        { name: 'version', bitOffset: '13', bitWidth: '8', description: 'Hardware implementation version number.' },
        { name: 'intctlbits', bitOffset: '21', bitWidth: '4', description: 'Implemented hardware bits in CLICINTCTL.' },
        { name: 'shd_num', bitOffset: '25', bitWidth: '4', description: 'Number of shadow register groups.' },
      ],
    }),
    createPresetRegister({
      name: 'MTH',
      addressOffset: '0xB',
      description: 'CLIC machine mode interrupt-level threshold.',
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
