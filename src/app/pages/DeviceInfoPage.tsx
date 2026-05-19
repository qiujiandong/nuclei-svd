import { AccessSelect } from '../editor/AccessSelect'
import type { EditorDevice } from '../../lib/editorModel'

export type DeviceInfoPageProps = {
  device: EditorDevice
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onDeviceChange: (field: keyof EditorDevice, value: string) => void
  onIRegionBaseAddressChange: (value: string) => void
}

export function DeviceInfoPage({
  device,
  collapsed,
  onCollapsedChange,
  onDeviceChange,
  onIRegionBaseAddressChange,
}: DeviceInfoPageProps) {
  return (
    <div className={`editor-workspace ${collapsed ? 'device-info-collapsed' : ''}`}>
      <aside className="device-info-panel" aria-label="设备基础信息设置">
        <div className="device-info-header">
          <div>
            <p className="eyebrow">Device profile</p>
            <h3>设备基础信息</h3>
          </div>
          <button
            type="button"
            className="secondary collapse-side-button"
            aria-expanded={!collapsed}
            aria-label={collapsed ? '展开设备基础信息侧栏' : '向左折叠设备基础信息'}
            onClick={() => onCollapsedChange(!collapsed)}
          >
            {collapsed ? '>' : '<'}
          </button>
        </div>
        {collapsed ? (
          <button
            type="button"
            className="device-info-rail"
            aria-label="展开设备基础信息"
            onClick={() => onCollapsedChange(false)}
          >
            <span>设备基础信息</span>
          </button>
        ) : (
          <div className="form-grid device-form-grid">
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
            <label>
              <span>IREGION 基地址</span>
              <input
                aria-label="IREGION 基地址"
                value={device.iregionBaseAddress}
                onChange={(event) => onIRegionBaseAddressChange(event.target.value)}
                placeholder="0x18000000"
              />
            </label>
            <label className="device-span-full">
              <span>设备描述</span>
              <input value={device.description} onChange={(event) => onDeviceChange('description', event.target.value)} />
            </label>
          </div>
        )}
      </aside>
    </div>
  )
}
