/**
 * Format an ISO date string (YYYY-MM-DD) as MM/DD/YYYY
 * Treats the date as a local date without timezone conversion
 */
export function formatUserDate(dateString: string): string {
  const [year, month, day] = dateString.split('-')
  return `${month}/${day}/${year}`
}
