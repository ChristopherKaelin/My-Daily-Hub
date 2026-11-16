import { useState, useEffect } from 'react'
import { getHabits } from '../../services/habitsService'
import { getAllGoals, getActiveGoals } from '../../services/goalsService'
import { getProgressInRange } from '../../services/progressService'
import { type Habit, type Goal, type ProgressEntry } from '../../types'
import { type Tool } from '../common/Sidebar'
import { ICON_REGISTRY } from '../../data/iconRegistry'
import {
  getFirstDayOfPeriod,
  getLastDayOfPeriod,
  computeProgressPercent,
} from '../../utils/habitFormatting'
import styles from './Card.module.css'

interface TrackerCardProps {
  onNavigate?: (tool: Tool) => void
}

interface CardItem {
  goal: Goal
  habit: Habit
  periodEntries: ProgressEntry[]
  pct: number
}

function goalProgressLabel(goal: Goal, habit: Habit, periodEntries: ProgressEntry[]): string {
  const totalCount = periodEntries.reduce((sum, e) => sum + e.count, 0)
  if (goal.period === 'day') {
    if (habit.trackingMode === 'cumulative' && habit.incrementAmount && habit.unit) {
      const current = (totalCount * habit.incrementAmount).toFixed(1).replace(/\.0$/, '')
      return `${current} ${habit.unit}`
    }
    return totalCount > 0 ? 'Done' : 'Not done'
  }
  if (habit.trackingMode === 'cumulative' && habit.incrementAmount && habit.unit) {
    const current = (totalCount * habit.incrementAmount).toFixed(1).replace(/\.0$/, '')
    return `${current} / ${goal.targetValue} ${habit.unit}`
  }
  return `${totalCount} / ${goal.targetValue}`
}

function barColor(pct: number): string {
  if (pct >= 100) return 'var(--track-accent)'
  if (pct >= 67) return '#55B4C4'
  if (pct >= 34) return '#E0A83A'
  return 'var(--track-secondary)'
}

export function TrackerCard({ onNavigate }: TrackerCardProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [items, setItems] = useState<CardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const [habits, allGoals] = await Promise.all([getHabits(), getAllGoals()])
      const activeGoals = getActiveGoals(allGoals, today)
      const habitMap = new Map(habits.map((h) => [h.id, h]))

      const loaded = await Promise.all(
        activeGoals.map(async (goal) => {
          const habit = habitMap.get(goal.habitId)
          if (!habit) return null
          const from = getFirstDayOfPeriod(today, goal.period)
          const to = getLastDayOfPeriod(today, goal.period)
          const periodEntries = await getProgressInRange(goal.id, from, to)
          const pct = computeProgressPercent(periodEntries, goal, today, habit.incrementAmount ?? undefined)
          return { goal, habit, periodEntries, pct }
        }),
      )

      setItems(loaded.filter((x): x is CardItem => x !== null))
    } catch (err) {
      setError('Failed to load goals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`${styles.card} zone-action`}>
        <h3 className={styles.cardTitle}>Today's Goals</h3>
        <p className={styles.cardLoading}>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.card} zone-action`}>
        <h3 className={styles.cardTitle}>Today's Goals</h3>
        <p className={styles.cardError}>{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={`${styles.card} zone-action`}>
        <h3 className={styles.cardTitle}>Today's Goals</h3>
        <p className={styles.cardEmpty}>No active goals today.</p>
      </div>
    )
  }

  return (
    <div className={`${styles.card} zone-action`}>
      <button className={styles.cardTitleButton} onClick={() => onNavigate?.('tracker')}>
        <h3 className={styles.cardTitle}>Today's Goals</h3>
      </button>
      <ul className={styles.trackerGoalList}>
        {items.map(({ goal, habit, periodEntries, pct }, index) => {
          const IconComp = ICON_REGISTRY[goal.iconKey]
          const progressLabel = goalProgressLabel(goal, habit, periodEntries)
          return (
            <li key={goal.id}>
              <div className={styles.trackerGoalRow}>
                <div className={styles.trackerGoalInfo}>
                  {IconComp && (
                    <IconComp size={16} weight="duotone" className={styles.trackerGoalIcon} />
                  )}
                  <div className={styles.trackerGoalText}>
                    <span className={styles.trackerGoalName}>{habit.name}</span>
                    <span className={styles.trackerProgressLabel}>{progressLabel}</span>
                  </div>
                  {pct >= 100 && <span className={styles.trackerDoneBadge}>✓</span>}
                </div>
                <div className={styles.trackerBarWrap}>
                  <div className={styles.trackerBarTrack}>
                    <div
                      className={styles.trackerBarFill}
                      style={{ width: `${pct}%`, backgroundColor: barColor(pct) }}
                    />
                  </div>
                  <span className={styles.trackerBarPct}>{pct}%</span>
                </div>
              </div>
              {index < items.length - 1 && <div className={styles.taskDivider} />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
