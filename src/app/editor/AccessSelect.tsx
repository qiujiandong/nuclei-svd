import { ACCESS_VALUES } from '../../types/svd'
import type { EditorAccess } from '../../lib/editorModel'
import { FormField } from '../../components/ui/form-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

type AccessSelectProps = {
  value: EditorAccess
  onChange: (nextValue: EditorAccess) => void
  label: string
  className?: string
}

const inheritValue = '__inherit__'

export function AccessSelect({ value, onChange, label, className }: AccessSelectProps) {
  return (
    <FormField label={label} className={className}>
      <Select value={value || inheritValue} onValueChange={(nextValue) => onChange(nextValue === inheritValue ? '' : (nextValue as EditorAccess))}>
        <SelectTrigger aria-label={label}>
          <SelectValue placeholder="继承默认" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={inheritValue}>继承默认</SelectItem>
          {ACCESS_VALUES.map((access) => (
            <SelectItem key={access} value={access}>
              {access}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}
