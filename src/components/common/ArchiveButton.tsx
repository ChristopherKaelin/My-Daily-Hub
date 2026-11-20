import { TrayArrowDownIcon, TrayArrowUpIcon } from '@phosphor-icons/react'

interface ArchiveButtonProps {
  isArchived: boolean
  onClick: () => void
  label?: string
}

export function ArchiveButton({ isArchived, onClick, label }: ArchiveButtonProps) {
  const defaultLabel = isArchived ? 'Unarchive' : 'Archive'
  const title = label ?? defaultLabel
  return (
    <button
      className={isArchived ? 'btn btn-secondary' : 'btn btn-danger'}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {isArchived ? <TrayArrowUpIcon size={16} weight="bold" /> : <TrayArrowDownIcon size={16} weight="bold" />}
    </button>
  )
}
