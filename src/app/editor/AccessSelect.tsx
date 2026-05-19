import { ACCESS_VALUES } from '../../types/svd'
import type { EditorAccess } from '../../lib/editorModel'

type AccessSelectProps = {
  value: EditorAccess
  onChange: (nextValue: EditorAccess) => void
  label: string
  className?: string
}

export function AccessSelect({ value, onChange, label, className }: AccessSelectProps) {
  return (
    <label className={className}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as EditorAccess)}>
        <option value="">继承默认</option>
        {ACCESS_VALUES.map((access) => (
          <option key={access} value={access}>
            {access}
          </option>
        ))}
      </select>
    </label>
  )
}
