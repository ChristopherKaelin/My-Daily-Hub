import { type Habit } from '../types'

/**
 * "0.5 miles" / "15 minutes" — the raw increment/unit pairing for a
 * cumulative habit. Returns null for boolean/frequency habits, which don't
 * have one.
 */
export function formatIncrementDetail(habit: Habit): string | null {
  if (habit.trackingMode !== 'cumulative') return null
  return `${habit.incrementAmount} ${habit.unit}`
}

/**
 * A short qualifier for use in compact spots like a <select> option —
 * "(boolean)", "(frequency)", or "(0.5 miles/increment)" for cumulative.
 */
export function formatHabitOptionLabel(habit: Habit): string {
  if (habit.trackingMode === 'cumulative') {
    return `${habit.name} (${habit.incrementAmount} ${habit.unit}/increment)`
  }
  return `${habit.name} (${habit.trackingMode})`
}

/**
 * A one-line, human-readable summary of how a habit is tracked — used
 * anywhere someone needs to know what a habit's numbers mean before acting
 * on them (e.g. choosing a goal's target count).
 */
export function formatHabitSummary(habit: Habit): string {
  switch (habit.trackingMode) {
    case 'boolean':
      return "Boolean — did or didn't do it each day"
    case 'frequency':
      return 'Frequency — counts occurrences'
    case 'cumulative':
      return `Cumulative — tracked in ${formatIncrementDetail(habit)} increments`
  }
}
