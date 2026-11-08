import { useState, useEffect, useRef } from 'react'
import { getHabits, getActiveHabits } from '../../../services/habitsService'
import { getGoalsForHabit, createGoal, updateGoal, endGoal, deleteGoal } from '../../../services/goalsService'
import { hasProgressEntries } from '../../../services/progressService'
import { type Habit, type Goal } from '../../../types'
import { formatHabitSummary, formatHabitOptionLabel } from '../../../utils/habitFormatting'
import { IconCombobox } from '../../common/IconCombobox'
import { ICON_REGISTRY } from '../../../data/iconRegistry'
import ConfirmModal from '../../common/ConfirmModal'
import styles from './Goals.module.css'

type Period = 'day' | 'week' | 'month'

function isGoalActive(goal: Goal, today: string): boolean {
  return goal.startDate <= today && (!goal.endDate || goal.endDate >= today)
}

const MAX_DATE = '9999-12-31' // stand-in for "infinity" so an open-ended range compares correctly

/** ISO date (YYYY-MM-DD) for the last day of the month containing dateStr. */
function lastDayOfMonth(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number)
  const lastDay = new Date(year, month, 0) // day 0 of next month = last day of this month
  return lastDay.toISOString().split('T')[0]
}

/**
 * Whether two date ranges overlap at all, treating a null end as running
 * indefinitely. Mirrors the DB's `goals_no_overlap` exclusion constraint —
 * this is a client-side pre-check for a friendly error, not the real guard.
 */
function rangesOverlap(aStart: string, aEnd: string | null, bStart: string, bEnd: string | null): boolean {
  return aStart <= (bEnd ?? MAX_DATE) && bStart <= (aEnd ?? MAX_DATE)
}

