import { describe, expect, it } from 'vitest'

import invalidDuplicateFieldNameFixture from '../../fixtures/invalid-duplicate-field-name.yaml?raw'
import validMinimalFixture from '../../fixtures/valid-minimal.yaml?raw'
import validRealisticFixture from '../../fixtures/valid-realistic.yaml?raw'

import { svdYamlTemplate } from '../domain/template'

import { ConversionError } from './errors'
import { convertYamlToSvd } from './convertYamlToSvd'

describe('convertYamlToSvd', () => {
  it('converts the canonical fixture into deterministic CMSIS-SVD XML', () => {
    const first = convertYamlToSvd(validRealisticFixture)
    const second = convertYamlToSvd(validRealisticFixture)

    expect(first.xml).toBe(second.xml)
    expect(first.xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(first.xml).toContain('<device schemaVersion=')
    expect(first.xml).toContain('<peripherals>')
    expect(first.xml).toContain('<registers>')
    expect(first.xml).toContain('<fields>')
    expect(first.xml).toContain(
      '<description>Nuclei CPU reference &lt;device&gt; &amp; debug target</description>',
    )
    expect(first.xml).toContain('<baseAddress>0x40000000</baseAddress>')
    expect(first.xml).toContain('<addressOffset>0x10</addressOffset>')
    expect(first.xml).toContain('<resetValue>0x1</resetValue>')
    expect(first.xml).toContain('<bitWidth>16</bitWidth>')
    expect(first.normalized.metadata.downloadFileName).toBe('NucleiDemoRV32.svd')
  })

  it('omits optional nodes cleanly for the minimal fixture', () => {
    const { xml } = convertYamlToSvd(validMinimalFixture)

    expect(xml).not.toContain('<groupName>')
    expect(xml).not.toContain('<fields>')
    expect(xml).not.toContain('<resetMask>')
  })

  it('keeps the shipped template conversion-ready', () => {
    const { xml } = convertYamlToSvd(svdYamlTemplate)

    expect(xml).toContain('<name>NucleiDemoRV32</name>')
    expect(xml).toContain('<name>ECLIC</name>')
  })

  it('throws typed conversion issues on invalid input', () => {
    expect(() => convertYamlToSvd(invalidDuplicateFieldNameFixture)).toThrowError(
      ConversionError,
    )
  })
})
