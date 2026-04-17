import { describe, expect, it } from 'vitest'

import validRealisticFixture from '../../fixtures/valid-realistic.yaml?raw'
import invalidSyntaxFixture from '../../fixtures/invalid-syntax.yaml?raw'

import { ConversionError } from './errors'
import { parseYaml } from './parseYaml'

describe('parseYaml', () => {
  it('parses the canonical valid YAML fixture', () => {
    const parsed = parseYaml(validRealisticFixture) as {
      device: { name: string; peripherals: unknown[] }
    }

    expect(parsed.device.name).toBe('NucleiDemoRV32')
    expect(parsed.device.peripherals).toHaveLength(2)
  })

  it('rejects malformed YAML with readable location metadata', () => {
    expect(() => parseYaml(invalidSyntaxFixture)).toThrowError(ConversionError)

    try {
      parseYaml(invalidSyntaxFixture)
    } catch (error) {
      expect(error).toBeInstanceOf(ConversionError)
      const conversionError = error as ConversionError
      expect(conversionError.issues[0]?.path).toContain('line')
      expect(conversionError.issues[0]?.rule).toMatch(/^yaml\./)
      expect(conversionError.issues[0]?.message.length).toBeGreaterThan(0)
    }
  })
})
