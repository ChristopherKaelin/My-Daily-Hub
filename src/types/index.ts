// User Settings
export interface UserSettings {
  id: string
  userId: string
  displayName: string | null
  city: string | null
  weatherUnit: 'fahrenheit' | 'celsius'
  theme: string
  createdAt: string
  updatedAt: string
}

// Tasks
export interface Task {
  id: string
  userId: string
  title: string
  description: string | null
  dueDate: string | null
  priority: 'low' | 'medium' | 'high'
  isComplete: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

// Habits
export interface Habit {
  id: string
  userId: string
  name: string
  trackingMode: 'boolean' | 'frequency' | 'cumulative'
  unit: string | null
  incrementAmount: number | null
  archivedAt: string | null
  createdAt: string
}

// Goals
export interface Goal {
  id: string
  habitId: string
  period: 'day' | 'week' | 'month'
  targetCount: number
  startDate: string
  endDate: string | null
  createdAt: string
}

// Progress Entries
export interface ProgressEntry {
  id: string
  goalId: string
  entryDate: string
  count: number
  createdAt: string
}

// Demo mode storage keys
export const DEMO_STORAGE_KEYS = {
  USER_SETTINGS: 'mdh_demo_user_settings',
  FAVORITE_LINKS: 'mdh_demo_favorite_links',
  FAVORITE_QUOTES: 'mdh_demo_favorite_quotes',
  KEY_DATES: 'mdh_demo_key_dates',
  HABITS: 'mdh_demo_habits',
  GOALS: 'mdh_demo_goals',
  PROGRESS_ENTRIES: 'mdh_demo_progress_entries',
  JOURNAL_ENTRIES: 'mdh_demo_journal_entries',
  TASKS: 'mdh_demo_tasks',
} as const
