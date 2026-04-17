import { describe, expect, it } from 'vitest'

import invalidDuplicateAddressFixture from '../../fixtures/invalid-duplicate-address.yaml?raw'
import invalidDuplicateFieldNameFixture from '../../fixtures/invalid-duplicate-field-name.yaml?raw'
import invalidOverlappingFieldsFixture from '../../fixtures/invalid-overlapping-fields.yaml?raw'
import invalidSchemaFixture from '../../fixtures/invalid-schema.yaml?raw'
import invalidSyntaxFixture from '../../fixtures/invalid-syntax.yaml?raw'
import validMinimalFixture from '../../fixtures/valid-minimal.yaml?raw'
import validRealisticFixture from '../../fixtures/valid-realistic.yaml?raw'

import { ConversionError } from './errors'
import { convertYamlToSvd } from './convertYamlToSvd'

describe('convertYamlToSvd', () => {
  it('converts the minimal fixture into XML', () => {
    const { xml, normalized } = convertYamlToSvd(validMinimalFixture)

    expect(normalized.device.name).toBe('NucleiMinimalSoC')
    expect(normalized.device.peripherals[0].registers[0].absoluteAddress).toBe(0x40001000)
    expect(xml).toContain('<device')
    expect(xml).toContain('<name>NucleiMinimalSoC</name>')
    expect(xml).toContain('<baseAddress>0x40001000</baseAddress>')
    expect(xml).toContain('<addressOffset>0x0</addressOffset>')
  })

  it('normalizes inherited defaults and lower-level overrides', () => {
    const { normalized } = convertYamlToSvd(validRealisticFixture)
    const [ctrl, status] = normalized.device.peripherals[0].registers

    expect(ctrl.access).toBe('read-write')
    expect(ctrl.resetMask).toBe(0xffffffff)
    expect(status.access).toBe('read-only')
  })

  it('rejects malformed YAML syntax', () => {
    expect(() => convertYamlToSvd(invalidSyntaxFixture)).toThrow(ConversionError)
  })

  it('rejects schema-invalid YAML', () => {
    try {
      convertYamlToSvd(invalidSchemaFixture)
    } catch (error) {
      expect(error).toBeInstanceOf(ConversionError)
      expect((error as ConversionError).issues[0]?.rule).toMatch(/^schema\./)
      return
    }

    throw new Error('Expected schema validation to fail')
  })

  it('rejects duplicate absolute addresses in a peripheral', () => {
    expect(() => convertYamlToSvd(invalidDuplicateAddressFixture)).toThrowError(
      /Semantic validation failed/,
    )
  })

  it('rejects duplicate field names within a register', () => {
    try {
      convertYamlToSvd(invalidDuplicateFieldNameFixture)
    } catch (error) {
      expect(
        (error as ConversionError).issues.some(
          (issue) => issue.rule === 'semantic.duplicate-field-name',
        ),
      ).toBe(true)
      return
    }

    throw new Error('Expected duplicate field name validation to fail')
  })

  it('rejects overlapping field ranges', () => {
    try {
      convertYamlToSvd(invalidOverlappingFieldsFixture)
    } catch (error) {
      expect(
        (error as ConversionError).issues.some(
          (issue) => issue.rule === 'semantic.field-overlap',
        ),
      ).toBe(true)
      return
    }

    throw new Error('Expected overlapping fields validation to fail')
  })
})
