export interface ConversionIssue {
  path: string
  message: string
  rule: string
}

export class ConversionError extends Error {
  readonly issues: ConversionIssue[]

  constructor(message: string, issues: ConversionIssue[]) {
    super(message)
    this.name = 'ConversionError'
    this.issues = issues
  }
}

export function buildConversionIssue(
  path: string,
  message: string,
  rule: string,
): ConversionIssue {
  return {
    path,
    message,
    rule,
  }
}

export function ensureIssues(
  message: string,
  issues: ConversionIssue[],
): asserts issues is [] {
  if (issues.length > 0) {
    throw new ConversionError(message, issues)
  }
}
