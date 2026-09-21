import VerseOfTheDayCard from '../../../components/cards/VerseOfTheDayCard'
import CurrentWeatherCard from '../../cards/CurrentWeatherCard'

function Dashboard() {
 return (
    <div className="dashboard">
      <div className="dashboard-row">
        <VerseOfTheDayCard />
        <CurrentWeatherCard />
      </div>
    </div>
  )
}

export default Dashboard
