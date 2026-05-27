import { describe, expect, it } from 'vitest'
import { buildSvdInputFromEditor, createDefaultEditorDevice } from './editorModel'
import { normalizeSvdInput } from './normalize'
import { transformToSvd } from './transformToSvd'

describe('transformToSvd', () => {
  it('transforms a configured editor device into deterministic XML', () => {
    const device = createDefaultEditorDevice()
    const first = transformToSvd(normalizeSvdInput(buildSvdInputFromEditor(device)))
    const second = transformToSvd(normalizeSvdInput(buildSvdInputFromEditor(device)))

    expect(first).toBe(second)
    expect(first).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(first).toContain('<device schemaVersion=')
    expect(first).toContain('<name>NucleiDemo</name>')
    expect(first).toContain('<name>IINFO</name>')
    expect(first).not.toContain('<access>')
    expect(first).not.toContain('<resetValue>')
    expect(first).not.toContain('<resetMask>')
  })

  it('omits optional nodes cleanly for a minimal normalized model', () => {
    const device = createDefaultEditorDevice()
    device.name = 'MinimalDevice'
    device.description = 'Minimal description'
    device.peripheralTemplates = []
    device.peripherals = [
      {
        id: 'peripheral-1',
        name: 'SYSCTRL',
        description: 'System control peripheral',
        baseAddress: '0x40001000',
        defaultRegisterSize: '',
        groupName: '',
        expanded: false,
        registerTemplates: [],
        registers: [
          {
            id: 'register-1',
            name: 'INFO',
            description: 'Core information register',
            addressOffset: '0x0',
            dim: '',
            dimIncrement: '',
            derivedFrom: undefined,
            size: '',
            access: '',
            resetValue: '',
            resetMask: '',
            expanded: false,
            fields: [],
          },
        ],
      },
    ]

    const xml = transformToSvd(normalizeSvdInput(buildSvdInputFromEditor(device)))

    expect(xml).toContain('<name>MinimalDevice</name>')
    const sysctrlBlock = xml.split('<name>SYSCTRL</name>')[1]?.split('</peripheral>')[0] ?? ''
    expect(sysctrlBlock).not.toContain('<groupName>')
    expect(sysctrlBlock).not.toContain('<fields>')
    expect(xml).not.toContain('<resetValue>')
    expect(xml).not.toContain('<resetMask>')
  })

  it('numbers generated reserved fields by reserved-field count', () => {
    const device = createDefaultEditorDevice()
    device.peripherals = [
      {
        id: 'peripheral-1',
        name: 'TEST',
        description: 'Test peripheral',
        baseAddress: '0x40000000',
        defaultRegisterSize: '8',
        groupName: 'TEST',
        expanded: true,
        registerTemplates: [],
        registers: [
          {
            id: 'register-1',
            name: 'CTRL',
            description: 'Control register',
            addressOffset: '0x0',
            dim: '',
            dimIncrement: '',
            derivedFrom: undefined,
            size: '8',
            access: '',
            resetValue: '',
            resetMask: '',
            expanded: true,
            fields: [
              {
                id: 'field-1',
                name: 'F0',
                description: 'Field 0',
                bitOffset: '1',
                bitWidth: '1',
                access: '',
                expanded: true,
              },
              {
                id: 'field-2',
                name: 'F1',
                description: 'Field 1',
                bitOffset: '4',
                bitWidth: '1',
                access: '',
                expanded: true,
              },
            ],
          },
        ],
      },
    ]

    const xml = transformToSvd(normalizeSvdInput(buildSvdInputFromEditor(device)))

    expect(xml).toContain('<name>RESERVED0</name>')
    expect(xml).toContain('<name>RESERVED1</name>')
    expect(xml).toContain('<name>RESERVED2</name>')
  })
})
