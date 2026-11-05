import { supabase } from '../lib/supabaseClient'
import { isAuthenticated } from './authService'
import { type ProgressEntry, DEMO_STORAGE_KEYS } from '../types'

// --- Demo Mode ---

function loadDemoProgress(): ProgressEntry[] {
  const raw = localStorage.getItem(DEMO_STORAGE_KEYS.PROGRESS_ENTRIES)
  return raw ? JSON.parse(raw) : []
}

function saveDemoProgress(entries: ProgressEntry[]): void {
  localStorage.setItem(DEMO_STORAGE_KEYS.PROGRESS_ENTRIES, JSON.stringify(entries))
}

function findDemoEntry(entries: ProgressEntry[], goalId: string, entryDate: string): ProgressEntry | undefined {
  return entries.find((e) => e.goalId === goalId && e.entryDate === entryDate)
}

// --- Supabase ---

async function getAuthEntry(goalId: string, entryDate: string): Promise<ProgressEntry | null> {
  const { data, error } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('goal_id', goalId)
    .eq('entry_date', entryDate)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    goalId: data.goal_id,
    entryDate: data.entry_date,
    count: data.count,
    createdAt: data.created_at,
  }
}

async function loadAuthProgressForGoal(goalId: string): Promise<ProgressEntry[]> {
  const { data, error } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('goal_id', goalId)
    .order('entry_date', { ascending: true })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    goalId: row.goal_id,
    entryDate: row.entry_date,
    count: row.count,
    createdAt: row.created_at,
  }))
}

async function incrementAuthProgress(goalId: string, entryDate: string): Promise<ProgressEntry | null> {
  const existing = await getAuthEntry(goalId, entryDate)

  if (!existing) {
    const { data, error } = await supabase
      .from('progress_entries')
      .insert({ goal_id: goalId, entry_date: entryDate, count: 1 })
      .select()
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      goalId: data.goal_id,
      entryDate: data.entry_date,
      count: data.count,
      createdAt: data.created_at,
    }
  }

  const { data, error } = await supabase
    .from('progress_entries')
    .update({ count: existing.count + 1 })
    .eq('id', existing.id)
    .select()
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    goalId: data.goal_id,
    entryDate: data.entry_date,
    count: data.count,
    createdAt: data.created_at,
  }
}

async function decrementAuthProgress(goalId: string, entryDate: string): Promise<ProgressEntry | null> {
  const existing = await getAuthEntry(goalId, entryDate)
  if (!existing) return null

  // Zero-count rows are deleted, not kept — "no row" already means "nothing done"
  if (existing.count <= 1) {
    await supabase
      .from('progress_entries')
      .delete()
      .eq('id', existing.id)

    return null
  }

  const { data, error } = await supabase
    .from('progress_entries')
    .update({ count: existing.count - 1 })
    .eq('id', existing.id)
    .select()
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    goalId: data.goal_id,
    entryDate: data.entry_date,
    count: data.count,
    createdAt: data.created_at,
  }
}

// --- Public API ---

export async function getProgressForGoal(goalId: string): Promise<ProgressEntry[]> {
  if (await isAuthenticated()) {
    return await loadAuthProgressForGoal(goalId)
  } else {
    return loadDemoProgress().filter((e) => e.goalId === goalId)
  }
}

/**
 * Whether a goal has any logged progress at all — used to gate editing and
 * deleting a goal (both are only safe before anything's been logged against
 * it). A count-only query, not a full fetch.
 */
export async function hasProgressEntries(goalId: string): Promise<boolean> {
  if (await isAuthenticated()) {
    const { count, error } = await supabase
      .from('progress_entries')
      .select('id', { count: 'exact', head: true })
      .eq('goal_id', goalId)

    return !error && (count ?? 0) > 0
  } else {
    return loadDemoProgress().some((e) => e.goalId === goalId)
  }
}

export async function getProgressForDate(goalId: string, entryDate: string): Promise<ProgressEntry | null> {
  if (await isAuthenticated()) {
    return await getAuthEntry(goalId, entryDate)
  } else {
    return findDemoEntry(loadDemoProgress(), goalId, entryDate) ?? null
  }
}

/**
 * Increments the count for a goal on a given date (defaults to today),
 * creating the entry if it doesn't exist yet. For boolean/frequency goals
 * this is "mark as done" — count goes straight to 1.
 */
export async function incrementProgress(goalId: string, entryDate?: string): Promise<ProgressEntry | null> {
  const date = entryDate ?? new Date().toISOString().slice(0, 10)

  if (await isAuthenticated()) {
    return await incrementAuthProgress(goalId, date)
  }

  const entries = loadDemoProgress()
  const existing = findDemoEntry(entries, goalId, date)

  if (!existing) {
    const newEntry: ProgressEntry = {
      id: crypto.randomUUID(),
      goalId,
      entryDate: date,
      count: 1,
      createdAt: new Date().toISOString(),
    }
    saveDemoProgress([...entries, newEntry])
    return newEntry
  }

  const updated: ProgressEntry = { ...existing, count: existing.count + 1 }
  saveDemoProgress(entries.map((e) => (e.id === existing.id ? updated : e)))
  return updated
}

/**
 * Decrements the count for a goal on a given date (defaults to today).
 * Dropping to zero deletes the row rather than storing a zero — consistent
 * with boolean/frequency goals, where "no row" already means "nothing done".
 * Returns null whether the entry was deleted or never existed.
 */
export async function decrementProgress(goalId: string, entryDate?: string): Promise<ProgressEntry | null> {
  const date = entryDate ?? new Date().toISOString().slice(0, 10)

  if (await isAuthenticated()) {
    return await decrementAuthProgress(goalId, date)
  }

  const entries = loadDemoProgress()
  const existing = findDemoEntry(entries, goalId, date)
  if (!existing) return null

  if (existing.count <= 1) {
    saveDemoProgress(entries.filter((e) => e.id !== existing.id))
    return null
  }

  const updated: ProgressEntry = { ...existing, count: existing.count - 1 }
  saveDemoProgress(entries.map((e) => (e.id === existing.id ? updated : e)))
  return updated
}

// --- Totals ---

/**
 * Sums progress-entry counts across a set of entries. Pass incrementAmount
 * (from the habit) to convert raw counts into a real-world cumulative total,
 * e.g. count=4 at incrementAmount=0.5 miles -> 2 miles.
 */
export function sumProgress(entries: ProgressEntry[], incrementAmount = 1): number {
  const totalCount = entries.reduce((sum, e) => sum + e.count, 0)
  return totalCount * incrementAmount
}
