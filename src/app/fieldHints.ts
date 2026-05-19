export const FIELD_HINTS: Record<string, string> = {
  设备名称: '生成 <device><name>，也会作为默认下载文件名的一部分。',
  版本: '生成 SVD device.version，用于标识当前设备描述版本。',
  addressUnitBits: '地址最小寻址单位位宽，CMSIS-SVD 常用值为 8。',
  width: '设备默认总线访问位宽，常见 Nuclei CPU 配置为 32。',
  '默认 size': '寄存器未单独设置 size 时继承该默认位宽。',
  '默认 access': '寄存器或位域未设置访问权限时继承该默认值。',
  '默认 resetValue': '寄存器未设置 resetValue 时继承该复位值。',
  '默认 resetMask': '寄存器未设置 resetMask 时继承该复位掩码。',
  设备描述: '生成 device.description，用于说明当前 Nuclei CPU/SoC 目标。',
  'IREGION 基地址': 'IREGION 所有内置寄存器组会以该地址为基准计算实际地址。',
  模板名称: '模板名称会被实例通过 derivedFrom 引用；改名后请确认实例引用关系。',
  name: '生成 SVD 中的 peripheral 名称，同一 device 下必须唯一。',
  groupName: '生成 SVD groupName，用于将相关 peripheral 归组显示。',
  baseAddress: '寄存器组基地址，寄存器绝对地址 = baseAddress + addressOffset。',
  description: '生成该项的 description，用于在调试工具中展示说明。',
  模板描述: '生成模板寄存器组或模板寄存器的 description。',
  寄存器名称: '生成 SVD register.name，同一寄存器组内必须唯一。',
  addressOffset: '寄存器相对当前寄存器组 baseAddress 的偏移地址。',
  寄存器描述: '生成寄存器 description，用于说明寄存器用途。',
  access: '访问权限；留空时继承设备或寄存器默认 access。',
  size: '寄存器位宽；留空时继承设备默认 size。',
  resetValue: '寄存器复位值；留空时继承设备默认 resetValue。',
  resetMask: '寄存器复位有效位掩码；留空时继承设备默认 resetMask。',
  位域名称: '生成 SVD field.name，同一寄存器内必须唯一。',
  bitOffset: '位域起始 bit，下标从 0 开始。',
  bitWidth: '位域宽度；bitOffset + bitWidth 不能超过寄存器 size。',
  位域描述: '生成位域 description，用于说明 bit 域含义。',
}

export function labelHintFor(label: HTMLLabelElement) {
  const labelText = label.querySelector('span')?.textContent?.trim()
  return labelText ? FIELD_HINTS[labelText] : undefined
}
