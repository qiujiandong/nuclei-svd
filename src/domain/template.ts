export const svdYamlTemplate = `device:
  name: NucleiDemoRV32
  version: "1.0.0"
  description: Nuclei CPU reference <device> & debug target
  addressUnitBits: 8
  width: 32
  size: 32
  access: read-write
  resetValue: "0x00000000"
  resetMask: "0xFFFFFFFF"
  peripherals:
    - name: ECLIC
      description: Enhanced Core-Local Interrupt Controller
      baseAddress: "0x40000000"
      groupName: CPU
      registers:
        - name: CFG
          description: Core interrupt control <main> & mode
          addressOffset: "0x0"
          fields:
            - name: ENABLE
              description: Enables interrupt handling
              bitOffset: 0
              bitWidth: 1
            - name: MODE
              description: Selects trigger mode
              bitOffset: 1
              bitWidth: 2
              access: read-only
        - name: STATUS
          description: Interrupt status register
          addressOffset: 4
          access: read-only
          resetValue: "0x00000001"
          fields:
            - name: READY
              description: Interrupt logic ready flag
              bitOffset: 0
              bitWidth: 1
    - name: MTIMER
      description: Machine timer block
      baseAddress: 1073745920
      registers:
        - name: COUNT
          description: Current machine timer count
          addressOffset: "0x10"
          size: 16
          fields:
            - name: VALUE
              description: Machine timer counter value
              bitOffset: 0
              bitWidth: 16
`
