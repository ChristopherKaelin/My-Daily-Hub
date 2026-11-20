import { PencilLineIcon } from '@phosphor-icons/react'

interface EditButtonProps {
  onClick: () => void
  label?: string
  disabled?: boolean
}

export function EditButton({ onClick, label = 'Edit', disabled = false }: EditButtonProps) {
  return (
    <button
      className="btn btn-cancel"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      <PencilLineIcon size={16} weight="bold" />
    </button>
  )
}
