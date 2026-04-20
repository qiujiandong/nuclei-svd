import type {
  NormalizedSvdField,
  NormalizedSvdModel,
  NormalizedSvdRegister,
} from '../types/svd'

import { formatHexValue } from './normalize'

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function textNode(name: string, value: number | string | undefined, indent: string) {
  if (value === undefined) return ''
  return `${indent}<${name}>${escapeXml(String(value))}</${name}>`
}

function openNode(name: string, attrs: Record<string, string | undefined>, indent: string) {
  const renderedAttrs = Object.entries(attrs)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([attrName, value]) => ` ${attrName}="${escapeXml(value)}"`)
    .join('')

  return `${indent}<${name}${renderedAttrs}>`
}

function fieldToXml(field: NormalizedSvdField, level: number) {
  const indent = '  '.repeat(level)
  const inner = '  '.repeat(level + 1)
  return [
    `${indent}<field>`,
    textNode('name', field.name, inner),
    textNode('description', field.description, inner),
    textNode('bitOffset', field.bitOffset, inner),
    textNode('bitWidth', field.bitWidth, inner),
    textNode('access', field.access, inner),
    `${indent}</field>`,
  ]
    .filter(Boolean)
    .join('\n')
}

function registerToXml(register: NormalizedSvdRegister, level: number) {
  const indent = '  '.repeat(level)
  const inner = '  '.repeat(level + 1)
  const lines = [
    openNode('register', { derivedFrom: register.derivedFrom }, indent),
    textNode('name', register.name, inner),
    textNode('description', register.description, inner),
    textNode('addressOffset', formatHexValue(register.addressOffset), inner),
    textNode('size', register.size, inner),
    textNode('access', register.access, inner),
    textNode('resetValue', register.resetValue !== undefined ? formatHexValue(register.resetValue) : undefined, inner),
    textNode('resetMask', register.resetMask !== undefined ? formatHexValue(register.resetMask) : undefined, inner),
  ].filter(Boolean)

  if (register.fields.length > 0) {
    lines.push(`${inner}<fields>`)
    register.fields.forEach((field) => {
      lines.push(fieldToXml(field, level + 2))
    })
    lines.push(`${inner}</fields>`)
  }

  lines.push(`${indent}</register>`)
  return lines.join('\n')
}

export function transformToSvd(model: NormalizedSvdModel): string {
  const { device } = model
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<device schemaVersion="1.3.9" xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" xs:noNamespaceSchemaLocation="CMSIS-SVD.xsd">',
    textNode('name', device.name, '  '),
    textNode('version', device.version, '  '),
    textNode('description', device.description, '  '),
    textNode('addressUnitBits', device.addressUnitBits, '  '),
    textNode('width', device.width, '  '),
    textNode('size', device.size, '  '),
    textNode('access', device.access, '  '),
    textNode('resetValue', device.resetValue !== undefined ? formatHexValue(device.resetValue) : undefined, '  '),
    textNode('resetMask', device.resetMask !== undefined ? formatHexValue(device.resetMask) : undefined, '  '),
    '  <peripherals>',
  ].filter(Boolean)

  device.peripherals.forEach((peripheral) => {
    lines.push(openNode('peripheral', { derivedFrom: peripheral.derivedFrom }, '    '))
    lines.push(textNode('name', peripheral.name, '      '))
    lines.push(textNode('description', peripheral.description, '      '))
    lines.push(textNode('groupName', peripheral.groupName, '      '))
    lines.push(textNode('baseAddress', formatHexValue(peripheral.baseAddress), '      '))
    if (peripheral.registers.length > 0) {
      lines.push('      <registers>')
      peripheral.registers.forEach((register) => {
        lines.push(registerToXml(register, 4))
      })
      lines.push('      </registers>')
    }
    lines.push('    </peripheral>')
  })

  lines.push('  </peripherals>')
  lines.push('</device>')
  return lines.filter(Boolean).join('\n')
}
