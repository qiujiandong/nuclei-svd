import type { EditorDevice, EditorIRegionConfig } from '../../lib/editorModel'

export type IRegionTemplatePageProps = {
  device: EditorDevice
  onIRegionConfigChange: (field: keyof EditorIRegionConfig, value: string | boolean) => void
  onIRegionBaseAddressChange: (value: string) => void
}

const existenceFields: Array<{ field: keyof EditorIRegionConfig; label: string }> = [
  { field: 'iinfoExist', label: 'IINFO' },
  { field: 'debugExist', label: 'Debug' },
  { field: 'eclicExist', label: 'ECLIC' },
  { field: 'timerExist', label: 'Timer' },
  { field: 'smpExist', label: 'SMP' },
  { field: 'ciduExist', label: 'CIDU' },
  { field: 'plicExist', label: 'PLIC' },
]

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
      {device.iregionConfig.timerExist ? (
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
      ) : null}
      {device.iregionConfig.eclicExist ? (
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
      ) : null}
      {device.iregionConfig.ciduExist ? (
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

      ) : null}
      {device.iregionConfig.plicExist ? (
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
      ) : null}
      {existenceFields.map(({ field, label }) => (
        <label key={field}>
          <span>{label}</span>
          <input
            type="checkbox"
            checked={Boolean(device.iregionConfig[field])}
            onChange={(event) => onIRegionConfigChange(field, event.target.checked)}
          />
        </label>
      ))}
    </div>
  )
}
