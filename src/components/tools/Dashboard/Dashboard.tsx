// import { useContext } from 'react'
import VerseOfTheDayCard from '../../../components/cards/VerseOfTheDayCard'
import CurrentWeatherCard from '../../cards/CurrentWeatherCard'
import { TasksCard } from '../../cards/TasksCard'
import { TrackerCard } from '../../cards/TrackerCard'
import { LinksCard } from '../../cards/LinksCard'
import { type Tool } from '../../common/Sidebar'
import styles from './Dashboard.module.css'

interface DashboardProps {
  onNavigate?: (tool: Tool) => void
}

function Dashboard({ onNavigate }: DashboardProps) {
 return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardColumn}>
        <TasksCard onNavigate={onNavigate} />
        <TrackerCard onNavigate={onNavigate} />
      </div>
      <div className={`${styles.dashboardColumn} ${styles.columnRight}`}>
        <VerseOfTheDayCard />
        <CurrentWeatherCard />
        <LinksCard onNavigate={onNavigate} />
      </div>
    </div>
  )
}

export default Dashboard
