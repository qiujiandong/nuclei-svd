import { describe, expect, it } from 'vitest'

import invalidDuplicateAddressFixture from '../../fixtures/invalid-duplicate-address.yaml?raw'
import invalidDuplicateFieldNameFixture from '../../fixtures/invalid-duplicate-field-name.yaml?raw'
import invalidOverlappingFieldsFixture from '../../fixtures/invalid-overlapping-fields.yaml?raw'
import invalidSchemaFixture from '../../fixtures/invalid-schema.yaml?raw'
import validMinimalFixture from '../../fixtures/valid-minimal.yaml?raw'
import validRealisticFixture from '../../fixtures/valid-realistic.yaml?raw'

import type { SvdYamlInput } from '../types/svd'

import { ConversionError } from './errors'
import { parseYaml } from './parseYaml'
import { validateSvdInput } from './validate'

function parseFixture(source: string): SvdYamlInput {
  return parseYaml(source) as SvdYamlInput
}

describe('validateSvdInput', () => {
  it('rejects missing required device.name', () => {
    expect(() => validateSvdInput(parseFixture(invalidSchemaFixture))).toThrowError(
      ConversionError,
    )

    try {
      validateSvdInput(parseFixture(invalidSchemaFixture))
    } catch (error) {
      const conversionError = error as ConversionError
      expect(conversionError.issues).toContainEqual(
        expect.objectContaining({
          path: '$.device.name',
          rule: 'schema.required',
        }),
      )
    }
  })

  it('rejects invalid access enum values', () => {
    const parsed = parseFixture(validMinimalFixture)
    parsed.device.access = 'nope' as SvdYamlInput['device']['access']

    expect(() => validateSvdInput(parsed)).toThrowError(ConversionError)
  })

  it('rejects malformed address literals', () => {
    const parsed = parseFixture(validMinimalFixture)
    parsed.device.peripherals[0]!.baseAddress = '0xXYZ'

    expect(() => validateSvdInput(parsed)).toThrowError(ConversionError)

    try {
      validateSvdInput(parsed)
    } catch (error) {
      const conversionError = error as ConversionError
      expect(conversionError.issues).toContainEqual(
        expect.objectContaining({
          path: '$.device.peripherals[0].baseAddress',
          rule: 'schema.pattern',
        }),
      )
    }
  })

  it('rejects duplicate register absolute addresses within one peripheral', () => {
    expect(() =>
      validateSvdInput(parseFixture(invalidDuplicateAddressFixture)),
    ).toThrowError(ConversionError)
  })

  it('rejects duplicate field names within a register', () => {
    expect(() =>
      validateSvdInput(parseFixture(invalidDuplicateFieldNameFixture)),
    ).toThrowError(ConversionError)
  })

  it('rejects overlapping field bit ranges', () => {
    expect(() =>
      validateSvdInput(parseFixture(invalidOverlappingFieldsFixture)),
    ).toThrowError(ConversionError)
  })

  it('normalizes address offsets, inheritance, and overrides', () => {
    const normalized = validateSvdInput(parseFixture(validRealisticFixture))
    const gpioControl = normalized.device.peripherals[0]!.registers[0]!
    const gpioStatus = normalized.device.peripherals[0]!.registers[1]!
    const timerCount = normalized.device.peripherals[1]!.registers[0]!

    expect(gpioControl.absoluteAddress).toBe(0x40000000)
    expect(gpioStatus.absoluteAddress).toBe(0x40000004)
    expect(gpioControl.size).toBe(32)
    expect(gpioControl.access).toBe('read-write')
    expect(gpioControl.resetMask).toBe(0xffffffff)
    expect(gpioControl.fields[0]?.access).toBe('read-write')
    expect(gpioControl.fields[1]?.access).toBe('read-only')
    expect(gpioStatus.resetValue).toBe(0x1)
    expect(timerCount.size).toBe(16)
  })

  it('accepts numeric literals and 0x-prefixed strings in the same document', () => {
    const normalized = validateSvdInput(parseFixture(validRealisticFixture))
    const gpioBaseAddress = normalized.device.peripherals[0]!.baseAddress
    const timerBaseAddress = normalized.device.peripherals[1]!.baseAddress

    expect(gpioBaseAddress).toBe(0x40000000)
    expect(timerBaseAddress).toBe(1073745920)
  })
})
