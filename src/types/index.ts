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

// Demo mode storage keys
export const DEMO_STORAGE_KEYS = {
  USER_SETTINGS: 'mdh_demo_user_settings',
  FAVORITE_LINKS: 'mdh_demo_favorite_links',
  FAVORITE_QUOTES: 'mdh_demo_favorite_quotes',
  KEY_DATES: 'mdh_demo_key_dates',
  GOAL_DEFINITIONS: 'mdh_demo_goal_definitions',
  MONTHLY_GOALS: 'mdh_demo_monthly_goals',
  PROGRESS_ENTRIES: 'mdh_demo_progress_entries',
  JOURNAL_ENTRIES: 'mdh_demo_journal_entries',
  TASKS: 'mdh_demo_tasks',
} as const