import { useState, useEffect, useRef } from 'react'
import { getHabits, createHabit, updateHabit, archiveHabit, unarchiveHabit, deleteHabit } from '../../../services/habitsService'
import { getGoalsForHabit } from '../../../services/goalsService'
import { type Habit } from '../../../types'
import { formatIncrementDetail } from '../../../utils/habitFormatting'
import ConfirmModal from '../../common/ConfirmModal'
import styles from './Habits.module.css'

type TrackingMode = 'boolean' | 'frequency' | 'cumulative'

export function Habits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitsWithGoals, setHabitsWithGoals] = useState<Set<string>>(new Set())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteHabit, setConfirmDeleteHabit] = useState<Habit | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    trackingMode: 'boolean' as TrackingMode,
    unit: '',
    incrementAmount: '',
  })

  const [editingId, setEditingId] = useState<string | null>(null)

  // Load habits on mount
  useEffect(() => {
    let isMounted = true

    const loadHabits = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getHabits()
        if (isMounted) {
          setHabits(data)
          const withGoals = await findHabitsWithGoals(data)
          if (isMounted) setHabitsWithGoals(withGoals)
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load habits')
          console.error(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadHabits()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleRefresh() {
    try {
      setIsRefreshing(true)
      setError(null)
      const data = await getHabits()
      setHabits(data)
      setHabitsWithGoals(await findHabitsWithGoals(data))
    } catch (err) {
      setError('Failed to refresh habits')
      console.error(err)
    } finally {
      setIsRefreshing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    if (formData.trackingMode === 'cumulative' && (!formData.unit.trim() || !formData.incrementAmount)) {
      setError('Unit and increment amount are required for cumulative habits')
      return
    }

    try {
      setError(null)

      const unit = formData.trackingMode === 'cumulative' ? formData.unit : null
      const incrementAmount = formData.trackingMode === 'cumulative' ? Number(formData.incrementAmount) : null

      if (editingId) {
        const updated = await updateHabit(editingId, {
          name: formData.name,
          trackingMode: formData.trackingMode,
          unit,
          incrementAmount,
        })
        if (updated) {
          setHabits(habits.map((h) => (h.id === editingId ? updated : h)))
        }
        setEditingId(null)
      } else {
        const created = await createHabit({
          name: formData.name,
          trackingMode: formData.trackingMode,
          unit,
          incrementAmount,
        })
        if (created) {
          setHabits([...habits, created])
        }
      }

      setFormData({ name: '', trackingMode: 'boolean', unit: '', incrementAmount: '' })
      setIsFormOpen(false)
    } catch (err) {
      setError('Failed to save habit')
      console.error(err)
    }
  }

  async function handleToggleArchive(habit: Habit) {
    try {
      const updated = habit.archivedAt ? await unarchiveHabit(habit.id) : await archiveHabit(habit.id)
      if (updated) {
        setHabits(habits.map((h) => (h.id === habit.id ? updated : h)))
      }
    } catch (err) {
      setError('Failed to update habit')
      console.error(err)
    }
  }

  async function handleDelete(habit: Habit) {
    try {
      const ok = await deleteHabit(habit.id)
      if (ok) {
        setHabits(habits.filter((h) => h.id !== habit.id))
      } else {
        setError('Failed to delete habit')
      }
    } catch (err) {
      setError('Failed to delete habit')
      console.error(err)
    }
  }

  function handleEdit(habit: Habit) {
    setFormData({
      name: habit.name,
      trackingMode: habit.trackingMode,
      unit: habit.unit || '',
      incrementAmount: habit.incrementAmount?.toString() || '',
    })
    setEditingId(habit.id)
    setIsFormOpen(true)
  }

  function handleCancel() {
    setFormData({ name: '', trackingMode: 'boolean', unit: '', incrementAmount: '' })
    setEditingId(null)
    setIsFormOpen(false)
    setError(null)
  }

  const activeHabits = habits.filter((h) => !h.archivedAt)
  const archivedHabits = habits.filter((h) => h.archivedAt)

  return (
    <div className={`${styles.habitsPage} zone-action`}>
      {/* Header */}
      <div className={styles.habitsHeader}>
        <h1>Habits</h1>
        <div className={styles.headerButtons}>
          <button
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh habits"
          >
            {isRefreshing ? 'Refreshing...' : '⟳ Refresh'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => (isFormOpen ? handleCancel() : setIsFormOpen(true))}
          >
            {isFormOpen ? '✕ Cancel' : '+ New Habit'}
          </button>
        </div>
      </div>

      {/* New Habit Form — only for creating; editing an existing habit renders
          the form in place of its row further down the list. */}
      {isFormOpen && !editingId && (
        <HabitForm
          formData={formData}
          setFormData={setFormData}
          error={error}
          isEditing={false}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Habit List */}
      {loading ? (
        <div className={styles.loading}>Loading habits...</div>
      ) : habits.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No habits yet. Create one to get started!</p>
        </div>
      ) : (
        <>
          <div className={styles.habitsList}>
            {activeHabits.map((habit) =>
              habit.id === editingId ? (
                <HabitForm
                  key={habit.id}
                  formData={formData}
                  setFormData={setFormData}
                  error={error}
                  isEditing
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              ) : (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  hasGoals={habitsWithGoals.has(habit.id)}
                  onEdit={handleEdit}
                  onToggleArchive={handleToggleArchive}
                  onDelete={setConfirmDeleteHabit}
                />
              )
            )}
          </div>

          {archivedHabits.length > 0 && (
            <div className={styles.archivedSection}>
              <h2 className={styles.archivedHeading}>Archived</h2>
              <div className={styles.habitsList}>
                {archivedHabits.map((habit) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    hasGoals={habitsWithGoals.has(habit.id)}
                    onEdit={handleEdit}
                    onToggleArchive={handleToggleArchive}
                    onDelete={setConfirmDeleteHabit}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {confirmDeleteHabit && (
        <ConfirmModal
          title="Delete Habit"
          message={`Delete "${confirmDeleteHabit.name}"? This can't be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            handleDelete(confirmDeleteHabit)
            setConfirmDeleteHabit(null)
          }}
          onCancel={() => setConfirmDeleteHabit(null)}
        />
      )}
    </div>
  )
}

async function findHabitsWithGoals(habits: Habit[]): Promise<Set<string>> {
  const results = await Promise.all(
    habits.map(async (h) => [h.id, (await getGoalsForHabit(h.id)).length > 0] as const)
  )
  return new Set(results.filter(([, hasAny]) => hasAny).map(([id]) => id))
}

function HabitForm({
  formData,
  setFormData,
  error,
  isEditing,
  onSubmit,
  onCancel,
}: {
  formData: {
    name: string
    trackingMode: TrackingMode
    unit: string
    incrementAmount: string
  }
  setFormData: (data: { name: string; trackingMode: TrackingMode; unit: string; incrementAmount: string }) => void
  error: string | null
  isEditing: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}) {
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  return (
    <form className={styles.habitsForm} onSubmit={onSubmit}>
      {error && <div className={styles.formError}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          ref={nameInputRef}
          type="text"
          placeholder="e.g. Walk 1/2 mile, Read 15 minutes"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          maxLength={200}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="trackingMode">Tracking Mode</label>
        <select
          id="trackingMode"
          value={formData.trackingMode}
          onChange={(e) => setFormData({ ...formData, trackingMode: e.target.value as TrackingMode })}
        >
          <option value="boolean">Boolean (did / didn't do it)</option>
          <option value="frequency">Frequency (count of occurrences)</option>
          <option value="cumulative">Cumulative (adds up to a total)</option>
        </select>
      </div>

      {formData.trackingMode === 'cumulative' && (
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="unit">Unit *</label>
            <input
              id="unit"
              type="text"
              placeholder="e.g. miles, minutes"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              maxLength={50}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="incrementAmount">Increment Amount *</label>
            <input
              id="incrementAmount"
              type="number"
              step="any"
              placeholder="e.g. 0.5"
              value={formData.incrementAmount}
              onChange={(e) => setFormData({ ...formData, incrementAmount: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary">
          {isEditing ? 'Update' : 'Add'} Habit
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function HabitItem({
  habit,
  hasGoals,
  onEdit,
  onToggleArchive,
  onDelete,
}: {
  habit: Habit
  hasGoals: boolean
  onEdit: (habit: Habit) => void
  onToggleArchive: (habit: Habit) => void
  onDelete: (habit: Habit) => void
}) {
  const isArchived = !!habit.archivedAt

  return (
    <div className={`${styles.habitItem} ${isArchived ? styles.archived : ''}`}>
      <div className={styles.habitContent}>
        <h3 className={styles.habitName}>
          {habit.trackingMode === 'cumulative'
            ? `${habit.name}, in ${formatIncrementDetail(habit)} increments.`
            : habit.name}
        </h3>
      </div>

      <div className={styles.habitActions}>
        <span className={styles.trackingModeBadge}>{habit.trackingMode}</span>
        {!isArchived && !hasGoals && (
          <button
            className="btn btn-secondary"
            onClick={() => onEdit(habit)}
            aria-label={`Edit ${habit.name}`}
          >
            Edit
          </button>
        )}
        {hasGoals && (
          <span className={styles.editLockedHint} title="This habit has goal history, so it can't be edited">
            Locked
          </span>
        )}

        {hasGoals ? (
          <button
            className={isArchived ? 'btn btn-secondary' : 'btn btn-danger'}
            onClick={() => onToggleArchive(habit)}
            aria-label={`${isArchived ? 'Unarchive' : 'Archive'} ${habit.name}`}
          >
            {isArchived ? 'Unarchive' : 'Archive'}
          </button>
        ) : (
          <>
            {isArchived && (
              <button
                className="btn btn-secondary"
                onClick={() => onToggleArchive(habit)}
                aria-label={`Unarchive ${habit.name}`}
              >
                Unarchive
              </button>
            )}
            <button
              className="btn btn-danger"
              onClick={() => onDelete(habit)}
              aria-label={`Delete ${habit.name}`}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}
