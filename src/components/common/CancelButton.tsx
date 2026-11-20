import { XCircleIcon } from '@phosphor-icons/react'

interface CancelButtonProps {
  onClick: () => void
  label?: string
}

export function CancelButton({ onClick, label = 'Cancel' }: CancelButtonProps) {
  return (
    <button className="btn btn-secondary" onClick={onClick} title={label} aria-label={label}>
      <XCircleIcon size={16} weight="bold" />
    </button>
  )
}
