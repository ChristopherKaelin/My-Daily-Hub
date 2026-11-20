import React, { useState, useEffect } from 'react'
import { ArrowFatLineLeftIcon, ArrowFatLineRightIcon, PlusCircleIcon, MinusCircleIcon, ClipboardTextIcon, PresentationChartIcon, SquareIcon, CheckSquareIcon } from '@phosphor-icons/react'
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

interface SummaryRow {
  goal: Goal
  habit: Habit
  loggedDates: Set<string>
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

function fmtAmount(value: number): string {
  return Number(value.toFixed(2)).toString()
}

function goalProgressLabel(goal: Goal, habit: Habit, periodEntries: ProgressEntry[]): string {
  const totalCount = periodEntries.reduce((sum, e) => sum + e.count, 0)
  if (goal.period === 'day') {
    return habit.trackingMode === 'cumulative' && habit.incrementAmount && habit.unit
      ? `${fmtAmount(totalCount * habit.incrementAmount)} ${habit.unit} today`
      : 'Daily goal'
  }
  const periodWord = goal.period === 'week' ? 'this week' : 'this month'
  if (habit.trackingMode === 'cumulative' && habit.incrementAmount && habit.unit) {
    return `${fmtAmount(totalCount * habit.incrementAmount)} / ${goal.targetValue} ${habit.unit} ${periodWord}`
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

const PERIOD_ORDER: Record<string, number> = { day: 0, week: 1, month: 2 }

function sortItems(items: TrackerItem[]): TrackerItem[] {
  return [...items].sort((a, b) => {
    const periodDiff = PERIOD_ORDER[a.goal.period] - PERIOD_ORDER[b.goal.period]
    if (periodDiff !== 0) return periodDiff
    const aDone = (a.todayEntry?.count ?? 0) > 0 ? 1 : 0
    const bDone = (b.todayEntry?.count ?? 0) > 0 ? 1 : 0
    return aDone - bDone
  })
}

export function Tracker() {
  const today = todayISO()
  const [selectedDate, setSelectedDate] = useState(today)
  const [view, setView] = useState<'log' | 'summary'>('log')
  const [items, setItems] = useState<TrackerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [summaryRows, setSummaryRows] = useState<SummaryRow[]>([])
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedDate])

  useEffect(() => {
    if (view === 'summary') loadSummaryData()
  }, [view, selectedDate])

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

      setItems(sortItems(loaded.filter((x): x is TrackerItem => x !== null)))
    } catch (err) {
      setError('Failed to load goals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadSummaryData() {
    setSummaryLoading(true)
    try {
      const [habits, allGoals] = await Promise.all([getHabits(), getAllGoals()])
      const activeGoals = getActiveGoals(allGoals, selectedDate)
      const habitMap = new Map(habits.map((h) => [h.id, h]))
      const from = `${selectedDate.slice(0, 7)}-01`
      const to = getLastDayOfPeriod(selectedDate, 'month')

      const rows = await Promise.all(
        activeGoals.map(async (goal) => {
          const habit = habitMap.get(goal.habitId)
          if (!habit) return null
          const entries = await getProgressInRange(goal.id, from, to)
          const loggedDates = new Set(entries.filter((e) => e.count > 0).map((e) => e.entryDate))
          return { goal, habit, loggedDates }
        }),
      )
      setSummaryRows(rows.filter((x): x is SummaryRow => x !== null))
    } finally {
      setSummaryLoading(false)
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

  const [summYear, summMonth] = selectedDate.split('-').map(Number)
  const summDays = daysInMonth(summYear, summMonth)
  const summMonthName = new Date(summYear, summMonth - 1, 1).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className={`${styles.trackerPage} zone-action`}>
      <div className={styles.pageHeader}>
        <h2>Tracker</h2>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${view === 'log' ? styles.toggleActive : ''}`}
            onClick={() => setView('log')}
          >
            <ClipboardTextIcon size={14} weight="bold" /> Log
          </button>
          <button
            className={`${styles.toggleBtn} ${view === 'summary' ? styles.toggleActive : ''}`}
            onClick={() => setView('summary')}
          >
            <PresentationChartIcon size={14} weight="bold" /> Summary
          </button>
        </div>
      </div>

      <div className={styles.dateNav}>
        <button className={styles.dateBtn} onClick={() => shiftDate(-1)}><ArrowFatLineLeftIcon size={20} weight="bold" /></button>
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
        ><ArrowFatLineRightIcon size={20} weight="bold" /></button>
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
                      <CheckSquareIcon size={20} weight="bold" /> Completed
                    </button>
                  ) : (
                    <button
                      className={styles.btnMark}
                      onClick={() => handleIncrement(goal.id)}
                      disabled={busy}
                    >
                      <SquareIcon size={20} weight="bold" /> Complete
                    </button>
                  )
                ) : (
                  <div className={styles.countControls}>
                    <button
                      className={styles.btnCount}
                      onClick={() => handleDecrement(goal.id)}
                      disabled={busy || !todayEntry || todayEntry.count <= 0}
                    ><MinusCircleIcon size={20} weight="bold" /></button>
                    <span className={styles.countValue}>
                      {habit.trackingMode === 'cumulative' && habit.incrementAmount
                        ? fmtAmount((todayEntry?.count ?? 0) * habit.incrementAmount)
                        : (todayEntry?.count ?? 0)}
                    </span>
                    <button
                      className={styles.btnCount}
                      onClick={() => handleIncrement(goal.id)}
                      disabled={busy}
                    ><PlusCircleIcon size={20} weight="bold" /></button>
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

      {!loading && !error && view === 'summary' && (
        <div className={styles.summaryGrid}>
          <p className={styles.summaryGridMonthLabel}>{summMonthName}</p>
          {summaryLoading ? (
            <p className={styles.stateMsg}>Loading...</p>
          ) : (
            <div
              className={styles.habitGrid}
              style={{ gridTemplateColumns: `auto repeat(${summaryRows.length}, 44px)` }}
            >
              {/* Header row: empty corner + one habit label per column */}
              <div />
              {summaryRows.map(({ goal, habit }) => {
                return (
                  <div key={goal.id} className={styles.gridHabitLabel}>
                    <span>{habit.name}</span>
                  </div>
                )
              })}

              {/* One row per day */}
              {Array.from({ length: summDays }, (_, i) => {
                const dayNum = i + 1
                const dateStr = `${summYear}-${String(summMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                const isFuture = dateStr > today
                const isCurrentDay = dateStr === today
                return (
                  <React.Fragment key={dayNum}>
                    <button
                      className={[
                        styles.gridDayHeader,
                        isCurrentDay ? styles.gridDayHeaderToday : '',
                      ].filter(Boolean).join(' ')}
                      disabled={isFuture}
                      onClick={() => { setSelectedDate(dateStr); setView('log') }}
                    >
                      {dayNum}
                    </button>
                    {summaryRows.map(({ goal, loggedDates }) => {
                      const logged = loggedDates.has(dateStr)
                      return (
                        <div
                          key={goal.id}
                          className={[
                            styles.gridCell,
                            logged ? styles.gridCellLogged : '',
                            isCurrentDay ? styles.gridCellToday : '',
                            isFuture ? styles.gridCellFuture : '',
                          ].filter(Boolean).join(' ')}
                          onClick={isFuture ? undefined : () => { setSelectedDate(dateStr); setView('log') }}
                        />
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
