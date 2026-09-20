import { useEffect, useState } from 'react'
import { getUserSettings } from '../../../services/userSettingsService'
import { getWeather, type WeatherData } from '../../../services/weatherService'

function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [unit, setUnit] = useState<'fahrenheit' | 'celsius'>('fahrenheit')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [visibleHours, setVisibleHours] = useState(6)

  useEffect(() => {
    const updateHours = () => {
      setVisibleHours(window.innerWidth < 675 ? 4 : 6)
    }
    updateHours()
    window.addEventListener('resize', updateHours)
    return () => window.removeEventListener('resize', updateHours)
  }, [])

  useEffect(() => {
    const load = async () => {
      const settings = await getUserSettings()

      if (!settings?.city) {
        setError('No city set. Please update your settings.')
        setLoading(false)
        return
      }

      setUnit(settings.weatherUnit)

      try {
        const data = await getWeather(settings.city)
        setWeather(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load weather data. Please try again later.')
      }

      setLoading(false)
    }

    load()
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const formatHour = (timeStr: string) => {
    const date = new Date(timeStr)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
  }

  if (loading) return <p>Loading weather...</p>
  if (error) return <p className="form-error">{error}</p>
  if (!weather) return null

  const { current, hourly, forecast } = weather
  const temp = unit === 'fahrenheit' ? `${current.temp_f}°F` : `${current.temp_c}°C`
  const feelsLike = unit === 'fahrenheit' ? `${current.feels_like_f}°F` : `${current.feels_like_c}°C`
  const wind = unit === 'fahrenheit' ? `${current.wind_mph} mph` : `${current.wind_kph} kph`

  return (
    <div className="weather">

      <div className="weather-top">
        <div className="card weather-current">
          <div className="weather-location">
            {current.city}, {current.region}
          </div>
          <div className="weather-main">
            <img src={current.condition_icon} alt={current.condition} className="weather-icon-lg" />
            <div className="weather-temp">{temp}</div>
          </div>
          <div className="weather-condition">{current.condition}</div>
          <div className="weather-details">
            <span>Feels like {feelsLike}</span>
            <span>Humidity {current.humidity}%</span>
            <span>Wind {wind}</span>
          </div>
        </div>

        <div className="card weather-hourly">
          {hourly.slice(0, visibleHours).map((h) => (
            <div key={h.time} className="weather-hourly-item">
              <div className="weather-hourly-time">{formatHour(h.time)}</div>
              <img src={h.condition_icon} alt={h.condition} className="weather-icon-sm" />
              <div className="weather-hourly-temp">
                {unit === 'fahrenheit' ? `${h.temp_f}°F` : `${h.temp_c}°C`}
              </div>
              <div className="weather-hourly-rain">{h.chance_of_rain}% rain</div>
            </div>
          ))}
        </div>
      </div>

      <div className="weather-forecast">
        {forecast.map((day) => (
          <div key={day.date} className="card weather-forecast-day">
            <div className="weather-forecast-date">{formatDate(day.date)}</div>
            <img src={day.condition_icon} alt={day.condition} className="weather-icon-sm" />
            <div className="weather-forecast-condition">{day.condition}</div>
            <div className="weather-forecast-temps">
              <span className="weather-high">
                {unit === 'fahrenheit' ? `${day.max_temp_f}°F` : `${day.max_temp_c}°C`}
              </span>
              <span className="weather-low">
                {unit === 'fahrenheit' ? `${day.min_temp_f}°F` : `${day.min_temp_c}°C`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Weather
