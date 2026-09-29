import { supabase } from '../lib/supabaseClient'
import { isAuthenticated, getCurrentUserId } from './authService'
import { type Task, DEMO_STORAGE_KEYS } from '../types'

// --- Demo Mode ---

function loadDemoTasks(): Task[] {
  const raw = localStorage.getItem(DEMO_STORAGE_KEYS.TASKS)
  return raw ? JSON.parse(raw) : []
}

function saveDemoTasks(tasks: Task[]): void {
  localStorage.setItem(DEMO_STORAGE_KEYS.TASKS, JSON.stringify(tasks))
}

// --- Supabase ---

async function loadAuthTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('priority', { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    priority: row.priority,
    isComplete: row.is_complete,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

async function createAuthTask(userId: string, task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'completedAt'>): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: task.title,
      description: task.description,
      due_date: task.dueDate,
      priority: task.priority,
      is_complete: task.isComplete,
    })
    .select()
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description,
    dueDate: data.due_date,
    priority: data.priority,
    isComplete: data.is_complete,
    completedAt: data.completed_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

async function updateAuthTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: updates.title,
      description: updates.description,
      due_date: updates.dueDate,
      priority: updates.priority,
      is_complete: updates.isComplete,
    })
    .eq('id', taskId)
    .select()
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description,
    dueDate: data.due_date,
    priority: data.priority,
    isComplete: data.is_complete,
    completedAt: data.completed_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

async function deleteAuthTask(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  return !error
}

// --- Public API ---

export async function getTasks(): Promise<Task[]> {
  if (await isAuthenticated()) {
    const userId = await getCurrentUserId()
    if (!userId) return []
    return await loadAuthTasks(userId)
  } else {
    return loadDemoTasks()
  }
}

export async function createTask(task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'completedAt'>): Promise<Task | null> {
  if (await isAuthenticated()) {
    const userId = await getCurrentUserId()
    if (!userId) return null
    return await createAuthTask(userId, task)
  } else {
    const existing = loadDemoTasks()
    const newTask: Task = {
      id: crypto.randomUUID(),
      userId: 'demo',
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      isComplete: task.isComplete,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveDemoTasks([...existing, newTask])
    return newTask
  }
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
  if (await isAuthenticated()) {
    return await updateAuthTask(taskId, updates)
  } else {
    const existing = loadDemoTasks()
    const index = existing.findIndex((t) => t.id === taskId)
    if (index === -1) return null

    const updated: Task = {
      ...existing[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    existing[index] = updated
    saveDemoTasks(existing)
    return updated
  }
}

export async function deleteTask(taskId: string): Promise<boolean> {
  if (await isAuthenticated()) {
    return await deleteAuthTask(taskId)
  } else {
    const existing = loadDemoTasks()
    const filtered = existing.filter((t) => t.id !== taskId)
    saveDemoTasks(filtered)
    return true
  }
}

export async function completeTask(taskId: string): Promise<Task | null> {
  return updateTask(taskId, { isComplete: true })
}

export async function uncompleteTask(taskId: string): Promise<Task | null> {
  return updateTask(taskId, { isComplete: false })
}