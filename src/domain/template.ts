export const svdYamlTemplate = `device:
  name: DemoChip
  version: "1.0.0"
  description: Demo <chip> & debug target
  addressUnitBits: 8
  width: 32
  size: 32
  access: read-write
  resetValue: "0x00000000"
  resetMask: "0xFFFFFFFF"
  peripherals:
    - name: GPIOA
      description: GPIO bank A
      baseAddress: "0x40000000"
      groupName: GPIO
      registers:
        - name: CTRL
          description: Control <main> & mode
          addressOffset: "0x0"
          fields:
            - name: ENABLE
              description: Enables block
              bitOffset: 0
              bitWidth: 1
            - name: MODE
              description: Selects mode
              bitOffset: 1
              bitWidth: 2
              access: read-only
        - name: STATUS
          description: Status register
          addressOffset: 4
          access: read-only
          resetValue: "0x00000001"
          fields:
            - name: READY
              description: Ready flag
              bitOffset: 0
              bitWidth: 1
    - name: TIMER0
      description: Timer block
      baseAddress: 1073745920
      registers:
        - name: COUNT
          description: Current count
          addressOffset: "0x10"
          size: 16
          fields:
            - name: VALUE
              description: Counter value
              bitOffset: 0
              bitWidth: 16
`
