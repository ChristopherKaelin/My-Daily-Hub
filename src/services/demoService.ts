import { supabase } from '../lib/supabaseClient'
import { DEMO_STORAGE_KEYS } from '../types'

export async function isDemoMode(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  return session === null
}

export function clearDemoData(): void {
  Object.values(DEMO_STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}

export function initializeDemoData(): void {
  // Only initialize if no demo data exists yet
  if (localStorage.getItem(DEMO_STORAGE_KEYS.USER_SETTINGS)) return

  // Sample user settings
  localStorage.setItem(DEMO_STORAGE_KEYS.USER_SETTINGS, JSON.stringify({
    id: crypto.randomUUID(),
    userId: 'demo',
    displayName: 'Demo User',
    city: 'Lexington, KY',
    weatherUnit: 'fahrenheit',
    theme: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
}

export function resetDemoData(): void {
  clearDemoData()
  initializeDemoData()
}