import { supabase } from '../lib/supabaseClient'
import { isAuthenticated, getCurrentUserId } from './authService'
import { type Habit, DEMO_STORAGE_KEYS } from '../types'

// --- Demo Mode ---

function loadDemoHabits(): Habit[] {
  const raw = localStorage.getItem(DEMO_STORAGE_KEYS.HABITS)
  return raw ? JSON.parse(raw) : []
}

function saveDemoHabits(habits: Habit[]): void {
  localStorage.setItem(DEMO_STORAGE_KEYS.HABITS, JSON.stringify(habits))
}

// --- Supabase ---

async function loadAuthHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    trackingMode: row.tracking_mode,
    unit: row.unit,
    incrementAmount: row.increment_amount,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
  }))
}

async function createAuthHabit(userId: string, habit: Omit<Habit, 'id' | 'userId' | 'archivedAt' | 'createdAt'>): Promise<Habit | null> {
  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: userId,
      name: habit.name,
      tracking_mode: habit.trackingMode,
      unit: habit.unit,
      increment_amount: habit.incrementAmount,
    })
    .select()
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    trackingMode: data.tracking_mode,
    unit: data.unit,
    incrementAmount: data.increment_amount,
    archivedAt: data.archived_at,
    createdAt: data.created_at,
  }
}

async function updateAuthHabit(habitId: string, updates: Partial<Habit>): Promise<Habit | null> {
  const { data, error } = await supabase
    .from('habits')
    .update({
      name: updates.name,
      tracking_mode: updates.trackingMode,
      unit: updates.unit,
      increment_amount: updates.incrementAmount,
    })
    .eq('id', habitId)
    .select()
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    trackingMode: data.tracking_mode,
    unit: data.unit,
    incrementAmount: data.increment_amount,
    archivedAt: data.archived_at,
    createdAt: data.created_at,
  }
}

async function archiveAuthHabit(habitId: string): Promise<Habit | null> {
  const { data, error } = await supabase
    .from('habits')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', habitId)
    .select()
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    trackingMode: data.tracking_mode,
    unit: data.unit,
    incrementAmount: data.increment_amount,
    archivedAt: data.archived_at,
    createdAt: data.created_at,
  }
}

async function deleteAuthHabit(habitId: string): Promise<boolean> {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)

  return !error
}

// --- Public API ---

export async function getHabits(): Promise<Habit[]> {
  if (await isAuthenticated()) {
    const userId = await getCurrentUserId()
    if (!userId) return []
    return await loadAuthHabits(userId)
  } else {
    return loadDemoHabits()
  }
}

export async function createHabit(habit: Omit<Habit, 'id' | 'userId' | 'archivedAt' | 'createdAt'>): Promise<Habit | null> {
  if (await isAuthenticated()) {
    const userId = await getCurrentUserId()
    if (!userId) return null
    return await createAuthHabit(userId, habit)
  } else {
    const existing = loadDemoHabits()
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      userId: 'demo',
      name: habit.name,
      trackingMode: habit.trackingMode,
      unit: habit.unit,
      incrementAmount: habit.incrementAmount,
      archivedAt: null,
      createdAt: new Date().toISOString(),
    }
    saveDemoHabits([...existing, newHabit])
    return newHabit
  }
}

export async function updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit | null> {
  if (await isAuthenticated()) {
    return await updateAuthHabit(habitId, updates)
  } else {
    const existing = loadDemoHabits()
    const index = existing.findIndex((h) => h.id === habitId)
    if (index === -1) return null

    const updated: Habit = {
      ...existing[index],
      ...updates,
    }
    existing[index] = updated
    saveDemoHabits(existing)
    return updated
  }
}

export async function archiveHabit(habitId: string): Promise<Habit | null> {
  if (await isAuthenticated()) {
    return await archiveAuthHabit(habitId)
  } else {
    return await updateHabit(habitId, { archivedAt: new Date().toISOString() })
  }
}

export async function unarchiveHabit(habitId: string): Promise<Habit | null> {
  if (await isAuthenticated()) {
    const { data, error } = await supabase
      .from('habits')
      .update({ archived_at: null })
      .eq('id', habitId)
      .select()
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      trackingMode: data.tracking_mode,
      unit: data.unit,
      incrementAmount: data.increment_amount,
      archivedAt: data.archived_at,
      createdAt: data.created_at,
    }
  } else {
    return await updateHabit(habitId, { archivedAt: null })
  }
}

/**
 * Permanently removes a habit. Only safe to call for a habit with no goal
 * history — a habit with goals can't be deleted (goals.habit_id has no
 * ON DELETE CASCADE), so the UI should offer archive instead in that case.
 */
export async function deleteHabit(habitId: string): Promise<boolean> {
  if (await isAuthenticated()) {
    return await deleteAuthHabit(habitId)
  } else {
    const existing = loadDemoHabits()
    saveDemoHabits(existing.filter((h) => h.id !== habitId))
    return true
  }
}

// --- Filtering ---

/**
 * Habits available to attach a new goal to — excludes archived habits.
 */
export function getActiveHabits(habits: Habit[]): Habit[] {
  return habits.filter((h) => !h.archivedAt)
}
