import type { NormalizedSvdModel } from '../types/svd'

import { parseYaml } from './parseYaml'
import { transformToSvd } from './transformToSvd'
import { validateSvdInput } from './validate'

export function convertYamlToSvd(input: string): {
  xml: string
  normalized: NormalizedSvdModel
  issues?: never
} {
  const parsed = parseYaml(input)
  const normalized = validateSvdInput(parsed)
  const xml = transformToSvd(normalized)

  return {
    xml,
    normalized,
  }
}
