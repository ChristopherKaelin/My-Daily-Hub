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

  // Sample tasks
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const sampleTasks = [
    {
      id: crypto.randomUUID(),
      userId: 'demo',
      title: 'Review project proposal',
      description: 'Review the Q4 project proposal and provide feedback',
      dueDate: tomorrow.toISOString().split('T')[0],
      priority: 'high',
      isComplete: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: 'demo',
      title: 'Follow up with client',
      description: 'Send status update email to acme corp',
      dueDate: tomorrow.toISOString().split('T')[0],
      priority: 'medium',
      isComplete: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: 'demo',
      title: 'Update documentation',
      description: 'Add API endpoint docs to wiki',
      dueDate: nextWeek.toISOString().split('T')[0],
      priority: 'low',
      isComplete: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: 'demo',
      title: 'Team standup notes',
      description: 'Compile notes from this week\'s standups',
      dueDate: null,
      priority: 'medium',
      isComplete: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: 'demo',
      title: 'Code review pending PRs',
      description: null,
      dueDate: null,
      priority: 'high',
      isComplete: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  localStorage.setItem(DEMO_STORAGE_KEYS.TASKS, JSON.stringify(sampleTasks))

  // Sample habits, goals, and progress
  const readHabitId = crypto.randomUUID()
  const walkHabitId = crypto.randomUUID()
  const ztmHabitId = crypto.randomUUID()

  const sampleHabits = [
    {
      id: readHabitId,
      userId: 'demo',
      name: 'Read 15 minutes',
      trackingMode: 'boolean',
      unit: null,
      incrementAmount: null,
      archivedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: walkHabitId,
      userId: 'demo',
      name: 'Walk 1/2 mile',
      trackingMode: 'cumulative',
      unit: 'miles',
      incrementAmount: 0.5,
      archivedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: ztmHabitId,
      userId: 'demo',
      name: 'Study ZTM course',
      trackingMode: 'frequency',
      unit: null,
      incrementAmount: null,
      archivedAt: null,
      createdAt: new Date().toISOString(),
    },
  ]

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7)) // Monday

  const readGoalId = crypto.randomUUID()
  const walkGoalId = crypto.randomUUID()
  const ztmGoalId = crypto.randomUUID()

  const sampleGoals = [
    {
      id: readGoalId,
      habitId: readHabitId,
      period: 'day',
      targetCount: 1,
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: walkGoalId,
      habitId: walkHabitId,
      period: 'month',
      targetCount: 60, // 30 miles at 0.5 miles per increment
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: ztmGoalId,
      habitId: ztmHabitId,
      period: 'week',
      targetCount: 3,
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: null,
      createdAt: new Date().toISOString(),
    },
  ]

  const sampleProgressEntries = [
    {
      id: crypto.randomUUID(),
      goalId: readGoalId,
      entryDate: today.toISOString().split('T')[0],
      count: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      goalId: walkGoalId,
      entryDate: new Date(today.getFullYear(), today.getMonth(), Math.max(1, today.getDate() - 2)).toISOString().split('T')[0],
      count: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      goalId: walkGoalId,
      entryDate: new Date(today.getFullYear(), today.getMonth(), Math.max(1, today.getDate() - 1)).toISOString().split('T')[0],
      count: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      goalId: ztmGoalId,
      entryDate: startOfWeek.toISOString().split('T')[0],
      count: 1,
      createdAt: new Date().toISOString(),
    },
  ]

  localStorage.setItem(DEMO_STORAGE_KEYS.HABITS, JSON.stringify(sampleHabits))
  localStorage.setItem(DEMO_STORAGE_KEYS.GOALS, JSON.stringify(sampleGoals))
  localStorage.setItem(DEMO_STORAGE_KEYS.PROGRESS_ENTRIES, JSON.stringify(sampleProgressEntries))

  // Placeholder empty arrays for future phases
  localStorage.setItem(DEMO_STORAGE_KEYS.FAVORITE_LINKS, JSON.stringify([]))
  localStorage.setItem(DEMO_STORAGE_KEYS.FAVORITE_QUOTES, JSON.stringify([]))
  localStorage.setItem(DEMO_STORAGE_KEYS.KEY_DATES, JSON.stringify([]))
  localStorage.setItem(DEMO_STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify([]))
}

export function resetDemoData(): void {
  clearDemoData()
  initializeDemoData()
}
