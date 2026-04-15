import Ajv2020, { type ErrorObject } from 'ajv/dist/2020'

import { svdYamlSchema } from '../domain/schema'
import type { NormalizedSvdModel, SvdYamlInput } from '../types/svd'

import { ConversionError, buildConversionIssue } from './errors'
import { normalizeSvdInput } from './normalize'

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
})

const validateSchema = ajv.compile<SvdYamlInput>(svdYamlSchema)

function buildPath(instancePath: string, suffix?: string): string {
  const basePath = instancePath
    ? `$${instancePath
        .replace(/\/(\d+)/g, '[$1]')
        .replace(/\//g, '.')}`
    : '$'
  return suffix ? `${basePath}.${suffix}` : basePath
}

function mapSchemaError(error: ErrorObject) {
  if (error.keyword === 'required') {
    return buildConversionIssue(
      buildPath(error.instancePath, String(error.params.missingProperty)),
      `Missing required property "${String(error.params.missingProperty)}".`,
      'schema.required',
    )
  }

  if (error.keyword === 'additionalProperties') {
    return buildConversionIssue(
      buildPath(error.instancePath, String(error.params.additionalProperty)),
      `Unsupported property "${String(error.params.additionalProperty)}".`,
      'schema.additionalProperties',
    )
  }

  if (error.keyword === 'enum') {
    return buildConversionIssue(
      buildPath(error.instancePath),
      `Value must be one of ${String((error.params as { allowedValues?: unknown[] }).allowedValues?.join(', '))}.`,
      'schema.enum',
    )
  }

  return buildConversionIssue(
    buildPath(error.instancePath),
    error.message ?? 'Schema validation failed.',
    `schema.${error.keyword}`,
  )
}

export function validateSvdInput(input: unknown): NormalizedSvdModel {
  const isValid = validateSchema(input)

  if (!isValid) {
    throw new ConversionError(
      'YAML schema validation failed.',
      (validateSchema.errors ?? []).map((error) => mapSchemaError(error)),
    )
  }

  return normalizeSvdInput(input)
}
