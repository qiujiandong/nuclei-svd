import type { EditorDevice } from '../../lib/editorModel'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'

export type DeviceInfoPageProps = {
  device: EditorDevice
  onDeviceChange: (field: keyof EditorDevice, value: string) => void
  onIRegionBaseAddressChange: (value: string) => void
}

export function DeviceInfoPage({
  device,
  onDeviceChange,
  onIRegionBaseAddressChange,
}: DeviceInfoPageProps) {
  return (
    <div className="device-info-panel grid gap-5 md:grid-cols-2">
      <FormField label="设备名称">
        <Input value={device.name} onChange={(event) => onDeviceChange('name', event.target.value)} />
      </FormField>
      <FormField label="版本">
        <Input value={device.version} onChange={(event) => onDeviceChange('version', event.target.value)} />
      </FormField>
      <FormField label="访存单元位宽">
        <Input
          value={device.addressUnitBits}
          onChange={(event) => onDeviceChange('addressUnitBits', event.target.value)}
          inputMode="numeric"
        />
      </FormField>
      <FormField label="地址位宽">
        <Input
          value={device.width}
          onChange={(event) => onDeviceChange('width', event.target.value)}
          inputMode="numeric"
        />
      </FormField>
      <FormField label="默认寄存器位宽">
        <Input
          value={device.size}
          onChange={(event) => onDeviceChange('size', event.target.value)}
          inputMode="numeric"
        />
      </FormField>
      <FormField label="IREGION 基地址">
        <Input
          aria-label="IREGION 基地址"
          value={device.iregionBaseAddress}
          onChange={(event) => onIRegionBaseAddressChange(event.target.value)}
          placeholder="0x18000000"
        />
      </FormField>
      <FormField label="设备描述" className="md:col-span-2">
        <Input value={device.description} onChange={(event) => onDeviceChange('description', event.target.value)} />
      </FormField>
    </div>
  )
}
