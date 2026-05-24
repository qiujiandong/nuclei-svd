import type { EditorDevice, EditorIRegionConfig } from '../../lib/editorModel'
import { Checkbox } from '../../components/ui/checkbox'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'

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
    <div className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="IREGION 基地址">
          <Input
          aria-label="IREGION 基地址"
          value={device.iregionBaseAddress}
          onChange={(event) => onIRegionBaseAddressChange(event.target.value)}
          placeholder="0x18000000"
        />
        </FormField>
      {device.iregionConfig.timerExist ? (
          <FormField label="CPU Count">
            <Input
            value={device.iregionConfig.cpuCount}
            onChange={(event) => onIRegionConfigChange('cpuCount', event.target.value)}
            inputMode="numeric"
            min={1}
            max={8}
            placeholder='8'
          />
          </FormField>
      ) : null}
      {device.iregionConfig.eclicExist ? (
          <FormField label="ECLIC Interrupt Count">
            <Input
            value={device.iregionConfig.eclicInterruptCount}
            onChange={(event) => onIRegionConfigChange('eclicInterruptCount', event.target.value)}
            inputMode="numeric"
            min={1}
            max={1024}
            placeholder='64'
          />
          </FormField>
      ) : null}
      {device.iregionConfig.ciduExist ? (
          <FormField label="CIDU Interrupt Count">
            <Input
            value={device.iregionConfig.ciduInterruptCount}
            onChange={(event) => onIRegionConfigChange('ciduInterruptCount', event.target.value)}
            inputMode="numeric"
            min={1}
            max={4096}
            placeholder='128'
          />
          </FormField>

      ) : null}
      {device.iregionConfig.plicExist ? (
          <FormField label="PLIC Interrupt Count">
            <Input
            value={device.iregionConfig.plicInterruptCountX32}
            onChange={(event) => onIRegionConfigChange('plicInterruptCountX32', event.target.value)}
            inputMode="numeric"
            min={1}
            max={32}
            placeholder='8'
          />
          </FormField>
      ) : null}
      </div>
      <div className="grid gap-3 rounded-3xl border border-border bg-white p-5 md:grid-cols-2 xl:grid-cols-3">
        {existenceFields.map(({ field, label }) => (
          <label key={field} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Checkbox
              checked={Boolean(device.iregionConfig[field])}
              onCheckedChange={(checked) => onIRegionConfigChange(field, Boolean(checked))}
            />
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
