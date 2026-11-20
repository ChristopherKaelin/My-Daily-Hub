import { ClipboardTextIcon, CheckIcon } from '@phosphor-icons/react'

interface CopyButtonProps {
  onClick: () => void
  copied?: boolean
  label?: string
  disabled?: boolean
}

export function CopyButton({ onClick, copied = false, label = 'Copy', disabled = false }: CopyButtonProps) {
  return (
    <button
      className="btn btn-secondary"
      onClick={onClick}
      disabled={disabled}
      title={copied ? 'Copied!' : label}
      aria-label={label}
    >
      {copied
        ? <CheckIcon size={16} weight="bold" />
        : <ClipboardTextIcon size={16} weight="bold" />
      }
    </button>
  )
}
