import { AccessSelect } from '../editor/AccessSelect'
import type { EditorDevice } from '../../lib/editorModel'

export type DeviceInfoPageProps = {
  device: EditorDevice
  onDeviceChange: (field: keyof EditorDevice, value: string) => void
  onIRegionBaseAddressChange: (value: string) => void
}

export function DeviceInfoPage({
  device,
  onDeviceChange,
}: DeviceInfoPageProps) {
  return (
    <div className="register-settings-panel">
      <label>
        <span>设备名称</span>
        <input value={device.name} onChange={(event) => onDeviceChange('name', event.target.value)} />
      </label>
      <label>
        <span>版本</span>
        <input value={device.version} onChange={(event) => onDeviceChange('version', event.target.value)} />
      </label>
      <label>
        <span>addressUnitBits</span>
        <input
          value={device.addressUnitBits}
          onChange={(event) => onDeviceChange('addressUnitBits', event.target.value)}
          inputMode="numeric"
        />
      </label>
      <label>
        <span>width</span>
        <input
          value={device.width}
          onChange={(event) => onDeviceChange('width', event.target.value)}
          inputMode="numeric"
        />
      </label>
      <label>
        <span>默认 size</span>
        <input
          value={device.size}
          onChange={(event) => onDeviceChange('size', event.target.value)}
          inputMode="numeric"
        />
      </label>
      <AccessSelect
        value={device.access}
        onChange={(nextValue) => onDeviceChange('access', nextValue)}
        label="默认 access"
      />
      <label>
        <span>默认 resetValue</span>
        <input
          value={device.resetValue}
          onChange={(event) => onDeviceChange('resetValue', event.target.value)}
          placeholder="0x00000000"
        />
      </label>
      <label>
        <span>默认 resetMask</span>
        <input
          value={device.resetMask}
          onChange={(event) => onDeviceChange('resetMask', event.target.value)}
          placeholder="0xFFFFFFFF"
        />
      </label>
      <label className="device-span-full">
        <span>设备描述</span>
        <input value={device.description} onChange={(event) => onDeviceChange('description', event.target.value)} />
      </label>
    </div>
  )
}
