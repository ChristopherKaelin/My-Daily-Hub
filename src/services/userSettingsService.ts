import { supabase } from '../lib/supabaseClient'
import { isAuthenticated, getCurrentUserId } from './authService'
import { type UserSettings, DEMO_STORAGE_KEYS } from '../types'

const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  displayName: null,
  city: null,
  weatherUnit: 'fahrenheit',
  theme: 'default',
}

// --- Demo Mode ---

function loadDemoSettings(): UserSettings | null {
  const raw = localStorage.getItem(DEMO_STORAGE_KEYS.USER_SETTINGS)
  return raw ? JSON.parse(raw) : null
}

function saveDemoSettings(settings: UserSettings): void {
  localStorage.setItem(DEMO_STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings))
}

// --- Supabase ---

async function loadAuthSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.user_id,
    displayName: data.display_name,
    city: data.city,
    weatherUnit: data.weather_unit,
    theme: data.theme,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

async function saveAuthSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  await supabase.from('user_settings').upsert({
    user_id: userId,
    display_name: settings.displayName,
    city: settings.city,
    weather_unit: settings.weatherUnit,
    theme: settings.theme,
  }, { onConflict: 'user_id' })
}


// --- Public API ---

export async function getUserSettings(): Promise<UserSettings | null> {
  if (await isAuthenticated()) {
    const userId = await getCurrentUserId()
    if (!userId) return null
    return await loadAuthSettings(userId)
  } else {
    return loadDemoSettings()
  }
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<void> {
  if (await isAuthenticated()) {
    const userId = await getCurrentUserId()
    if (!userId) return
    await saveAuthSettings(userId, settings)
  } else {
    const existing = loadDemoSettings()
    const updated: UserSettings = {
      id: existing?.id ?? crypto.randomUUID(),
      userId: 'demo',
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...DEFAULT_SETTINGS,
      ...existing,
      ...settings,
    }
    saveDemoSettings(updated)
  }
}