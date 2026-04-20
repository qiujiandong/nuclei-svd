import { ACCESS_VALUES } from '../types/svd'

const scalarAddressSchema = {
  anyOf: [
    { type: 'integer', minimum: 0 },
    {
      type: 'string',
      pattern: '^(?:0|[1-9]\\d*|0x[0-9A-Fa-f]+)$',
    },
  ],
} as const

const accessSchema = {
  type: 'string',
  enum: [...ACCESS_VALUES],
} as const

export const svdYamlSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['device'],
  properties: {
    device: {
      type: 'object',
      additionalProperties: false,
      required: [
        'name',
        'version',
        'description',
        'addressUnitBits',
        'width',
        'peripherals',
      ],
      properties: {
        name: { type: 'string', minLength: 1 },
        version: { type: 'string', minLength: 1 },
        description: { type: 'string', minLength: 1 },
        addressUnitBits: { type: 'integer', minimum: 0 },
        width: { type: 'integer', minimum: 0 },
        size: { type: 'integer', minimum: 0 },
        access: accessSchema,
        resetValue: scalarAddressSchema,
        resetMask: scalarAddressSchema,
        peripherals: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'description', 'baseAddress'],
            properties: {
              name: { type: 'string', minLength: 1 },
              description: { type: 'string', minLength: 1 },
              baseAddress: scalarAddressSchema,
              derivedFrom: { type: 'string', minLength: 1 },
              groupName: { type: 'string', minLength: 1 },
              registers: {
                type: 'array',
                minItems: 1,
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['name', 'description', 'addressOffset'],
                  properties: {
                    name: { type: 'string', minLength: 1 },
                    description: { type: 'string', minLength: 1 },
                    addressOffset: scalarAddressSchema,
                    derivedFrom: { type: 'string', minLength: 1 },
                    size: { type: 'integer', minimum: 0 },
                    access: accessSchema,
                    resetValue: scalarAddressSchema,
                    resetMask: scalarAddressSchema,
                    fields: {
                      type: 'array',
                      items: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['name', 'description', 'bitOffset', 'bitWidth'],
                        properties: {
                          name: { type: 'string', minLength: 1 },
                          description: { type: 'string', minLength: 1 },
                          bitOffset: { type: 'integer', minimum: 0 },
                          bitWidth: { type: 'integer', minimum: 0 },
                          access: accessSchema,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const
