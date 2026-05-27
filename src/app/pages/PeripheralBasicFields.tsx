import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'

type PeripheralBasicFieldsProps = {
  name: string
  description: string
  defaultRegisterSize: string
  defaultRegisterSizePlaceholder: string
  showDefaultRegisterSize?: boolean
  showDescription?: boolean
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onDefaultRegisterSizeChange: (value: string) => void
}

export function PeripheralBasicFields({
  name,
  description,
  defaultRegisterSize,
  defaultRegisterSizePlaceholder,
  showDefaultRegisterSize = true,
  showDescription = true,
  onNameChange,
  onDescriptionChange,
  onDefaultRegisterSizeChange,
}: PeripheralBasicFieldsProps) {
  const defaultRegisterSizeDisabled = !showDefaultRegisterSize
  const descriptionDisabled = !showDescription

  return (
    <div className="grid gap-4 xl:grid-cols-[max(150px)_max(100px)_1fr]">
      <FormField label="外设名称">
        <Input value={name} onChange={(event) => onNameChange(event.target.value)} />
      </FormField>
      <FormField
        label="寄存器位宽"
        className={cn(defaultRegisterSizeDisabled && 'text-slate-400 [&>span]:text-slate-400')}
      >
        <Input
          value={defaultRegisterSize}
          onChange={(event) => onDefaultRegisterSizeChange(event.target.value)}
          placeholder={defaultRegisterSizePlaceholder}
          disabled={defaultRegisterSizeDisabled}
          className={cn(
            defaultRegisterSizeDisabled &&
              'border-slate-200 bg-slate-50 text-slate-400 placeholder:text-slate-400',
          )}
        />
      </FormField>
      <FormField
        label="外设描述"
        className={cn(descriptionDisabled && 'text-slate-400 [&>span]:text-slate-400')}
      >
        <Input
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={descriptionDisabled}
          className={cn(
            descriptionDisabled && 'border-slate-200 bg-slate-50 text-slate-400 placeholder:text-slate-400',
          )}
        />
      </FormField>
    </div>
  )
}
