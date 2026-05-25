import type { InputHTMLAttributes } from 'react'
import type { EditorDevice, EditorIRegionConfig } from '../../lib/editorModel'
import { Checkbox } from '../../components/ui/checkbox'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'

export type IRegionTemplatePageProps = {
  device: EditorDevice
  onIRegionConfigChange: (field: keyof EditorIRegionConfig, value: string | boolean) => void
  onIRegionBaseAddressChange: (value: string) => void
}

type IRegionModuleConfig = {
  field: keyof EditorIRegionConfig
  label: string
  paramField?: keyof EditorIRegionConfig
  paramLabel?: string
  paramShortLabel?: string
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
  min?: number
  max?: number
  placeholder?: string
}

const moduleFields: IRegionModuleConfig[] = [
  { field: 'iinfoExist', label: 'IINFO' },
  { field: 'debugExist', label: 'Debug' },
  {
    field: 'timerExist',
    label: 'Timer',
    paramField: 'cpuCount',
    paramLabel: 'CPU Count',
    paramShortLabel: 'CPU',
    inputMode: 'numeric',
    min: 1,
    max: 8,
    placeholder: '8',
  },
  {
    field: 'eclicExist',
    label: 'ECLIC',
    paramField: 'eclicInterruptCount',
    paramLabel: 'ECLIC Interrupt Count',
    paramShortLabel: 'IRQ',
    inputMode: 'numeric',
    min: 1,
    max: 1024,
    placeholder: '64',
  },
  { field: 'smpExist', label: 'SMP' },
  {
    field: 'ciduExist',
    label: 'CIDU',
    paramField: 'ciduInterruptCount',
    paramLabel: 'CIDU Interrupt Count',
    paramShortLabel: 'IRQ',
    inputMode: 'numeric',
    min: 1,
    max: 4096,
    placeholder: '128',
  },
  {
    field: 'plicExist',
    label: 'PLIC',
    paramField: 'plicInterruptCountX32',
    paramLabel: 'PLIC Interrupt Count',
    paramShortLabel: 'IRQ',
    inputMode: 'numeric',
    min: 1,
    max: 32,
    placeholder: '8',
  },
]

export function IRegionTemplatePage({
  device,
  onIRegionConfigChange,
  onIRegionBaseAddressChange,
}: IRegionTemplatePageProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <FormField label="IREGION 基地址" className="rounded-2xl border border-border bg-white p-4 shadow-sm md:col-span-2 xl:col-span-1">
          <Input
            aria-label="IREGION 基地址"
            value={device.iregionBaseAddress}
            onChange={(event) => onIRegionBaseAddressChange(event.target.value)}
            placeholder="0x18000000"
          />
        </FormField>
      </div>
      <div className="grid gap-2 rounded-3xl border border-border bg-white p-4">
        {moduleFields.map(({ field, label, paramField, paramLabel, paramShortLabel, inputMode, min, max, placeholder }) => {
          const checked = Boolean(device.iregionConfig[field])

          return (
            <section
              key={field}
              className={cn(
                'flex flex-col gap-3 rounded-2xl border px-3 py-2.5 transition-colors sm:flex-row sm:items-center sm:justify-between',
                checked ? 'border-primary/30 bg-primary/5' : 'border-slate-200 bg-slate-50',
              )}
            >
              <label className="flex min-w-0 items-center gap-3">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(nextChecked) => onIRegionConfigChange(field, Boolean(nextChecked))}
                  className="shrink-0"
                />
                <span className="truncate text-sm font-semibold text-slate-800">{label}</span>
              </label>
              {paramField ? (
                <div className="flex min-w-0 items-center gap-2 sm:w-[240px] sm:justify-end">
                  <span
                    className={cn(
                      'shrink-0 text-xs font-medium uppercase tracking-wide',
                      checked ? 'text-slate-500' : 'text-slate-400',
                    )}
                  >
                    {paramShortLabel ?? paramLabel}
                  </span>
                  <Input
                    aria-label={paramLabel}
                    value={String(device.iregionConfig[paramField])}
                    onChange={(event) => onIRegionConfigChange(paramField, event.target.value)}
                    inputMode={inputMode}
                    min={min}
                    max={max}
                    placeholder={placeholder}
                    disabled={!checked}
                    aria-disabled={!checked}
                    className={cn(
                      'h-9 sm:w-[180px]',
                      !checked && 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 placeholder:text-slate-400',
                    )}
                  />
                </div>
              ) : (
                <div className="flex h-9 items-center text-xs text-slate-400 sm:w-[240px] sm:justify-end">
                  无参数
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
