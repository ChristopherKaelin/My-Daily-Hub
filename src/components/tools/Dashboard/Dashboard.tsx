// import { useContext } from 'react'
import VerseOfTheDayCard from '../../../components/cards/VerseOfTheDayCard'
import CurrentWeatherCard from '../../cards/CurrentWeatherCard'
import { TasksCard } from '../../cards/TasksCard'
import styles from './Dashboard.module.css'

// We'll need to pass the navigation function as a prop from App
interface DashboardProps {
  onNavigate?: (tool: string) => void
}

function Dashboard({ onNavigate }: DashboardProps) {
 return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardRow}>
        <VerseOfTheDayCard />
        <CurrentWeatherCard />
      </div>
      <div className={styles.dashboardRow}>
        <TasksCard onNavigate={onNavigate} />
      </div>
    </div>
  )
}

export default Dashboard