export function Goals() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [goalsByHabit, setGoalsByHabit] = useState<Record<string, Goal[]>>({})
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [editableGoalIds, setEditableGoalIds] = useState<Set<string>>(new Set())
  const [confirmEndGoal, setConfirmEndGoal] = useState<Goal | null>(null)
  const [confirmDeleteGoal, setConfirmDeleteGoal] = useState<Goal | null>(null)

  const [formData, setFormData] = useState({
    habitId: '',
    iconKey: '',
    period: 'day' as Period,
    targetCount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })

  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)

  const today = new Date().toISOString().split('T')[0]

  async function loadData() {
    const allHabits = await getHabits()
    setHabits(allHabits)

    const activeHabits = getActiveHabits(allHabits)
    const entries = await Promise.all(
      activeHabits.map(async (h) => [h.id, await getGoalsForHabit(h.id)] as const)
    )
    const goalMap = Object.fromEntries(entries)
    setGoalsByHabit(goalMap)

    // A goal is only safe to edit or delete before anything's been logged
    // against it.
    const allGoals = Object.values(goalMap).flat() as Goal[]
    const flags = await Promise.all(
      allGoals.map(async (g) => [g.id, !(await hasProgressEntries(g.id))] as const)
    )
    setEditableGoalIds(new Set(flags.filter(([, editable]) => editable).map(([id]) => id)))
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        await loadData()
      } catch (err) {
        if (isMounted) {
          setError('Failed to load goals')
          console.error(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleRefresh() {
    try {
      setIsRefreshing(true)
      setError(null)
      await loadData()
    } catch (err) {
      setError('Failed to refresh goals')
      console.error(err)
    } finally {
      setIsRefreshing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.habitId) {
      setError('Choose a habit')
      return
    }

    if (!formData.iconKey) {
      setError('Choose an icon')
      return
    }

    if (!formData.targetCount || Number(formData.targetCount) <= 0) {
      setError('Target must be greater than 0')
      return
    }

    const endDate = formData.endDate || null

    if (endDate && endDate < formData.startDate) {
      setError('End date must be on or after the start date')
      return
    }

    const existingGoals = goalsByHabit[formData.habitId] || []
    const conflict = existingGoals.find((g) => rangesOverlap(formData.startDate, endDate, g.startDate, g.endDate))
    if (conflict) {
      setError(
        `This habit already has a ${conflict.period} goal covering that range ` +
          `(${conflict.startDate}${conflict.endDate ? ` – ${conflict.endDate}` : ' onward'}). ` +
          `End it first or pick a non-overlapping range.`
      )
      return
    }

    try {
      setError(null)

      if (editingGoalId) {
        const updated = await updateGoal(editingGoalId, {
          iconKey: formData.iconKey,
          period: formData.period,
          targetCount: Number(formData.targetCount),
          startDate: formData.startDate,
          endDate,
        })

        if (updated) {
          setGoalsByHabit({
            ...goalsByHabit,
            [formData.habitId]: (goalsByHabit[formData.habitId] || []).map((g) =>
              g.id === editingGoalId ? updated : g
            ),
          })
        }
      } else {
        const created = await createGoal({
          habitId: formData.habitId,
          iconKey: formData.iconKey,
          period: formData.period,
          targetCount: Number(formData.targetCount),
          startDate: formData.startDate,
          endDate,
        })

        if (created) {
          setGoalsByHabit({
            ...goalsByHabit,
            [formData.habitId]: [...(goalsByHabit[formData.habitId] || []), created],
          })
        }
      }

      setFormData({ habitId: '', iconKey: '', period: 'day', targetCount: '', startDate: today, endDate: '' })
      setIsFormOpen(false)
      setEditingGoalId(null)
    } catch (err) {
      setError(editingGoalId ? 'Failed to save changes' : 'Failed to create goal')
      console.error(err)
    }
  }

  async function handleEndGoal(goal: Goal) {
    try {
      const updated = await endGoal(goal.id)
      if (updated) {
        setGoalsByHabit({
          ...goalsByHabit,
          [goal.habitId]: (goalsByHabit[goal.habitId] || []).map((g) => (g.id === goal.id ? updated : g)),
        })
      }
    } catch (err) {
      setError('Failed to end goal')
      console.error(err)
    }
  }

  function handleCancel() {
    setFormData({ habitId: '', iconKey: '', period: 'day', targetCount: '', startDate: today, endDate: '' })
    setIsFormOpen(false)
    setEditingGoalId(null)
    setError(null)
  }

  function handleEdit(goal: Goal) {
    setFormData({
      habitId: goal.habitId,
      iconKey: goal.iconKey,
      period: goal.period,
      targetCount: String(goal.targetCount),
      startDate: goal.startDate,
      endDate: goal.endDate ?? '',
    })
    setEditingGoalId(goal.id)
    setIsFormOpen(true)
    setError(null)
  }

  async function handleDelete(goal: Goal) {
    try {
      const result = await deleteGoal(goal.id)

      if (result.blocked) {
        setError("This goal has logged progress and can't be deleted.")
        return
      }

      if (result.ok) {
        setGoalsByHabit({
          ...goalsByHabit,
          [goal.habitId]: (goalsByHabit[goal.habitId] || []).filter((g) => g.id !== goal.id),
        })
      } else {
        setError('Failed to delete goal')
      }
    } catch (err) {
      setError('Failed to delete goal')
      console.error(err)
    }
  }

  const activeHabits = getActiveHabits(habits)
  const selectedHabit = activeHabits.find((h) => h.id === formData.habitId) ?? null

  return (
    <div className={`${styles.goalsPage} zone-action`}>
      {/* Header */}
      <div className={styles.goalsHeader}>
        <h1>Goals</h1>
        <div className={styles.headerButtons}>
          <button
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh goals"
          >
            {isRefreshing ? 'Refreshing...' : '⟳ Refresh'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => (isFormOpen ? handleCancel() : setIsFormOpen(true))}
            disabled={activeHabits.length === 0}
          >
            {isFormOpen ? '✕ Cancel' : '+ New Goal'}
          </button>
        </div>
      </div>

      {activeHabits.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>No active habits yet. Create a habit first before attaching a goal to it.</p>
        </div>
      )}

      {/* Collapsible Form */}
      {isFormOpen && (
        <form className={styles.goalsForm} onSubmit={handleSubmit}>
          {error && <div className={styles.formError}>{error}</div>}

          <div className={`${styles.formRow} ${styles.formRowWithHint}`}>
            <div className={styles.formGroup}>
              <label htmlFor="habitId">Habit *</label>
              <select
                id="habitId"
                value={formData.habitId}
                disabled={!!editingGoalId}
                onChange={(e) => setFormData({ ...formData, habitId: e.target.value })}
              >
                <option value="">Select a habit...</option>
                {activeHabits.map((h) => (
                  <option key={h.id} value={h.id}>{formatHabitOptionLabel(h)}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="iconKey">Icon *</label>
              <IconCombobox
                value={formData.iconKey}
                onChange={(iconKey) => setFormData({ ...formData, iconKey })}
              />
            </div>
          </div>
          {selectedHabit && (
            <p className={styles.fieldHint}>{formatHabitSummary(selectedHabit)}</p>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="period">Period</label>
              <select
                id="period"
                value={formData.period}
                onChange={(e) => {
                  const period = e.target.value as Period
                  // Month goals default to ending at month's end (editable); day/week
                  // stay open-ended unless you set an end date yourself.
                  const endDate = period === 'month' ? lastDayOfMonth(formData.startDate) : formData.endDate
                  setFormData({ ...formData, period, endDate })
                }}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="targetCount">Target *</label>
              <input
                id="targetCount"
                type="number"
                min="1"
                placeholder="e.g. 3"
                value={formData.targetCount}
                onChange={(e) => setFormData({ ...formData, targetCount: e.target.value })}
              />
            </div>
          </div>

          <div className={`${styles.formRow} ${styles.formRowWithHint}`}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                ref={startDateRef}
                type="date"
                value={formData.startDate}
                onClick={() => startDateRef.current?.showPicker?.()}
                onChange={(e) => {
                  const startDate = e.target.value
                  const endDate = formData.period === 'month' ? lastDayOfMonth(startDate) : formData.endDate
                  setFormData({ ...formData, startDate, endDate })
                }}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate">End Date (optional)</label>
              <input
                id="endDate"
                ref={endDateRef}
                type="date"
                value={formData.endDate}
                min={formData.startDate}
                onClick={() => endDateRef.current?.showPicker?.()}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <p className={styles.fieldHint}>
            Leave the end date blank for an ongoing goal you'll end manually. Month goals default to the end of the
            month.
          </p>

          <div className={styles.formActions}>
            <button type="submit" className="btn btn-primary">{editingGoalId ? 'Save Changes' : 'Add Goal'}</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      )}

      {/* Goals by Habit */}
      {loading ? (
        <div className={styles.loading}>Loading goals...</div>
      ) : (
        <div className={styles.habitGroups}>
          {activeHabits.map((habit) => {
            const goals = goalsByHabit[habit.id] || []
            const sorted = [...goals].sort((a, b) => b.startDate.localeCompare(a.startDate))

            return (
              <div key={habit.id} className={styles.habitGroup}>
                <h2 className={styles.habitGroupTitle}>{habit.name}</h2>
                <p className={styles.habitGroupSummary}>
                  {formatHabitSummary(habit)}
                </p>

                {sorted.length === 0 ? (
                  <p className={styles.noGoals}>No goals set for this habit yet.</p>
                ) : (
                  <div className={styles.goalsList}>
                    {sorted.map((goal) => {
                      const active = isGoalActive(goal, today)
                      const GoalIcon = ICON_REGISTRY[goal.iconKey]
                      return (
                        <div key={goal.id} className={`${styles.goalItem} ${!active ? styles.ended : ''}`}>
                          <div className={styles.goalContent}>
                            {GoalIcon && <GoalIcon size={20} weight="regular" className={styles.goalIcon} />}
                            <span className={styles.periodBadge}>{goal.period}</span>
                            <span className={styles.goalTarget}>{goal.targetCount}x</span>
                            <span className={styles.goalDates}>
                              {goal.startDate}{goal.endDate ? ` – ${goal.endDate}` : ' – ongoing'}
                            </span>
                          </div>
                          <div className={styles.goalActions}>
                            {editableGoalIds.has(goal.id) && (
                              <>
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => handleEdit(goal)}
                                  aria-label={`Edit ${habit.name} ${goal.period} goal`}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-danger"
                                  onClick={() => setConfirmDeleteGoal(goal)}
                                  aria-label={`Delete ${habit.name} ${goal.period} goal`}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                            {active && (
                              <button
                                className="btn btn-danger"
                                onClick={() => setConfirmEndGoal(goal)}
                                aria-label={`End ${habit.name} ${goal.period} goal`}
                              >
                                End
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {confirmEndGoal && (
        <ConfirmModal
          title="End Goal"
          message="End this goal as of today?"
          confirmLabel="End"
          danger
          onConfirm={() => {
            handleEndGoal(confirmEndGoal)
            setConfirmEndGoal(null)
          }}
          onCancel={() => setConfirmEndGoal(null)}
        />
      )}

      {confirmDeleteGoal && (
        <ConfirmModal
          title="Delete Goal"
          message="Delete this goal? This can't be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            handleDelete(confirmDeleteGoal)
            setConfirmDeleteGoal(null)
          }}
          onCancel={() => setConfirmDeleteGoal(null)}
        />
      )}
    </div>
  )
}
