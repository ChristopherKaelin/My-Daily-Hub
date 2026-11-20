import { PlusCircleIcon } from '@phosphor-icons/react'

interface AddButtonProps {
  onClick: () => void
  label: string
  disabled?: boolean
}

export function AddButton({ onClick, label, disabled = false }: AddButtonProps) {
  return (
    <button className="btn btn-teal" onClick={onClick} disabled={disabled} title={label} aria-label={label}>
      <PlusCircleIcon size={16} weight="bold" />
      {label}
    </button>
  )
}
