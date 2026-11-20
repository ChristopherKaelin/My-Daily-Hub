import { ArrowsClockwiseIcon } from '@phosphor-icons/react'

interface RefreshButtonProps {
  onClick: () => void
  isRefreshing?: boolean
  label?: string
}

export function RefreshButton({ onClick, isRefreshing = false, label = 'Refresh' }: RefreshButtonProps) {
  return (
    <button
      className="btn btn-secondary"
      onClick={onClick}
      disabled={isRefreshing}
      title={isRefreshing ? 'Refreshing…' : label}
      aria-label={label}
    >
      <ArrowsClockwiseIcon size={16} weight="bold" />
    </button>
  )
}
