import { useState, useEffect } from 'react'
import { getHabits, getActiveHabits } from '../../../services/habitsService'
import { getGoalsForHabit, createGoal, endGoal } from '../../../services/goalsService'
import { type Habit, type Goal } from '../../../types'
import styles from './Goals.module.css'

type Period = 'day' | 'week' | 'month'

function isGoalActive(goal: Goal, today: string): boolean {
  return goal.startDate <= today && (!goal.endDate || goal.endDate >= today)
}

export function Goals() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [goalsByHabit, setGoalsByHabit] = useState<Record<string, Goal[]>>({})
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [formData, setFormData] = useState({
    habitId: '',
    period: 'day' as Period,
    targetCount: '',
    startDate: new Date().toISOString().split('T')[0],
  })

  const today = new Date().toISOString().split('T')[0]

  async function loadData() {
    const allHabits = await getHabits()
    setHabits(allHabits)

    const activeHabits = getActiveHabits(allHabits)
    const entries = await Promise.all(
      activeHabits.map(async (h) => [h.id, await getGoalsForHabit(h.id)] as const)
    )
    setGoalsByHabit(Object.fromEntries(entries))
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

    if (!formData.targetCount || Number(formData.targetCount) <= 0) {
      setError('Target must be greater than 0')
      return
    }

    try {
      setError(null)

      const created = await createGoal({
        habitId: formData.habitId,
        period: formData.period,
        targetCount: Number(formData.targetCount),
        startDate: formData.startDate,
        endDate: null,
      })

      if (created) {
        setGoalsByHabit({
          ...goalsByHabit,
          [formData.habitId]: [...(goalsByHabit[formData.habitId] || []), created],
        })
      }

      setFormData({ habitId: '', period: 'day', targetCount: '', startDate: today })
      setIsFormOpen(false)
    } catch (err) {
      setError('Failed to create goal')
      console.error(err)
    }
  }

  async function handleEndGoal(goal: Goal) {
    if (!window.confirm('End this goal as of today?')) return

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
    setFormData({ habitId: '', period: 'day', targetCount: '', startDate: today })
    setIsFormOpen(false)
    setError(null)
  }

  const activeHabits = getActiveHabits(habits)

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

          <div className={styles.formGroup}>
            <label htmlFor="habitId">Habit *</label>
            <select
              id="habitId"
              value={formData.habitId}
              onChange={(e) => setFormData({ ...formData, habitId: e.target.value })}
            >
              <option value="">Select a habit...</option>
              {activeHabits.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="period">Period</label>
              <select
                id="period"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value as Period })}
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

          <div className={styles.formGroup}>
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className="btn btn-primary">Add Goal</button>
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

                {sorted.length === 0 ? (
                  <p className={styles.noGoals}>No goals set for this habit yet.</p>
                ) : (
                  <div className={styles.goalsList}>
                    {sorted.map((goal) => {
                      const active = isGoalActive(goal, today)
                      return (
                        <div key={goal.id} className={`${styles.goalItem} ${!active ? styles.ended : ''}`}>
                          <div className={styles.goalContent}>
                            <span className={styles.periodBadge}>{goal.period}</span>
                            <span className={styles.goalTarget}>{goal.targetCount}x</span>
                            <span className={styles.goalDates}>
                              {goal.startDate}{goal.endDate ? ` – ${goal.endDate}` : ' – ongoing'}
                            </span>
                          </div>
                          {active && (
                            <button
                              className="btn btn-danger"
                              onClick={() => handleEndGoal(goal)}
                              aria-label={`End ${habit.name} ${goal.period} goal`}
                            >
                              End Goal
                            </button>
                          )}
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
    </div>
  )
}
