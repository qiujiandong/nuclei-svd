import type { EditorDevice, EditorIRegionConfig } from '../../lib/editorModel'

export type IRegionTemplatePageProps = {
  device: EditorDevice
  onIRegionConfigChange: (field: keyof EditorIRegionConfig, value: string) => void
  onIRegionBaseAddressChange: (value: string) => void
}

// function summarizeName(value: string, fallback: string) {
//   const trimmed = value.trim()
//   return trimmed.length > 0 ? trimmed : fallback
// }

// function formatResolvedAddress(baseAddress: string, offset: string) {
//   const parsedBase = Number(baseAddress)
//   const parsedOffset = Number(offset)
//
//   if (!Number.isInteger(parsedBase) || !Number.isInteger(parsedOffset)) {
//     return '--'
//   }
//
//   return `0x${(parsedBase + parsedOffset).toString(16).toUpperCase()}`
// }

export function IRegionTemplatePage({
  device,
  onIRegionConfigChange,
  onIRegionBaseAddressChange,
}: IRegionTemplatePageProps) {
  return (
    <div className="register-settings-panel">
      <label>
        <span>IREGION 基地址</span>
        <input
          aria-label="IREGION 基地址"
          value={device.iregionBaseAddress}
          onChange={(event) => onIRegionBaseAddressChange(event.target.value)}
          placeholder="0x18000000"
        />
      </label>
      <label>
        <span>CPU Count</span>
        <input
          value={device.iregionConfig.cpuCount}
          onChange={(event) => onIRegionConfigChange('cpuCount', event.target.value)}
          inputMode="numeric"
          min={1}
          max={8}
          placeholder='8'
        />
      </label>
      <label>
        <span>ECLIC Interrupt Count</span>
        <input
          value={device.iregionConfig.eclicInterruptCount}
          onChange={(event) => onIRegionConfigChange('eclicInterruptCount', event.target.value)}
          inputMode="numeric"
          min={1}
          max={1024}
          placeholder='64'
        />
      </label>
      <label>
        <span>CIDU Interrupt Count</span>
        <input
          value={device.iregionConfig.ciduInterruptCount}
          onChange={(event) => onIRegionConfigChange('ciduInterruptCount', event.target.value)}
          inputMode="numeric"
          min={1}
          max={4096}
          placeholder='128'
        />
      </label>
      <label>
        <span>PLIC Interrupt Count</span>
        <input
          value={device.iregionConfig.plicInterruptCountX32}
          onChange={(event) => onIRegionConfigChange('plicInterruptCountX32', event.target.value)}
          inputMode="numeric"
          min={1}
          max={32}
          placeholder='8'
        />
      </label>
    </div>
  )
}
