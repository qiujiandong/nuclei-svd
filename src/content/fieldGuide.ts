export type FieldGuideItem = {
  title: string
  summary: string
  bullets: string[]
}

export const fieldGuide: FieldGuideItem[] = [
  {
    title: 'device',
    summary: '定义整个 Nuclei CPU / SoC 目标的基础信息，也是生成文件名和默认属性继承的来源。',
    bullets: [
      'name 用于 <device><name>，也会作为默认下载文件名。',
      'addressUnitBits、width 必填，用于声明 Nuclei 调试目标的总线访问粒度。',
      '可选默认值 size / access / resetValue / resetMask 会被寄存器继承。',
    ],
  },
  {
    title: 'peripherals[]',
    summary: '每个 peripheral 对应一个 Nuclei CPU 外设块或核内模块，baseAddress 是寄存器地址计算的起点。',
    bullets: [
      'baseAddress 支持 YAML 数字或 0x 前缀字符串。',
      '同一 device 下 peripheral 名称必须唯一。',
      'register.addressOffset 必须相对 peripheral.baseAddress 填写。',
    ],
  },
  {
    title: 'registers[]',
    summary: '寄存器位于 peripheral 内部，addressOffset 与 baseAddress 共同决定绝对地址。',
    bullets: [
      '绝对地址 = peripheral.baseAddress + register.addressOffset。',
      '同一 peripheral 内 register 名称、绝对地址必须唯一。',
      'size / access / resetValue / resetMask 可覆盖 device 默认值。',
    ],
  },
  {
    title: 'fields[]',
    summary: '字段描述寄存器内 bit 区间，适合在 Nuclei 调试器或 IDE 中展示位域含义。',
    bullets: [
      '字段名称在单个寄存器内必须唯一。',
      'bitOffset + bitWidth 不能越界，也不能与其他字段重叠。',
      'field.access 可覆盖继承来的访问属性。',
    ],
  },
]
