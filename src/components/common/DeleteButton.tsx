import { TrashIcon } from '@phosphor-icons/react'

interface DeleteButtonProps {
  onClick: () => void
  label?: string
  disabled?: boolean
  title?: string
}

export function DeleteButton({ onClick, label = 'Delete', disabled = false, title }: DeleteButtonProps) {
  return (
    <button
      className="btn btn-danger"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      aria-label={label}
    >
      <TrashIcon size={16} weight="bold" />
    </button>
  )
}
