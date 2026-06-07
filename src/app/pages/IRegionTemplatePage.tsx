import { useMemo, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import type { EditorDevice, EditorIRegionConfig } from '../../lib/editorModel'
import { Checkbox } from '../../components/ui/checkbox'
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
  helperText?: string
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
  },
  {
    field: 'eclicExist',
    label: 'ECLIC',
    paramField: 'eclicInterruptCount',
    paramLabel: 'ECLIC Interrupt Count',
    paramShortLabel: 'IRQ',
    helperText: '范围 1~1024',
    inputMode: 'numeric',
    min: 1,
    max: 1024,
    placeholder: '64',
  },
  {
    field: 'smpExist', label: 'SMP',
    paramField: 'cpuCount',
    paramLabel: 'CPU Count',
    paramShortLabel: 'CPU',
    helperText: '范围 1~8',
    inputMode: 'numeric',
    min: 1,
    max: 8,
    placeholder: '8',
  },
  {
    field: 'ciduExist',
    label: 'CIDU',
    paramField: 'ciduInterruptCount',
    paramLabel: 'CIDU Interrupt Count',
    paramShortLabel: 'IRQ',
    helperText: '范围 1~4096',
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
    helperText: '范围 1~32，实际 IRQ = 输入值 × 32',
    inputMode: 'numeric',
    min: 1,
    max: 32,
    placeholder: '8',
  },
]

function clampNumericValue(rawValue: string, min: number, max: number) {
  const numericValue = Number(rawValue)
  if (!Number.isFinite(numericValue)) {
    return String(min)
  }

  return String(Math.min(max, Math.max(min, Math.trunc(numericValue))))
}

export function IRegionTemplatePage({
  device,
  onIRegionConfigChange,
}: IRegionTemplatePageProps) {
  const baseDraftValues = useMemo(
    () =>
      Object.fromEntries(
        moduleFields
          .filter((item) => item.paramField)
          .map((item) => [item.paramField as string, String(device.iregionConfig[item.paramField as keyof EditorIRegionConfig])]),
      ),
    [device.iregionConfig],
  )
  const [draftOverrides, setDraftOverrides] = useState<Record<string, string>>({})
  const draftValues = {
    ...baseDraftValues,
    ...draftOverrides,
  }

  const setDraftValue = (field: keyof EditorIRegionConfig, value: string) => {
    setDraftOverrides((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const clearDraftValue = (field: keyof EditorIRegionConfig) => {
    setDraftOverrides((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleParamChange = (field: keyof EditorIRegionConfig, rawValue: string) => {
    if (rawValue !== '' && !/^\d+$/.test(rawValue)) {
      return
    }

    setDraftValue(field, rawValue)
  }

  const handleParamBlur = (
    field: keyof EditorIRegionConfig,
    rawValue: string,
    min?: number,
    max?: number,
  ) => {
    if (min == null || max == null) {
      return
    }

    const normalizedValue = rawValue === '' ? String(min) : clampNumericValue(rawValue, min, max)
    onIRegionConfigChange(field, normalizedValue)
    if (normalizedValue === baseDraftValues[field as string]) {
      clearDraftValue(field)
      return
    }
    setDraftValue(field, normalizedValue)
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 rounded-3xl border border-border bg-white p-4">
        {moduleFields.map(({ field, label, paramField, paramLabel, paramShortLabel, helperText, inputMode, min, max, placeholder }) => {
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
                <div className="grid min-w-0 gap-1 sm:w-[300px] sm:justify-end">
                  <div className="flex min-w-0 items-center gap-2 sm:justify-end">
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
                      value={draftValues[paramField] ?? String(device.iregionConfig[paramField])}
                      onChange={(event) => handleParamChange(paramField, event.target.value)}
                      onBlur={(event) => handleParamBlur(paramField, event.target.value, min, max)}
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
                  <p className={cn('m-0 text-[11px] leading-4 sm:text-right', checked ? 'text-slate-500' : 'text-slate-400')}>
                    {helperText}
                  </p>
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
