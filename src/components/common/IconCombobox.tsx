import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Command } from 'cmdk'
import { ICON_OPTIONS, ICON_REGISTRY } from '../../data/iconRegistry'
import styles from './IconCombobox.module.css'

interface IconComboboxProps {
  value: string
  onChange: (iconKey: string) => void
  /** Shown on the trigger button when nothing is selected yet. */
  placeholder?: string
}

/**
 * Searchable icon picker. Type-to-filter list of the curated icon set
 * (icon + label per row), ordered by category for grouping only — no
 * visible category headers (see icon_options.category in the schema).
 */
export function IconCombobox({ value, onChange, placeholder = 'Choose an icon...' }: IconComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = ICON_OPTIONS.find((opt) => opt.key === value) ?? null
  const SelectedIcon = selected ? ICON_REGISTRY[selected.key] : null

  function handleSelect(iconKey: string) {
    onChange(iconKey)
    setSearch('')
    setOpen(false)
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
    >
      <Popover.Trigger asChild>
        <button type="button" className={styles.trigger} aria-label="Choose an icon">
          {SelectedIcon ? (
            <>
              <SelectedIcon size={20} weight="regular" />
              <span>{selected!.label}</span>
            </>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
          <span className={styles.chevron} aria-hidden="true">▾</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className={styles.content} sideOffset={6} align="start">
          <Command className={styles.command} shouldFilter={false}>
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Search icons..."
              className={styles.searchInput}
            />
            <IconResults search={search} onSelect={handleSelect} />
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function filterIcons(search: string) {
  const query = search.trim().toLowerCase()
  if (!query) return ICON_OPTIONS
  return ICON_OPTIONS.filter(
    (opt) => opt.label.toLowerCase().includes(query) || opt.key.includes(query)
  )
}

/** Closest-match fallback when a search has no hits: simple substring score against each label's words. */
function closestMatches(search: string, limit = 5) {
  const query = search.trim().toLowerCase()
  if (!query) return []

  return [...ICON_OPTIONS]
    .map((opt) => {
      const label = opt.label.toLowerCase()
      let score = 0
      for (let i = 0; i < query.length; i++) {
        if (label.includes(query.slice(0, i + 1))) score = i + 1
      }
      return { opt, score }
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((m) => m.opt)
}

function IconResults({
  search,
  onSelect,
}: {
  search: string
  onSelect: (iconKey: string) => void
}) {
  const matches = filterIcons(search)

  if (matches.length === 0) {
    const suggestions = closestMatches(search)
    return (
      <div className={styles.noMatches}>
        <p>No matches for "{search}"</p>
        {suggestions.length > 0 && (
          <>
            <p className={styles.suggestionsLabel}>Did you mean:</p>
            <Command.Group>
              {suggestions.map((opt) => (
                <IconRow key={opt.key} option={opt} onSelect={onSelect} />
              ))}
            </Command.Group>
          </>
        )}
      </div>
    )
  }

  return (
    <Command.List className={styles.resultsList}>
      <Command.Group>
        {matches.map((opt) => (
          <IconRow key={opt.key} option={opt} onSelect={onSelect} />
        ))}
      </Command.Group>
    </Command.List>
  )
}

function IconRow({
  option,
  onSelect,
}: {
  option: { key: string; label: string }
  onSelect: (iconKey: string) => void
}) {
  const Icon = ICON_REGISTRY[option.key]
  return (
    <Command.Item
      key={option.key}
      value={option.key}
      onSelect={() => onSelect(option.key)}
      className={styles.row}
    >
      <Icon size={20} weight="regular" />
      <span>{option.label}</span>
    </Command.Item>
  )
}
