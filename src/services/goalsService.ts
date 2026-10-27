import { supabase } from '../lib/supabaseClient'
import { isAuthenticated } from './authService'
import { type Goal, DEMO_STORAGE_KEYS } from '../types'

// --- Demo Mode ---

function loadDemoGoals(): Goal[] {
  const raw = localStorage.getItem(DEMO_STORAGE_KEYS.GOALS)
  return raw ? JSON.parse(raw) : []
}

function saveDemoGoals(goals: Goal[]): void {
  localStorage.setItem(DEMO_STORAGE_KEYS.GOALS, JSON.stringify(goals))
}

// --- Supabase ---

async function loadAuthGoalsForHabit(habitId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('habit_id', habitId)
    .order('start_date', { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    habitId: row.habit_id,
    period: row.period,
    targetCount: row.target_count,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
  }))
}

async function createAuthGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal | null> {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      habit_id: goal.habitId,
      period: goal.period,
      target_count: goal.targetCount,
      start_date: goal.startDate,
      end_date: goal.endDate,
    })
    .select()
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    habitId: data.habit_id,
    period: data.period,
    targetCount: data.target_count,
    startDate: data.start_date,
    endDate: data.end_date,
    createdAt: data.created_at,
  }
}

async function updateAuthGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
  const { data, error } = await supabase
    .from('goals')
    .update({
      target_count: updates.targetCount,
      start_date: updates.startDate,
      end_date: updates.endDate,
    })
    .eq('id', goalId)
    .select()
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    habitId: data.habit_id,
    period: data.period,
    targetCount: data.target_count,
    startDate: data.start_date,
    endDate: data.end_date,
    createdAt: data.created_at,
  }
}

// --- Public API ---

export async function getGoalsForHabit(habitId: string): Promise<Goal[]> {
  if (await isAuthenticated()) {
    return await loadAuthGoalsForHabit(habitId)
  } else {
    return loadDemoGoals().filter((g) => g.habitId === habitId)
  }
}

export async function createGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal | null> {
  if (await isAuthenticated()) {
    return await createAuthGoal(goal)
  } else {
    const existing = loadDemoGoals()
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      habitId: goal.habitId,
      period: goal.period,
      targetCount: goal.targetCount,
      startDate: goal.startDate,
      endDate: goal.endDate,
      createdAt: new Date().toISOString(),
    }
    saveDemoGoals([...existing, newGoal])
    return newGoal
  }
}

export async function updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
  if (await isAuthenticated()) {
    return await updateAuthGoal(goalId, updates)
  } else {
    const existing = loadDemoGoals()
    const index = existing.findIndex((g) => g.id === goalId)
    if (index === -1) return null

    const updated: Goal = {
      ...existing[index],
      ...updates,
    }
    existing[index] = updated
    saveDemoGoals(existing)
    return updated
  }
}

/**
 * Ends a goal as of a specific date (defaults to today). Used for daily/weekly
 * goals, which otherwise run indefinitely; monthly goals are naturally bounded
 * by their own start/end dates instead.
 */
export async function endGoal(goalId: string, endDate?: string): Promise<Goal | null> {
  const resolvedEndDate = endDate ?? new Date().toISOString().slice(0, 10)
  return await updateGoal(goalId, { endDate: resolvedEndDate })
}

// --- Filtering ---

/**
 * Goals that are currently in effect for a given date (defaults to today):
 * started on or before that date, and either has no end date or ends on or
 * after it.
 */
export function getActiveGoals(goals: Goal[], onDate?: string): Goal[] {
  const date = onDate ?? new Date().toISOString().slice(0, 10)
  return goals.filter((g) => g.startDate <= date && (!g.endDate || g.endDate >= date))
}
