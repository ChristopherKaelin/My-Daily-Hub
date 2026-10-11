/**
 * Format an ISO date string (YYYY-MM-DD) as MM/DD/YYYY
 * Treats the date as a local date without timezone conversion
 */
export function formatUserDate(dateString: string): string {
  const [year, month, day] = dateString.split('-')
  return `${month}/${day}/${year}`
}

/**
 * Today's date as a local YYYY-MM-DD string (no timezone conversion)
 */
export function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Add a number of calendar days to a YYYY-MM-DD string, returning a new
 * YYYY-MM-DD string. Used only for calendar-day math (e.g. "2 days from
 * today") — never for comparing actual times.
 */
export function addDaysToDateString(dateString: string, days: number): string {
  const [y, m, d] = dateString.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
