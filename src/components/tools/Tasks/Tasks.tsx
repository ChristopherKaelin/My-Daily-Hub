import { useState, useEffect } from 'react'
import { getTasks, createTask, updateTask, deleteTask, completeTask, uncompleteTask } from '../../../services/tasksService'
import { type Task } from '../../../types'
import styles from './Tasks.module.css'

type SortOption = 'dueDate' | 'priority'

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('dueDate')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as const,
  })

  const [editingId, setEditingId] = useState<string | null>(null)

  // Load tasks on mount
  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      setLoading(true)
      setError(null)
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      setError('Failed to load tasks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function getSortedTasks(tasksToSort: Task[]): Task[] {
    const sorted = [...tasksToSort]

    if (sortBy === 'dueDate') {
      return sorted.sort((a, b) => {
        // Incomplete first
        if (a.isComplete !== b.isComplete) {
          return a.isComplete ? 1 : -1
        }
        // Then by due date (nulls last)
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        const dateCompare = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        if (dateCompare !== 0) return dateCompare
        // Then by priority (high > medium > low)
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
    }

    if (sortBy === 'priority') {
      return sorted.sort((a, b) => {
        // Incomplete first
        if (a.isComplete !== b.isComplete) {
          return a.isComplete ? 1 : -1
        }
        // Then by priority (high > medium > low)
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
    }

    return sorted
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setError(null)

      if (editingId) {
        const updated = await updateTask(editingId, {
          title: formData.title,
          description: formData.description || null,
          dueDate: formData.dueDate || null,
          priority: formData.priority,
        })
        if (updated) {
          setTasks(tasks.map((t) => (t.id === editingId ? updated : t)))
        }
        setEditingId(null)
      } else {
        const created = await createTask({
          title: formData.title,
          description: formData.description || null,
          dueDate: formData.dueDate || null,
          priority: formData.priority,
          isComplete: false,
        })
        if (created) {
          setTasks([...tasks, created])
        }
      }

      setFormData({ title: '', description: '', dueDate: '', priority: 'medium' })
      setIsFormOpen(false)
    } catch (err) {
      setError('Failed to save task')
      console.error(err)
    }
  }

  async function handleDelete(taskId: string) {
    if (!window.confirm('Are you sure?')) return

    try {
      const success = await deleteTask(taskId)
      if (success) {
        setTasks(tasks.filter((t) => t.id !== taskId))
      }
    } catch (err) {
      setError('Failed to delete task')
      console.error(err)
    }
  }

  async function handleToggleComplete(task: Task) {
    try {
      const updated = task.isComplete ? await uncompleteTask(task.id) : await completeTask(task.id)
      if (updated) {
        setTasks(tasks.map((t) => (t.id === task.id ? updated : t)))
      }
    } catch (err) {
      setError('Failed to update task')
      console.error(err)
    }
  }

  function handleEdit(task: Task) {
    setFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priority,
    })
    setEditingId(task.id)
    setIsFormOpen(true)
  }

  function handleCancel() {
    setFormData({ title: '', description: '', dueDate: '', priority: 'medium' })
    setEditingId(null)
    setIsFormOpen(false)
    setError(null)
  }

  const sortedTasks = getSortedTasks(tasks)

  return (
    <div className={`${styles.tasksPage} zone-action`}>
      {/* Header */}
      <div className={styles.tasksHeader}>
        <h1>To Do List</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          {isFormOpen ? '✕ Cancel' : '+ New Task'}
        </button>
      </div>

      {/* Collapsible Form */}
      {isFormOpen && (
        <form className={styles.tasksForm} onSubmit={handleSubmit}>
          {error && <div className={styles.formError}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={200}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Optional details"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className="btn btn-save">
              {editingId ? 'Update' : 'Add'} Task
            </button>
            <button type="button" className="btn btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Sort Controls */}
      <div className={styles.tasksControls}>
        <div className={styles.sortControls}>
          <label htmlFor="sortBy">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="dueDate">Due Date + Priority</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        <div className={styles.taskCount}>
          {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className={styles.loading}>Loading tasks...</div>
      ) : sortedTasks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tasks yet. Create one to get started!</p>
        </div>
      ) : (
        <div className={styles.tasksList}>
          {sortedTasks.map((task) => (
            <div key={task.id} className={`${styles.taskItem} ${task.isComplete ? styles.complete : ''}`}>
              <div className={styles.taskCheckbox}>
                <input
                  type="checkbox"
                  checked={task.isComplete}
                  onChange={() => handleToggleComplete(task)}
                  aria-label={`Mark ${task.title} as ${task.isComplete ? 'incomplete' : 'complete'}`}
                />
              </div>

              <div className={styles.taskContent}>
                <div className={styles.taskHeader}>
                  <h3 className={styles.taskTitle}>{task.title}</h3>
                  <div className={styles.taskMeta}>
                    <span className={`${styles.priorityBadge} ${styles[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`]}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className={styles.dueDate}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {task.description && (
                  <p className={styles.taskDescription}>{task.description}</p>
                )}
              </div>

              <div className={styles.taskActions}>
                <button
                  className="btn btn-sm btn-edit"
                  onClick={() => handleEdit(task)}
                  aria-label={`Edit ${task.title}`}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(task.id)}
                  disabled={!task.isComplete}
                  aria-label={`Delete ${task.title}`}
                  title={!task.isComplete ? 'Only completed tasks can be deleted' : ''}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
