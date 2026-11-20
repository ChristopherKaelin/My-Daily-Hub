import { FlagIcon } from '@phosphor-icons/react'

interface EndButtonProps {
  onClick: () => void
  label?: string
  disabled?: boolean
}

export function EndButton({ onClick, label = 'End', disabled = false }: EndButtonProps) {
  return (
    <button
      className="btn btn-teal"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      <FlagIcon size={16} weight="bold" />
    </button>
  )
}
