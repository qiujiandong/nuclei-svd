export type FieldGuideItem = {
  title: string
  summary: string
  bullets: string[]
}

export const fieldGuide: FieldGuideItem[] = [
  {
    title: '设备信息',
    summary: '定义整个 Nuclei CPU / SoC 目标的基础信息，也是生成文件名和默认属性继承的来源。',
    bullets: [
      '设备名称会生成 <device><name>，也会作为默认下载文件名。',
      'addressUnitBits 和 width 用于声明总线访问粒度。',
      '默认 size / access / resetValue / resetMask 会向下继承给寄存器。',
    ],
  },
  {
    title: '寄存器组',
    summary: '每个寄存器组对应一个 peripheral，适合描述核内模块或外设块，baseAddress 是寄存器地址计算的起点。',
    bullets: [
      'baseAddress 支持十进制或 0x 前缀十六进制。',
      '同一 device 下组名称必须唯一。',
      '寄存器的 addressOffset 必须相对当前组的 baseAddress 填写。',
    ],
  },
  {
    title: '寄存器',
    summary: '寄存器位于寄存器组内部，addressOffset 与 baseAddress 共同决定绝对地址。',
    bullets: [
      '绝对地址 = group.baseAddress + register.addressOffset。',
      '同一寄存器组内寄存器名称、绝对地址必须唯一。',
      'size / access / resetValue / resetMask 可覆盖设备默认值。',
    ],
  },
  {
    title: '位域',
    summary: '位域描述寄存器内 bit 区间，适合在 Nuclei Studio IDE 中展示字段含义。',
    bullets: [
      '字段名称在单个寄存器内必须唯一。',
      'bitOffset + bitWidth 不能越界，也不能与其他字段重叠。',
      'field.access 可覆盖继承来的访问属性。',
    ],
  },
]
