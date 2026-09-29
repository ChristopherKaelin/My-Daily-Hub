import { useState, useEffect } from 'react'
import { getTasks } from '../../services/tasksService'
import { type Task } from '../../types'
import styles from './Card.module.css'

interface TasksCardProps {
  onNavigate?: (tool: string) => void
}

export function TasksCard({ onNavigate }: TasksCardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      setLoading(true)
      setError(null)
      const allTasks = await getTasks()
      // Filter incomplete tasks, sort by due date + priority
      const incomplete = allTasks.filter((t) => !t.isComplete)
      const sorted = incomplete.sort((a, b) => {
        // Nulls last
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        const dateCompare = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        if (dateCompare !== 0) return dateCompare
        // Then by priority (high > medium > low)
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      setTasks(sorted.slice(0, 5))
    } catch (err) {
      setError('Failed to load tasks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`${styles.card} zone-action`}>
        <h3 className={styles.cardTitle}>Upcoming Tasks</h3>
        <p className={styles.cardLoading}>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.card} zone-action`}>
        <h3 className={styles.cardTitle}>Upcoming Tasks</h3>
        <p className={styles.cardError}>{error}</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className={`${styles.card} zone-action`}>
        <h3 className={styles.cardTitle}>Upcoming Tasks</h3>
        <p className={styles.cardEmpty}>No tasks. Nice work!</p>
      </div>
    )
  }

  return (
    <div className={`${styles.card} zone-action`}>
      <button 
        className={styles.cardTitleButton}
        onClick={() => onNavigate?.('tasks')}
      >
        <h3 className={styles.cardTitle}>Upcoming Tasks</h3>
      </button>
      <ul className={styles.tasksList}>
        {tasks.map((task, index) => (
          <li key={task.id}>
            <div className={styles.taskRow}>
              <p className={styles.taskTitle}>{task.title}</p>
              {task.dueDate && (
                <p className={styles.taskDueDate}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            {index < tasks.length - 1 && <div className={styles.taskDivider} />}
          </li>
        ))}
      </ul>
    </div>
  )
}
