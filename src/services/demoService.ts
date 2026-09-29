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

  // Placeholder empty arrays for future phases
  localStorage.setItem(DEMO_STORAGE_KEYS.FAVORITE_LINKS, JSON.stringify([]))
  localStorage.setItem(DEMO_STORAGE_KEYS.FAVORITE_QUOTES, JSON.stringify([]))
  localStorage.setItem(DEMO_STORAGE_KEYS.KEY_DATES, JSON.stringify([]))
  localStorage.setItem(DEMO_STORAGE_KEYS.GOAL_DEFINITIONS, JSON.stringify([]))
  localStorage.setItem(DEMO_STORAGE_KEYS.MONTHLY_GOALS, JSON.stringify([]))
  localStorage.setItem(DEMO_STORAGE_KEYS.PROGRESS_ENTRIES, JSON.stringify([]))
  localStorage.setItem(DEMO_STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify([]))
}

export function resetDemoData(): void {
  clearDemoData()
  initializeDemoData()
}
