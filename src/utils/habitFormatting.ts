import { type Habit, type Goal, type ProgressEntry } from '../types'

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

// --- Progress calculation ---

export function getFirstDayOfPeriod(date: string, period: 'day' | 'week' | 'month'): string {
  if (period === 'day') return date
  if (period === 'month') return date.slice(0, 7) + '-01'
  // week: Monday of this week
  const d = new Date(date + 'T00:00:00')
  const daysFromMonday = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - daysFromMonday)
  return monday.toISOString().slice(0, 10)
}

export function getLastDayOfPeriod(date: string, period: 'day' | 'week' | 'month'): string {
  if (period === 'day') return date
  if (period === 'month') {
    const d = new Date(date + 'T00:00:00')
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)
  }
  // week: Sunday
  const d = new Date(date + 'T00:00:00')
  const daysFromMonday = (d.getDay() + 6) % 7
  const sunday = new Date(d)
  sunday.setDate(d.getDate() + (6 - daysFromMonday))
  return sunday.toISOString().slice(0, 10)
}

/**
 * Progress toward a goal's target as a 0–100 percentage.
 * Day period: binary (100 if any entry today, 0 if not).
 * Week/month: sum(counts) / targetValue, capped at 100.
 * Pass entries already filtered to the goal's active period.
 */
export function computeProgressPercent(
  periodEntries: ProgressEntry[],
  goal: Goal,
  forDate: string,
  incrementAmount?: number,
): number {
  if (goal.period === 'day') {
    return periodEntries.some((e) => e.entryDate === forDate && e.count > 0) ? 100 : 0
  }
  const totalCount = periodEntries.reduce((sum, e) => sum + e.count, 0)
  if (goal.targetValue <= 0) return 0
  const naturalUnitsLogged = incrementAmount ? totalCount * incrementAmount : totalCount
  return Math.min(100, Math.round((naturalUnitsLogged / goal.targetValue) * 100))
}
