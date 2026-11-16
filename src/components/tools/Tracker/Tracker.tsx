import { useState, useEffect } from 'react'
import { getHabits } from '../../../services/habitsService'
import { getAllGoals, getActiveGoals } from '../../../services/goalsService'
import { getProgressForDate, getProgressInRange, incrementProgress, decrementProgress } from '../../../services/progressService'
import { type Habit, type Goal, type ProgressEntry } from '../../../types'
import { ICON_REGISTRY } from '../../../data/iconRegistry'
import {
  getFirstDayOfPeriod,
  getLastDayOfPeriod,
  computeProgressPercent,
} from '../../../utils/habitFormatting'
import styles from './Tracker.module.css'

interface TrackerItem {
  goal: Goal
  habit: Habit
  todayEntry: ProgressEntry | null
  periodEntries: ProgressEntry[]
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function barColor(pct: number): string {
  if (pct >= 100) return 'var(--track-accent)'
  if (pct >= 67) return '#55B4C4'
  if (pct >= 34) return '#E0A83A'
  return 'var(--track-secondary)'
}

function periodLabel(period: 'day' | 'week' | 'month'): string {
  if (period === 'day') return 'Daily'
  if (period === 'week') return 'Weekly'
  return 'Monthly'
}

function goalProgressLabel(goal: Goal, habit: Habit, periodEntries: ProgressEntry[]): string {
  const totalCount = periodEntries.reduce((sum, e) => sum + e.count, 0)
  if (goal.period === 'day') {
    return habit.trackingMode === 'cumulative' && habit.incrementAmount && habit.unit
      ? `${(totalCount * habit.incrementAmount).toFixed(1).replace(/\.0$/, '')} ${habit.unit} today`
      : 'Daily goal'
  }
  const periodWord = goal.period === 'week' ? 'this week' : 'this month'
  if (habit.trackingMode === 'cumulative' && habit.incrementAmount && habit.unit) {
    const current = (totalCount * habit.incrementAmount).toFixed(1).replace(/\.0$/, '')
    return `${current} / ${goal.targetValue} ${habit.unit} ${periodWord}`
  }
  return `${totalCount} / ${goal.targetValue} ${periodWord}`
}

function habitMeasurementLabel(habit: Habit): string | null {
  if (habit.trackingMode === 'cumulative' && habit.incrementAmount && habit.unit) {
    return `${habit.incrementAmount} ${habit.unit} per count`
  }
  return null
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function Tracker() {
  const today = todayISO()
  const [selectedDate, setSelectedDate] = useState(today)
  const [view, setView] = useState<'log' | 'summary'>('log')
  const [items, setItems] = useState<TrackerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [selectedDate])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const [habits, allGoals] = await Promise.all([getHabits(), getAllGoals()])
      const activeGoals = getActiveGoals(allGoals, selectedDate)
      const habitMap = new Map(habits.map((h) => [h.id, h]))

      const loaded = await Promise.all(
        activeGoals.map(async (goal) => {
          const habit = habitMap.get(goal.habitId)
          if (!habit) return null
          const from = getFirstDayOfPeriod(selectedDate, goal.period)
          const to = getLastDayOfPeriod(selectedDate, goal.period)
          const [todayEntry, periodEntries] = await Promise.all([
            getProgressForDate(goal.id, selectedDate),
            getProgressInRange(goal.id, from, to),
          ])
          return { goal, habit, todayEntry, periodEntries }
        }),
      )

      setItems(loaded.filter((x): x is TrackerItem => x !== null))
    } catch (err) {
      setError('Failed to load goals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleIncrement(goalId: string) {
    setActionLoading(goalId)
    try {
      await incrementProgress(goalId, selectedDate)
      await loadData()
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDecrement(goalId: string) {
    setActionLoading(goalId)
    try {
      await decrementProgress(goalId, selectedDate)
      await loadData()
    } finally {
      setActionLoading(null)
    }
  }

  function shiftDate(days: number) {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + days)
    const next = d.toISOString().slice(0, 10)
    if (next <= today) setSelectedDate(next)
  }

  const isToday = selectedDate === today

  // Calendar summary helpers
  function buildCalendarMonth(goal: Goal) {
    const [year, month] = selectedDate.split('-').map(Number)
    const firstDay = `${selectedDate.slice(0, 7)}-01`
    const lastDay = getLastDayOfPeriod(selectedDate, 'month')
    const days = daysInMonth(year, month)
    // day-of-week offset: Monday=0
    const startDow = (new Date(firstDay + 'T00:00:00').getDay() + 6) % 7
    const entryDates = new Set(
      items
        .find((it) => it.goal.id === goal.id)
        ?.periodEntries.filter((e) => e.count > 0)
        .map((e) => e.entryDate) ?? [],
    )
    return { year, month, days, startDow, entryDates, firstDay, lastDay }
  }

  return (
    <div className={`${styles.trackerPage} zone-action`}>
      <div className={styles.pageHeader}>
        <h2>Tracker</h2>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${view === 'log' ? styles.toggleActive : ''}`}
            onClick={() => setView('log')}
          >
            Log
          </button>
          <button
            className={`${styles.toggleBtn} ${view === 'summary' ? styles.toggleActive : ''}`}
            onClick={() => setView('summary')}
          >
            Summary
          </button>
        </div>
      </div>

      <div className={styles.dateNav}>
        <button className={styles.dateBtn} onClick={() => shiftDate(-1)}>‹</button>
        <span className={styles.dateLabel}>
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <button
          className={styles.dateBtn}
          onClick={() => shiftDate(1)}
          disabled={isToday}
        >›</button>
        {!isToday && (
          <button className={styles.todayBtn} onClick={() => setSelectedDate(today)}>
            Today
          </button>
        )}
      </div>

      {loading && <p className={styles.stateMsg}>Loading...</p>}
      {error && <p className={`${styles.stateMsg} ${styles.stateMsgError}`}>{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className={styles.stateMsg}>No active goals for this date.</p>
      )}

      {!loading && !error && view === 'log' && items.map(({ goal, habit, todayEntry, periodEntries }) => {
        const pct = computeProgressPercent(periodEntries, goal, selectedDate, habit.incrementAmount ?? undefined)
        const IconComp = ICON_REGISTRY[goal.iconKey]
        const busy = actionLoading === goal.id

        const progressLabel = goalProgressLabel(goal, habit, periodEntries)
        const measureLabel = habitMeasurementLabel(habit)

        return (
          <div key={goal.id} className={styles.goalCard}>
            <div className={styles.goalCardHeader}>
              <div className={styles.goalInfo}>
                {IconComp && <IconComp size={20} weight="duotone" className={styles.goalIcon} />}
                <div>
                  <p className={styles.habitName}>{habit.name}</p>
                  <div className={styles.goalMeta}>
                    <span className={`${styles.periodBadge} ${styles[`period_${goal.period}`]}`}>
                      {periodLabel(goal.period)}
                    </span>
                    <span className={styles.progressLabel}>{progressLabel}</span>
                  </div>
                  {measureLabel && (
                    <p className={styles.measureLabel}>{measureLabel}</p>
                  )}
                </div>
              </div>

              <div className={styles.logControls}>
                {goal.period === 'day' ? (
                  todayEntry && todayEntry.count > 0 ? (
                    <button
                      className={`${styles.btnMark} ${styles.btnDone}`}
                      onClick={() => handleDecrement(goal.id)}
                      disabled={busy}
                    >
                      ✓ Done
                    </button>
                  ) : (
                    <button
                      className={styles.btnMark}
                      onClick={() => handleIncrement(goal.id)}
                      disabled={busy}
                    >
                      Mark done
                    </button>
                  )
                ) : (
                  <div className={styles.countControls}>
                    <button
                      className={styles.btnCount}
                      onClick={() => handleDecrement(goal.id)}
                      disabled={busy || !todayEntry || todayEntry.count <= 0}
                    >−</button>
                    <span className={styles.countValue}>{todayEntry?.count ?? 0}</span>
                    <button
                      className={styles.btnCount}
                      onClick={() => handleIncrement(goal.id)}
                      disabled={busy}
                    >+</button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${pct}%`, backgroundColor: barColor(pct) }}
                />
              </div>
              <span className={styles.progressPct}>{pct}%</span>
            </div>
          </div>
        )
      })}

      {!loading && !error && view === 'summary' && items.map(({ goal, habit }) => {
        const { year, month, days, startDow, entryDates } = buildCalendarMonth(goal)
        const IconComp = ICON_REGISTRY[goal.iconKey]
        const monthName = new Date(year, month - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })

        return (
          <div key={goal.id} className={styles.summaryCard}>
            <div className={styles.goalInfo}>
              {IconComp && <IconComp size={18} weight="duotone" className={styles.goalIcon} />}
              <p className={styles.habitName}>{habit.name}</p>
              <span className={`${styles.periodBadge} ${styles[`period_${goal.period}`]}`}>
                {periodLabel(goal.period)}
              </span>
            </div>
            <p className={styles.monthLabel}>{monthName}</p>
            <div className={styles.calendarGrid}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className={styles.calDayHeader}>{d}</span>
              ))}
              {Array.from({ length: startDow }).map((_, i) => (
                <span key={`pad-${i}`} />
              ))}
              {Array.from({ length: days }, (_, i) => {
                const dayNum = i + 1
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                const done = entryDates.has(dateStr)
                const isCurrentDay = dateStr === today
                const isFuture = dateStr > today
                return (
                  <span
                    key={dateStr}
                    className={[
                      styles.calDay,
                      done ? styles.calDayDone : '',
                      isCurrentDay ? styles.calDayToday : '',
                      isFuture ? styles.calDayFuture : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {dayNum}
                  </span>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
