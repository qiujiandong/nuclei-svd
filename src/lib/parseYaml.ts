import { LineCounter, parseDocument, type YAMLError } from 'yaml'

import { ConversionError, buildConversionIssue } from './errors'

function describeYamlPath(error: YAMLError, lineCounter: LineCounter): string {
  const position = error.linePos?.[0] ?? lineCounter.linePos(error.pos[0])
  if (position.line > 0) {
    return `line ${position.line}, col ${position.col}`
  }

  return '$'
}

function mapYamlError(error: YAMLError, lineCounter: LineCounter) {
  return buildConversionIssue(
    describeYamlPath(error, lineCounter),
    error.message,
    `yaml.${error.code.toLowerCase()}`,
  )
}

export function parseYaml(input: string): unknown {
  const lineCounter = new LineCounter()
  const document = parseDocument(input, {
    lineCounter,
    prettyErrors: true,
  })

  if (document.errors.length > 0) {
    throw new ConversionError(
      'YAML syntax validation failed.',
      document.errors.map((error) => mapYamlError(error, lineCounter)),
    )
  }

  return document.toJS()
}
