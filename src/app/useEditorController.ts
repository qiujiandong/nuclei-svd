import type { EditorDevice } from '../lib/editorModel'
import type { ConversionState } from './EditorApp'

export type EditorStats = {
  iregionGroupCount: number
  customGroupCount: number
  registerCount: number
  fieldCount: number
}

export type EditorControllerInput = {
  device: {
    state: EditorDevice
    collapsed: boolean
    actions: {
      setCollapsed: (collapsed: boolean) => void
      changeDevice: (field: keyof EditorDevice, value: string) => void
      changeIRegionBaseAddress: (value: string) => void
      reset: () => void
    }
  }
  template: {
    actions: {
      addPeripheralTemplate: () => void
      removePeripheralTemplate: (templateId: string) => void
      generatePeripheralFromTemplate: (templateId: string) => void
    }
  }
  peripheral: {
    stats: EditorStats
    actions: {
      addPeripheral: () => void
      removePeripheral: (peripheralId: string) => void
    }
  }
  register: {
    actions: {
      addRegister: (peripheralId: string) => void
      removeRegister: (peripheralId: string, registerId: string) => void
    }
  }
  conversion: {
    state: ConversionState
    canDownload: boolean
    actions: {
      convert: () => void
      download: () => void
    }
  }
}

export type EditorControllerGroups = {
  device: {
    state: EditorDevice
    collapsed: boolean
    actions: EditorControllerInput['device']['actions']
  }
  template: EditorControllerInput['template']
  peripheral: EditorControllerInput['peripheral']
  register: EditorControllerInput['register']
  conversion: EditorControllerInput['conversion']
}

export function useEditorController(input: EditorControllerInput): EditorControllerGroups {
  return input
}
